import org.jetbrains.kotlin.gradle.dsl.Coroutines
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile


plugins {
    kotlin("jvm").version("1.2.71")
    kotlin("plugin.noarg").version("1.2.71")
    application
}

application {
    applicationName = "timer"
    mainClassName = "fi.apomelov.timer.MainKt"
}

kotlin {
    experimental {
        coroutines = Coroutines.ENABLE
    }
}

noArg {
    annotation("javax.persistence.Entity")
}

val springBootVersion = "2.0.5.RELEASE"
val springBootStarters = listOf("web", "jdbc")

dependencies {

//    implementation(project(":client"))

    implementation(kotlin("stdlib-jdk8"))
    implementation(kotlin("reflect"))

    springBootStarters.forEach { kit ->
        implementation("org.springframework.boot", "spring-boot-starter-$kit", springBootVersion)
    }

    implementation("com.fasterxml.jackson.module", "jackson-module-kotlin", "2.9.6")

    implementation("com.h2database", "h2", "1.4.197")
    implementation("org.liquibase", "liquibase-core", "3.6.2")
    implementation("joda-time", "joda-time", "2.10")
    implementation("org.jetbrains.exposed", "exposed", "0.10.5")

    implementation("com.1stleg", "jnativehook", "2.1.0")

}

tasks {
    withType(KotlinCompile::class) {
        kotlinOptions {
            jvmTarget = "1.8"
        }
    }
}
