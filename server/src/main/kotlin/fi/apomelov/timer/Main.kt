package fi.apomelov.timer

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.jetbrains.exposed.sql.Database
import org.joda.time.DateTime
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.stereotype.Component
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
open class ApplicationContext {

    @Autowired
    lateinit var dataSource: DataSource

    @Bean
    open fun database() = Database.connect(dataSource)

}


fun main(args: Array<String>) {

    SpringApplication.run(ApplicationContext::class.java)

}

