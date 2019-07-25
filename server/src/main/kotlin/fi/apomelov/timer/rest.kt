package fi.apomelov.timer

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.between
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
import org.joda.time.DateTime.now
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api")
annotation class ApiController


@ApiController
class TaskFieldsController {

    @GetMapping("/customFields")
    fun getCustomFields() = transaction {
        CustomField.selectAll().map(::CustomFieldTO)
    }

    @DeleteMapping("/customFields/{id}")
    fun deleteCustomField(@PathVariable id: Long) = transaction {
        CustomField.deleteWhere { CustomField.id.eq(id) }
    }

}

@ApiController
open class TaskController {

    @Autowired
    lateinit var taskService: TaskService

    @Autowired
    lateinit var timeSegmentService: TimeSegmentService

    @GetMapping("/tasks")
    fun getTasks() = taskService.getTasks()

    @GetMapping("/allTasks")
    fun getAllTasks() = taskService.getAllTasks()

    @PostMapping("/tasks/{id}/close")
    fun closeTask(@PathVariable id: Long) = transaction {
        taskService.closeTask(id)
        taskService.getTask(id)
    }

    @PostMapping("/tasks/{id}/reopen")
    fun reopenTask(@PathVariable id: Long) = transaction {
        taskService.reopenTask(id)
        taskService.getTask(id)
    }

    @PostMapping("/tasks/{id}/startTiming")
    fun startTiming(@PathVariable id: Long): Unit = transaction {
        timeSegmentService.stopTiming()
        timeSegmentService.startTiming(id)
    }

    @PostMapping("/tasks/{id}/stopTiming")
    fun stopTiming(): Unit = transaction {
        timeSegmentService.stopTiming()
    }

}

@ApiController
class TimeController {

    @Autowired
    lateinit var timeSegmentService: TimeSegmentService

    @GetMapping("/timeSegments")
    fun getIntervals(@RequestParam start: Long,
                     @RequestParam end: Long,
                     @RequestParam(required = false) task: Long?) = timeSegmentService.getTimeSegments {

        select {  TimeSegment.start.between(DateTime(start), DateTime(end)) }
                .also { q ->
                    if (task != null) {
                        q.andWhere { TimeSegment.task.eq(task) }
                    }
                }
    }

}
