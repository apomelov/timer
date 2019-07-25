import com.moowork.gradle.node.npm.NpmTask

plugins {
    java
    id("com.moowork.node").version("1.2.0")
}

node {
    download = true
}

val generatedResources = buildDir.resolve("generated-resources")

java {
    sourceSets["main"].resources.srcDirs(generatedResources)
}

tasks {
    val npmBuild by creating(NpmTask::class) {
        group = "node"
        dependsOn("npmInstall")
        setArgs(listOf("run", "build"))
        inputs.dir(projectDir.resolve("src"))
        inputs.files(listOf("index.html", "package.json", "webpack.config.js").map { projectDir.resolve(it) })
        outputs.dir(generatedResources.resolve("static"))
    }
    withType(ProcessResources::class.java) {
        dependsOn(npmBuild)
    }
}
