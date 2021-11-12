package ro.ubb.android_app.book.data

import java.util.*

data class Book (
    val _id: String?,
    var title: String,
    var dueDate: Date,
    var date: Date,
    var library: String,
    var isAvailable: Boolean,
    var pages: Int
)