package ro.ubb.android_app.book.book

import android.app.Application
import android.content.Context
import android.util.Log
import androidx.lifecycle.*
import kotlinx.coroutines.launch
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.BookRepository
import ro.ubb.android_app.book.data.local.BookDatabase
import java.util.*
import ro.ubb.android_app.core.TAG
import ro.ubb.android_app.core.Result

class BookEditViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    val bookRepository: BookRepository

    init{
        val bookDao = BookDatabase.getDatabase(application, viewModelScope).bookDao()
        bookRepository = BookRepository(bookDao)
    }

    fun setContext(context: Context){
        bookRepository.context = context
    }

    fun getBookById(bookId: String): LiveData<Book> {
        Log.v(TAG, "getBookById...")
        return bookRepository.getById(bookId)
    }

    fun saveOrUpdateBook(newBook: Book) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateBook...");
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Book>
            if (newBook._id.isNotEmpty()) {
                result = bookRepository.update(newBook)
            } else {
                result = bookRepository.save(newBook)
            }
            when(result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateBook succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateBook failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }
}