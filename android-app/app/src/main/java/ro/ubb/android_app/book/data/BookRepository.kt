package ro.ubb.android_app.book.data

import ro.ubb.android_app.book.data.remote.BookApi
import ro.ubb.android_app.core.Result

object BookRepository {
    private var cachedBooks: MutableList<Book>? = null;

    suspend fun loadAll(): Result<List<Book>> {
        if (cachedBooks != null) {
            return Result.Success(cachedBooks as List<Book>);
        }
        try {
            val books = BookApi.service.find()
            cachedBooks = mutableListOf()
            cachedBooks?.addAll(books)
            return Result.Success(cachedBooks as List<Book>)
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }

    suspend fun load(bookId: String): Result<Book> {
        val book = cachedBooks?.find { it._id == bookId }
        if (book != null) {
            return Result.Success(book)
        }
        try {
            return Result.Success(BookApi.service.read(bookId))
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }

    suspend fun save(book: Book): Result<Book> {
        try {
            val createdBook = BookApi.service.create(book)
            cachedBooks?.add(0, createdBook)
            return Result.Success(createdBook)
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }

    suspend fun update(book: Book): Result<Book> {
        try {
            book._id?.let {
                val updatedBook = BookApi.service.update(book._id, book)
                val index = cachedBooks?.indexOfFirst { it._id == book._id }
                if (index != null) {
                    cachedBooks?.set(index, updatedBook)
                }
                return Result.Success(updatedBook)
            }
            throw java.lang.Exception("Id is null")
        } catch (e: Exception) {
            return Result.Error(e)
        }
    }
}