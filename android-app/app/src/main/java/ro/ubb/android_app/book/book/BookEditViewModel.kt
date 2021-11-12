package ro.ubb.android_app.book.book

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.BookRepository
import java.util.*
import ro.ubb.android_app.core.TAG
import ro.ubb.android_app.core.Result

class BookEditViewModel: ViewModel() {
    private val mutableBook = MutableLiveData<Book>().apply { value = Book(_id = "", title = "", library = "", pages = -1, date = Date(), dueDate = Date(), isAvailable = false) }
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val book: LiveData<Book> = mutableBook
    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    fun loadBook(bookId: String) {
        viewModelScope.launch {
            Log.v(TAG, "loadBook...");
            mutableFetching.value = true
            mutableException.value = null
            when (val result = BookRepository.load(bookId)) {
                is Result.Success -> {
                    Log.d(TAG, "loadBook succeeded");
                    mutableBook.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadBook failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableFetching.value = false
        }
    }

    fun saveOrUpdateBook(newBook: Book) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateBook...${newBook}");

            val book = mutableBook.value ?: return@launch
            book.title = newBook.title
            book.library = newBook.library
            book.date = newBook.date
            book.isAvailable = newBook.isAvailable
            book.pages = newBook.pages
            book.dueDate = newBook.dueDate
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Book>
            if (book._id?.isNotEmpty() == true) {
                result = BookRepository.update(book)
            } else {
                result = BookRepository.save(book)
            }
            when (result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateBook succeeded");
                    mutableBook.value = result.data
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