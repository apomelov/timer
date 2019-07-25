package fi.apomelov.timer

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
import org.joda.time.DateTime.now
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.lang.RuntimeException


data class CustomFieldTO(val id: Long, val title: String, val match: String?, val replace: String?) {
    constructor(rr: ResultRow):
            this(rr[CustomField.id].value, rr[CustomField.title], rr[CustomField.match], rr[CustomField.replace])
}

data class TaskTO(val id: Long, val title: String, val closedAt: DateTime?, val active: Boolean, val customFields: MutableMap<Long, String?>) {
    constructor(rr: ResultRow):
            this(rr[Task.id].value, rr[Task.title], rr[Task.closedAt], rr[TimeSegment.id] != null, hashMapOf())
}

data class TimeSegmentTO(val id: Long, val taskTitle: String, val start: DateTime, val end: DateTime?) {
    constructor(rr: ResultRow):
            this(rr[TimeSegment.id].value, rr[Task.title], rr[TimeSegment.start], rr[TimeSegment.end])
}


@Component
class TaskService {

    @Autowired
    lateinit var database: Database

    private fun taskWithFields() = Task
            .join(CustomFieldValue, JoinType.LEFT, Task.id, CustomFieldValue.task)
            .join(TimeSegment, JoinType.LEFT, Task.id, TimeSegment.task) { TimeSegment.end.isNull() }
            .slice(Task.id, Task.title, Task.closedAt, CustomFieldValue.id, CustomFieldValue.field, CustomFieldValue.value, TimeSegment.id)

    private fun Query.mapTasks() = groupBy { it[Task.id] }
            .mapValues { (_, fields) ->
                TaskTO(fields.first()).also { task ->
                    fields.filter { it[CustomFieldValue.id] != null }
                            .forEach {
                                task.customFields[it[CustomFieldValue.field].value] = it[CustomFieldValue.value]
                            }
                }
            }
            .values
            .toList()

    fun getTask(id: Long) = transaction(database) {
        taskWithFields().select { Task.id.eq(id) }.mapTasks().firstOrNull()
    }

    fun getTasks() = transaction(database) {
        taskWithFields().select { Task.closedAt.isNull() or Task.closedAt.greaterEq(now().minusDays(7)) }.mapTasks()
    }

    fun getAllTasks() = transaction(database) {
        taskWithFields().selectAll().mapTasks()
    }

    fun closeTask(id: Long) = transaction(database) {
        Task.update({ Task.id.eq(id) }) {
            it[Task.closedAt] = now()
        }
    }

    fun reopenTask(id: Long) = transaction(database) {
        Task.update({ Task.id.eq(id) }) {
            it[Task.closedAt] = null
        }
    }

}

@Component
class TimeSegmentService {

    @Autowired
    lateinit var database: Database

    fun getTimeSegments(select: FieldSet.() -> Query = FieldSet::selectAll) = transaction(database) {
        TimeSegment
                .join(Task, JoinType.LEFT, TimeSegment.task, Task.id)
                .slice(TimeSegment.id, Task.title, TimeSegment.start, TimeSegment.end)
                .select()
                .map(::TimeSegmentTO)
    }

    fun stopTiming(at: DateTime = now()) = transaction(database) {
        TimeSegment.update({ TimeSegment.end.isNull() }) {
            it[TimeSegment.end] = at
        }
    }

    fun startTiming(taskId: Long, at: DateTime = now()) = transaction(database) {
        if (TimeSegment.select { TimeSegment.end.isNull() }.count() > 0) {
            throw RuntimeException("There are unstopped timings")
        }
        TimeSegment.insert {
            it[TimeSegment.task] = EntityID(taskId, Task)
            it[TimeSegment.start] = at
        }
    }

}
