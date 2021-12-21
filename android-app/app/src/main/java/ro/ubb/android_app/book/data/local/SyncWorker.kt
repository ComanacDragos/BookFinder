package ro.ubb.android_app.book.data.local

import android.content.Context
import android.util.Log
import androidx.lifecycle.viewModelScope
import androidx.work.Worker
import androidx.work.WorkerParameters
import ro.ubb.android_app.core.TAG
import com.google.gson.Gson
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.remote.BookApi
import kotlinx.coroutines.*
import ro.ubb.android_app.MainActivity

class SyncWorker(context: Context,
                 workerParams: WorkerParameters): Worker(context, workerParams) {
    override fun doWork(): Result {
        val gson = Gson()
        val book = gson.fromJson(inputData.getString("book"), Book::class.java)
        Log.v(TAG, "starting worker $book")

        GlobalScope.launch{
            if (book._id.startsWith("~")) {
                Log.i(TAG, "create book")
                val createdBook = BookApi.service.create(book)
                val bookDao = BookDatabase.getDatabase(MainActivity.applicationContext(), GlobalScope).bookDao()
                bookDao.deleteById(book._id)
                bookDao.insert(createdBook)
            } else {
                Log.i(TAG,"update book")
                BookApi.service.update(book._id, book)
            }
        }
        return Result.success()
    }
}