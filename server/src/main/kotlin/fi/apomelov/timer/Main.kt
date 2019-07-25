package fi.apomelov.timer

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.jetbrains.exposed.sql.Database
import org.joda.time.DateTime
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.context.annotation.Bean
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.stereotype.Component
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import javax.annotation.PostConstruct
import javax.sql.DataSource


@Component
class DateTimeSerializer : JsonSerializer<DateTime>() {

    override fun handledType() = DateTime::class.java

    override fun serialize(value: DateTime, gen: JsonGenerator, serializers: SerializerProvider) {
        gen.writeNumber(value.millis)
    }

}

@Component
class JacksonMapper : ObjectMapper() {

    @Autowired
    lateinit var serializers: List<JsonSerializer<*>>

    @PostConstruct
    fun init() = KotlinModule()
            .also { m -> serializers.forEach { m.addSerializer(it) } }
            .let { registerModule(it) }

}

@SpringBootApplication
@EnableScheduling
@EnableWebSocket
open class ApplicationContext : WebSocketConfigurer {

    @Autowired
    lateinit var dataSource: DataSource

    @Autowired
    lateinit var socketHandler: SocketHandler

    @Bean
    open fun database() = Database.connect(dataSource)

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(socketHandler, "/socket")
    }

}

fun main(args: Array<String>) {

    SpringApplicationBuilder(ApplicationContext::class.java)
            .headless(false)
            .run(*args)
//
//    try {
//        setLookAndFeel(getSystemLookAndFeelClassName())
//    } catch (e: Exception) {
//        e.printStackTrace()
//    }



//    val systemTray = SystemTray.get() ?: throw RuntimeException("Unable to load SystemTray!")
//
//    val image = BufferedImage(16, 16, BufferedImage.TYPE_INT_ARGB)
//    val g2d = image.createGraphics()
//    g2d.drawString("%", 0, 16)
//    g2d.dispose()
//    systemTray.setImage(image)
//    systemTray.status = "Not Running";
//
//
//    systemTray.getMenu().add(MenuItem("Quit") { systemTray.shutdown() })
    //.setShortcut('q'); // case does not matter
}

//sealed class JiraApi : FuelRouting {
//    override val basePath = "http://jira.leiki.com:8800/Jira/rest/api/2"
//    override val headers = mapOf("Authorization" to "Basic YWxleGV5OldlbGNvbWVfdG9fT3BlbldheS4=")
//    override val params = emptyList<Pair<String, String>>()
//    override val method = GET
//    override val body = null
//    override val bytes = null
//}
//
//open class JiraIssueApi : JiraApi() {
//    override val path = "/issue"
//
//    companion object {
//        fun byKey(issueKey: String) = object : JiraIssueApi() {
//            override val path = "${super.path}/$issueKey"
//            override val params = super.params + listOf("fields" to "summary")
//        }
//    }
//
//}
//
//open class JiraSearchApi : JiraApi() {
//    override val path = "/search"
//    companion object {
//        fun search(query: String) = object : JiraSearchApi() {
//            override val params = super.params + listOf("fields" to "summary", "jql" to "summary ~ \"$query\"")
//        }
//    }
//}