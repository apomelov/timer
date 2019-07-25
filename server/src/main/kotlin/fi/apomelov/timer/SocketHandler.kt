package fi.apomelov.timer

import com.fasterxml.jackson.annotation.JsonValue
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap


enum class PatchOp(val value: String) {
    ADD("add"), REPLACE("replace"), REMOVE("remove");

    @JsonValue fun toValue() = value
}

class Patch(val op: PatchOp, val path: String, val value: Any? = null)

@Component
class SocketHandler : TextWebSocketHandler() {

    val log: Logger = LoggerFactory.getLogger(SocketHandler::class.java)
    val listeners = ConcurrentHashMap<String, WebSocketSession>()

    @Autowired
    lateinit var mapper: ObjectMapper

    override fun afterConnectionEstablished(session: WebSocketSession) {
        log.info("Connected websocket listener: ${session.id}")
        listeners[session.id] = session
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        log.info("Disconnected websocket listener: ${session.id}")
        listeners.remove(session.id)
    }

    fun sendMessage(patch: Patch) = sendMessage(listOf(patch))

    fun sendMessage(patches: List<Patch>) = listeners.values.forEach {
        it.sendMessage(TextMessage(mapper.writeValueAsString(patches)))
    }

}
