package fi.apomelov.timer

import fi.apomelov.timer.PatchOp.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime.now
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus.*
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/fields")
class TaskFieldsController {

    @Autowired lateinit var socket: SocketHandler

    @PostMapping("/refresh")
    @ResponseStatus(NO_CONTENT)
    fun getCustomFields() = transaction {
        val fields = CustomField.selectAll().map(::CustomFieldTO)
        val patch = Patch(REPLACE, "$.fields", fields)
        socket.sendMessage(patch)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(NO_CONTENT)
    fun deleteCustomField(@PathVariable id: Long) = transaction {
        CustomField.deleteWhere { CustomField.id.eq(id) }
        val patch = Patch(REMOVE, "$.fields[?(@.id == $id)]")
        socket.sendMessage(patch)
    }

}


@RestController
@RequestMapping("/api/tasks")
open class TasksController {

    @Autowired lateinit var socket: SocketHandler

    @Autowired lateinit var taskService: TaskService

    @PostMapping("/refresh")
    @ResponseStatus(ACCEPTED)
    fun refreshTasks() {
        val tasks = taskService.getTasks()
        val patch = Patch(REPLACE, "$.tasks", tasks)
        socket.sendMessage(patch)
    }

    @PostMapping
    @ResponseStatus(CREATED)
    fun createTask(@RequestBody task: NewTaskTO) {
        val newTask = taskService.createTask(task.title, task.fields)
        val patch = Patch(ADD, "$.tasks.0", newTask)
        socket.sendMessage(patch)
    }

}


@RestController
@RequestMapping("/api/tasks/{id}")
open class TaskController {

    @Autowired lateinit var socket: SocketHandler

    @Autowired lateinit var taskService: TaskService
    @Autowired lateinit var segmentsService: TimeSegmentService

    @PostMapping("/close")
    @ResponseStatus(ACCEPTED)
    fun closeTask(@PathVariable id: Long) {
        val closedAt = taskService.closeTask(id)
        val patch = Patch(REPLACE, "$.tasks[?(@.id == $id)].closedAt", closedAt)
        socket.sendMessage(patch)
    }

    @PostMapping("/reopen")
    @ResponseStatus(ACCEPTED)
    fun reopenTask(@PathVariable id: Long) {
        taskService.reopenTask(id)
        val patch = Patch(REPLACE, "$.tasks[?(@.id == $id)].closedAt", null)
        socket.sendMessage(patch)
    }

    @PostMapping("/update")
    @ResponseStatus(ACCEPTED)
    fun updateTask(@PathVariable id: Long, @RequestBody task: NewTaskTO) {
        val modifiedTask = taskService.updateTask(id, task.title, task.fields)
        val patch = Patch(REPLACE, "$.tasks[?(@.id == $id)]", modifiedTask)
        socket.sendMessage(patch)
    }

    @PostMapping("/start")
    @ResponseStatus(ACCEPTED)
    fun startTiming(@PathVariable id: Long): Unit = transaction {
        val now = now()
        val newSegment = segmentsService.startTiming(id)
        val patch = listOf(
                Patch(REPLACE, "$.tasks[?(@.active)].active", false),
                Patch(REPLACE, "$.tasks[?(@.id == $id)].active", true),
                Patch(REPLACE, "$.segments[?(@.end == null)].end", now.millis),
                Patch(ADD, "$.segments.0", newSegment)
        )
        socket.sendMessage(patch)
    }

    @PostMapping("/stop")
    @ResponseStatus(ACCEPTED)
    fun stopTiming() {
        val end = segmentsService.stopTiming()
        val patch = listOf(
                Patch(REPLACE, "$.tasks[?(@.active)].active", false),
                Patch(REPLACE, "$.segments[?(@.end == null)].end", end.millis)
        )
        socket.sendMessage(patch)
    }

