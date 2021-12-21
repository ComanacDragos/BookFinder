package ro.ubb.android_app.book.data

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.lifecycle.LiveData
import androidx.work.*
import com.google.gson.Gson
import androidx.work.ListenableWorker
import ro.ubb.android_app.book.data.local.BookDao
import ro.ubb.android_app.book.data.local.SyncWorker
//import ro.ubb.android_app.book.data.local.SyncWorker
import ro.ubb.android_app.book.data.remote.BookApi
import ro.ubb.android_app.core.Result
import ro.ubb.android_app.core.TAG
import java.util.*
import kotlin.random.asKotlinRandom


class BookRepository(val bookDao: BookDao) {
    val books=bookDao.getAll();
    lateinit var context: Context

    suspend fun refresh(): Result<Boolean>{
        try {
            val books = BookApi.service.find()
            Log.i(TAG, books.toString())
            for (book in books) {
                bookDao.insert(book)
            }
            return Result.Success(true)
        } catch(e: Exception) {
            return Result.Error(e)
        }
    }

    fun getById(bookId: String): LiveData<Book> {
        return bookDao.getById(bookId)
    }

    suspend fun save(book: Book): Result<Book> {
        try {
            val createdBook = BookApi.service.create(book)
            bookDao.insert(createdBook)
            return Result.Success(createdBook)
        } catch (e: Exception) {
            // inserat in baza de date + flag ca nu a fost trimisa pe server
            // background task cu trimiterea datelor
            Log.i(TAG, "save error")

            val i = Book(
                "~"+Random().asKotlinRandom().nextInt(99999).toString(),
                book.title,
                book.dueDate,
                book.date,
                book.library,
                book.isAvailable,
                book.pages
            )
            startJob(i)
            bookDao.insert(i)
            return Result.Error(e)
        }
    }

    suspend fun update(book: Book): Result<Book> {
        try {
            val updatedBook = BookApi.service.update(book._id, book)
            bookDao.update(updatedBook)
            return Result.Success(updatedBook)
        } catch (e: Exception) {
            Log.i(TAG, "update error")
            startJob(book)
            bookDao.update(book)
            return Result.Error(e)
        }
    }

    @SuppressLint("RestrictedApi")
    private fun startJob(book: Book) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val gson = Gson()
        val inputData = Data.Builder()
            .putString("book", gson.toJson(book))
            .build()
//        val myWork = PeriodicWorkRequestBuilder<ExampleWorker>(1, TimeUnit.MINUTES)
        val myWork = OneTimeWorkRequest.Builder(SyncWorker::class.java)
            .setConstraints(constraints)
            .setInputData(inputData)
            .build()

        WorkManager.getInstance(context).enqueue(myWork)

    }
}