package ro.ubb.android_app.book.data

import androidx.lifecycle.LiveData
import ro.ubb.android_app.book.data.local.BookDao
import ro.ubb.android_app.book.data.remote.BookApi
import ro.ubb.android_app.core.Result

class BookRepository(val bookDao: BookDao) {
    val books=bookDao.getAll();

    suspend fun refresh(): Result<Boolean>{
        try {
            val books = BookApi.service.find()
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
            return Result.Error(e)
        }
    }

    suspend fun update(book: Book): Result<Book> {
        try {
            val updatedBook = BookApi.service.update(book._id, book)
            bookDao.update(updatedBook)
            return Result.Success(updatedBook)
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }
}