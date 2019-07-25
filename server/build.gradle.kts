import org.jetbrains.kotlin.gradle.dsl.Coroutines
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm").version("1.2.71")
    application
    id("com.bmuschko.docker-java-application").version("3.6.2")
}

application {
    applicationName = "client-server"
    mainClassName = "template/MainKt"
}

kotlin {
    experimental {
        coroutines = Coroutines.ENABLE
    }
}

val springBootVersion = "2.0.5.RELEASE"
val springBootStarters = listOf("web")

dependencies {

    implementation(project(":client"))

    implementation(kotlin("stdlib-jdk8"))
    implementation(kotlin("reflect"))

    springBootStarters.forEach { kit ->
        implementation("org.springframework.boot", "spring-boot-starter-$kit", springBootVersion)
    }

    implementation("com.fasterxml.jackson.module", "jackson-module-kotlin", "2.9.6")

}

tasks {
    withType(KotlinCompile::class) {
        kotlinOptions {
            jvmTarget = "1.8"
        }
    }
}