    @PostMapping("/delete")
    @ResponseStatus(ACCEPTED)
    fun delete(@PathVariable id: Long): Unit = transaction {
        val removeSegments = TimeSegment
                .slice(TimeSegment.id)
                .select { TimeSegment.task.eq(id) }
                .map { it[TimeSegment.id].value }
                .map { Patch(REMOVE, "$.segments[?(@.id == $it)]") }

        taskService.deleteTask(id)

        val patch = listOf(
                Patch(REMOVE, "$.tasks[?(@.id == $id)]")
        ) + removeSegments

        socket.sendMessage(patch)
    }

}


data class Interval(val start: Long, val end: Long)

@RestController
@RequestMapping("/api/segments")
class TimeController {

    @Autowired lateinit var socket: SocketHandler

    @Autowired lateinit var taskService: TaskService
    @Autowired lateinit var segmentService: TimeSegmentService

    @PostMapping("/refresh")
    @ResponseStatus(ACCEPTED)
    fun refreshSegments(@RequestBody interval: Interval) {
        val segments = segmentService.getSegments(interval.start, interval.end)
        val patch = Patch(REPLACE, "$.segments", segments)
        socket.sendMessage(patch)
    }

    @PostMapping("/{id}/move")
    @ResponseStatus(ACCEPTED)
    fun moveSegment(@PathVariable id: Long, @RequestBody task: Long) {
        segmentService.move(id, task)
        val taskTitle = taskService.getTask(task)?.title
        val patch = arrayListOf(
                Patch(REPLACE, "$.segments[?(@.id == $id)].taskTitle", taskTitle)
        )
        transaction {
            val end = TimeSegment
                    .slice(TimeSegment.id, TimeSegment.end)
                    .select { TimeSegment.id.eq(id) }
                    .first()[TimeSegment.end]

            if (end == null) {
                patch.add(Patch(REPLACE, "$.tasks[?(@.active)].active", false))
                patch.add(Patch(REPLACE, "$.tasks[?(@.id == $task)].active", true))
            }
        }
        socket.sendMessage(patch)
    }

}

data class SettingsTO(
        val deleteTaskImmediately: Boolean = false,
        val deleteTimeImmediately: Boolean = false,
        val jiraLogin: String = "",
        val jiraAuthHeader: String = ""
) {
    constructor(settings: Map<String, ResultRow>): this(
            deleteTaskImmediately = settings["deleteTaskImmediately"]?.let { it[Settings.booleanValue] } ?: false,
            deleteTimeImmediately = settings["deleteTimeImmediately"]?.let { it[Settings.booleanValue] } ?: false,
            jiraLogin = settings["jiraLogin"]?.let { it[Settings.stringValue] } ?: "",
            jiraAuthHeader = settings["jiraAuthHeader"]?.let { it[Settings.stringValue] } ?: ""
    )
}

@RestController
@RequestMapping("/api/settings")
class SettingsController {

    @Autowired lateinit var socket: SocketHandler
    
    @PostMapping("/refresh")
    @ResponseStatus(ACCEPTED)
    fun refreshSettings() = transaction {
        socket.sendMessage(Settings
                .selectAll()
                .associateBy { it[Settings.key] }
                .let(::SettingsTO)
                .let { Patch(REPLACE, "$.settings", it) })
    }

    @PostMapping("/update")
    @ResponseStatus(ACCEPTED)
    fun updateSettings(@RequestBody settings: SettingsTO) = transaction {
        Settings.deleteAll()
        Settings["deleteTaskImmediately"] = settings.deleteTaskImmediately
        Settings["deleteTimeImmediately"] = settings.deleteTimeImmediately
        Settings["jiraLogin"] = settings.jiraLogin
        Settings["jiraAuthHeader"] = settings.jiraAuthHeader
        socket.sendMessage(Patch(REPLACE, "$.settings", settings))
    }

}


@RestController
@RequestMapping("/api/search")
class SearchController {

    @Autowired
    lateinit var jiraApi: JiraApi

    @GetMapping
    fun search(@RequestParam query: String) =
        jiraApi.search(query).fold({
            Pair(it.total, if (it.total <= 10) it.issues else it.issues.slice(0..9))
        }, {
            throw it
        })

}
