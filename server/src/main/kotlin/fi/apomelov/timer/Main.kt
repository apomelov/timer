package fi.apomelov.timer

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.jetbrains.exposed.sql.Database
import org.joda.time.DateTime
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.context.annotation.Bean
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap
import javax.annotation.PostConstruct
import javax.sql.DataSource
import javax.swing.UIManager.getSystemLookAndFeelClassName
import javax.swing.UIManager.setLookAndFeel


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


@Component
class Notificator : TextWebSocketHandler() {

    val log = LoggerFactory.getLogger(Notificator::class.java)

    private val listeners = ConcurrentHashMap<String, WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        log.info("Connected websocket listener: ${session.id}")
        listeners[session.id] = session
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        log.info("Disconnected websocket listener: ${session.id}")
        listeners.remove(session.id)
    }

    fun notifyRefreshAll() = listeners.values.forEach {
        it.sendMessage(TextMessage("{ }"))
    }

}

@SpringBootApplication
@EnableScheduling
@EnableWebSocket
open class ApplicationContext : WebSocketConfigurer {

    @Autowired
    lateinit var dataSource: DataSource

    @Autowired
    lateinit var notificator: Notificator

    @Bean
    open fun database() = Database.connect(dataSource)

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(notificator, "/socket")
    }

}

fun main(args: Array<String>) {

    SpringApplicationBuilder(ApplicationContext::class.java)
            .headless(false)
            .run(*args)

    try {
        setLookAndFeel(getSystemLookAndFeelClassName())
    } catch (e: Exception) {
        e.printStackTrace()
    }

}
