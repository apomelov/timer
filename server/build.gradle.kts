import org.jetbrains.kotlin.gradle.dsl.Coroutines
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile


plugins {
    kotlin("jvm").version("1.3.0")
    kotlin("plugin.noarg").version("1.3.0")
    application
}

application {
    applicationName = "timer"
    mainClassName = "fi.apomelov.timer.MainKt"
}

noArg {
    annotation("javax.persistence.Entity")
}

val springBootVersion = "2.0.5.RELEASE"
val springBootStarters = listOf("jdbc", "web", "websocket")

dependencies {

//    compile(project(":client"))

    compile(kotlin("stdlib-jdk8"))
    compile(kotlin("reflect"))

    springBootStarters.forEach { kit ->
        compile("org.springframework.boot", "spring-boot-starter-$kit", springBootVersion)
    }

    compile("com.fasterxml.jackson.module", "jackson-module-kotlin", "2.9.6")

    compile("com.h2database", "h2", "1.4.197")
    compile("org.liquibase", "liquibase-core", "3.6.2")
    compile("joda-time", "joda-time", "2.10")
    compile("org.jetbrains.exposed", "exposed", "0.10.5")

    compile("com.1stleg", "jnativehook", "2.1.0")
    compile("com.dorkbox", "SystemTray", "3.15")

    compile("com.github.kittinunf.fuel", "fuel", "1.15.1")
    compile("com.github.kittinunf.fuel", "fuel-jackson", "1.15.1")


}

tasks {
    withType(KotlinCompile::class) {
        kotlinOptions {
            jvmTarget = "1.8"
        }
    }
}
