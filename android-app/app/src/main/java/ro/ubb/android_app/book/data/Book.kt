package ro.ubb.android_app.book.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*


@Entity(tableName = "books")
data class Book (
    @PrimaryKey @ColumnInfo(name = "_id") val _id: String,
    var title: String,
    var dueDate: Date,
    var date: Date,
    var library: String,
    var isAvailable: Boolean,
    var pages: Int
)