package ro.ubb.android_app.book.books

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.DividerItemDecoration
import kotlinx.android.synthetic.main.fragment_book_list.*
import ro.ubb.android_app.R
import ro.ubb.android_app.auth.data.remote.AuthRepository
import ro.ubb.android_app.core.TAG

class BookListFragment : Fragment() {

    private lateinit var bookListAdapter: BookListAdapter
    private lateinit var booksModel: BookListViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.v(TAG, "onCreate")
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_book_list, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.v(TAG, "onActivityCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.fragment_login)
            return;
        }
        setupBookList()
        fab.setOnClickListener {
            Log.v(TAG, "add new book")
            findNavController().navigate(R.id.fragment_book_edit)
        }

        logout_fab.setOnClickListener{
            Log.v(TAG, "logout")
            booksModel.logout()
            findNavController().navigate(R.id.fragment_login)
        }
    }

    private fun setupBookList() {
        bookListAdapter = BookListAdapter(this)
        book_list.adapter = bookListAdapter
        book_list.addItemDecoration(DividerItemDecoration(this.context, DividerItemDecoration.VERTICAL))

        booksModel = ViewModelProvider(this).get(BookListViewModel::class.java)
        booksModel.books.observe(viewLifecycleOwner, { books ->
            Log.v(TAG, "update books")
            bookListAdapter.books = books.sortedByDescending { it.date }
        })
        booksModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            progress.visibility = if (loading) View.VISIBLE else View.GONE
        })
        booksModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })
        booksModel.refresh()
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.v(TAG, "onDestroy")
    }
}