package fi.apomelov.timer

import org.jetbrains.exposed.dao.EntityID
import org.jetbrains.exposed.dao.LongIdTable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ReferenceOption.CASCADE
import org.jetbrains.exposed.sql.insert
import org.joda.time.DateTime


object Task : LongIdTable("task") {
    val title: Column<String> = varchar("title", 1024).index()
    val closedAt: Column<DateTime?> = datetime("closed_at").nullable()
}

object CustomField : LongIdTable("custom_field") {
    val title: Column<String> = varchar("title", 1024)
    val match: Column<String?> = varchar("match", 1024).nullable()
    val replace: Column<String?> = varchar("replace", 1024).nullable()
}

object CustomFieldValue : LongIdTable("custom_field_value") {
    val task: Column<EntityID<Long>> = reference("task", Task, onDelete = CASCADE).index()
    val field: Column<EntityID<Long>> = reference("field", CustomField, onDelete = CASCADE).index()
    val value: Column<String?> = varchar("value", 1024).nullable()
}

object TimeSegment : LongIdTable("time_segment") {
    val task: Column<EntityID<Long>> = reference("task", Task, onDelete = CASCADE).index()
    val start: Column<DateTime> = datetime("start").index()
    val end: Column<DateTime?> = datetime("end").nullable()
}

object LastActivity : LongIdTable("last_activity") {
    val lastActivity: Column<DateTime> = datetime("last_activity")
}

object Settings : LongIdTable("settings") {
    val key: Column<String> = varchar("key", 1024).index()
    val stringValue: Column<String?> = varchar("stringValue", 1024).nullable()
    val intValue: Column<Int?> = integer("intValue").nullable()
    val booleanValue: Column<Boolean?> = bool("booleanValue").nullable()


    operator fun set(key: String, value: Boolean) = insert {
        it[Settings.key] = key
        it[Settings.booleanValue] = value
    }

    operator fun set(key: String, value: String) = insert {
        it[Settings.key] = key
        it[Settings.stringValue] = value
    }

    operator fun set(key: String, value: Int) = insert {
        it[Settings.key] = key
        it[Settings.intValue] = value
    }

}
