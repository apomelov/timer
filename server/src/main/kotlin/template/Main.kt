package template

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import javax.annotation.PostConstruct


@Component
class JacksonMapper : ObjectMapper() {

    @PostConstruct
    fun init() {
        registerModule(KotlinModule())
    }

}

@RestController
class DataController {

    @GetMapping("/api/data")
    fun getData() = "Data, yeah!".also { Thread.sleep(2000) }

}

@SpringBootApplication
open class ApplicationContext


fun main(args: Array<String>) {

    SpringApplication.run(ApplicationContext::class.java)

}

