package ro.ubb.android_app.book.books

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.BookRepository
import ro.ubb.android_app.core.TAG
import ro.ubb.android_app.core.Result

class BookListViewModel : ViewModel()  {
    private val mutableBooks = MutableLiveData<List<Book>>().apply { value = emptyList() }
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val books: LiveData<List<Book>> = mutableBooks
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    fun loadBooks() {
        viewModelScope.launch {
            Log.v(TAG, "loadBooks...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = BookRepository.loadAll()) {
                is Result.Success -> {
                    Log.d(TAG, "loadBooks succeeded");
                    mutableBooks.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadBooks failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}