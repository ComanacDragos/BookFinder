package ro.ubb.android_app.book.books
import android.app.Application
import androidx.lifecycle.*
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import ro.ubb.android_app.auth.data.remote.AuthRepository
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.BookRepository
import ro.ubb.android_app.book.data.local.BookDatabase
import ro.ubb.android_app.core.TAG
import ro.ubb.android_app.core.Result

class BookListViewModel(application: Application) : AndroidViewModel(application)  {
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val books: LiveData<List<Book>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    val bookRepository: BookRepository

    init{
        val bookDao = BookDatabase.getDatabase(application, viewModelScope).bookDao()
        bookRepository = BookRepository(bookDao)
        books = bookRepository.books
    }

    fun logout(){
        viewModelScope.launch {
            AuthRepository.logout(bookRepository.bookDao)
        }
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = bookRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}