package fi.apomelov.timer

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
import org.joda.time.DateTime.now
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.lang.RuntimeException

@RestController
@RequestMapping("/api")
annotation class ApiController


data class CustomField(val id: Long, val title: String, val match: String?, val replace: String?) {
    constructor(rr: ResultRow):
        this(rr[TaskField.id].value, rr[TaskField.title], rr[TaskField.match], rr[TaskField.replace])
}

data class TaskTO(val id: Long, val title: String, val closedAt: DateTime?, val active: Boolean, val customFields: MutableMap<Long, String?>) {
    constructor(rr: ResultRow):
        this(rr[Task.id].value, rr[Task.title], rr[Task.closedAt], rr[TimeInterval.id] != null, hashMapOf())
}

data class TimeIntervalTO(val id: Long, val taskTitle: String, val start: DateTime, val end: DateTime?) {
    constructor(rr: ResultRow):
        this(rr[TimeInterval.id].value, rr[Task.title], rr[TimeInterval.start], rr[TimeInterval.end])
}


@ApiController
class TaskFieldsController {

    @GetMapping("/customFields")
    fun getCustomFields() = transaction {
        TaskField.selectAll().map(::CustomField)
    }

    @DeleteMapping("/customFields/{id}")
    fun deleteCustomField(@PathVariable id: Long) = transaction {
        TaskField.deleteWhere { TaskField.id.eq(id) }
    }

}

@ApiController
open class TaskController {

    private fun Query.convert() = this
            .map(::TaskTO)
            .also { tasks ->
                val ids = tasks.map { it.id }
                val customFields = TaskFieldValue
                        .select { TaskFieldValue.task.inList(ids) }
                        .groupBy { it[TaskFieldValue.task] }
                        .mapKeys { (entityId, _) -> entityId.value }

                tasks.forEach { task ->
                    customFields[task.id]?.forEach {
                        task.customFields[it[TaskFieldValue.field].value] = it[TaskFieldValue.value]
                    }
                }
            }

    @GetMapping("/tasks")
    fun getTasks() = transaction {
        Task.join(TimeInterval, JoinType.LEFT, TimeInterval.task, Task.id) { TimeInterval.end.isNull() }
                .slice(Task.id, Task.title, Task.closedAt, TimeInterval.id)
                .select { Task.closedAt.isNull() or Task.closedAt.greaterEq(now().minusDays(7)) }
                .convert()
    }

    @GetMapping("/allTasks")
    fun getAllTasks() = transaction {
        Task.join(TimeInterval, JoinType.LEFT, TimeInterval.task, Task.id) { TimeInterval.end.isNull() }
                .slice(Task.id, Task.title, Task.closedAt, TimeInterval.id)
                .selectAll()
                .convert()
    }

    @PostMapping("/tasks/{id}/close")
    fun closeTask(@PathVariable id: Long) = transaction {
        Task.update({ Task.id.eq(id) and Task.closedAt.isNull() }) {
            it[Task.closedAt] = now()
        }
        Task.join(TimeInterval, JoinType.LEFT, TimeInterval.task, Task.id) { TimeInterval.end.isNull() }
                .slice(Task.id, Task.title, Task.closedAt, TimeInterval.id)
                .select { Task.id.eq(id) }
                .convert()
                .firstOrNull() ?: throw NotFoundException()
    }

    @PostMapping("/tasks/{id}/reopen")
    fun reopenTask(@PathVariable id: Long) = transaction {
        Task.update({ Task.id.eq(id) and Task.closedAt.isNotNull() }) {
            it[Task.closedAt] = null
        }
        Task.join(TimeInterval, JoinType.LEFT, TimeInterval.task, Task.id) { TimeInterval.end.isNull() }
                .slice(Task.id, Task.title, Task.closedAt, TimeInterval.id)
                .select { Task.id.eq(id) }
                .convert()
                .firstOrNull() ?: throw NotFoundException()
    }

    @PostMapping("/tasks/{id}/startTiming")
    fun startTiming(@PathVariable id: Long) = transaction {
        stopTiming()
        TimeInterval.insert {
            it[TimeInterval.task] = EntityID(id, Task)
            it[TimeInterval.start] = now()
        }
    }

    @PostMapping("/tasks/{id}/stopTiming")
    fun stopTiming() = transaction {
        TimeInterval.update({ TimeInterval.end.isNull() }) {
            it[TimeInterval.end] = now()
        }
    }

}

@ResponseStatus(HttpStatus.NOT_FOUND)
class NotFoundException : RuntimeException()

@ApiController
class TimeController {

    @GetMapping("/intervals")
    fun getIntervals(@RequestParam start: Long, @RequestParam end: Long) = transaction {

        val startDate = DateTime(start)
        val endDate = DateTime(end)

        TimeInterval.leftJoin(Task, { TimeInterval.task }, { Task.id })
                .slice(TimeInterval.id, Task.title, TimeInterval.start, TimeInterval.end)
                .select { TimeInterval.start.between(startDate, endDate) }
                .map(::TimeIntervalTO)

    }

}