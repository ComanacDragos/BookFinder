package ro.ubb.android_app.book.books

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import ro.ubb.android_app.R
import ro.ubb.android_app.book.book.BookEditFragment
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.core.TAG
import java.text.SimpleDateFormat
import java.util.*

class BookListAdapter(
    private val fragment: Fragment
) : RecyclerView.Adapter<BookListAdapter.ViewHolder>() {
    var books = emptyList<Book>()
        set(value) {
            field = value
            notifyDataSetChanged();
        }

    private var onBookClicked: View.OnClickListener;

    init {
        onBookClicked = View.OnClickListener { view ->
            val book = view.tag as Book
            Log.i(TAG, "edit book "+ book._id)
            fragment.findNavController().navigate(R.id.fragment_book_edit, Bundle().apply {
                putString(BookEditFragment.BOOK_ID, book._id)
            })
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.book_view, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val sdf = SimpleDateFormat("dd-MM-yyyy")
        Log.v(TAG, "onBindViewHolder $position")
        val book = books[position]
        holder.itemView.tag = book
        holder.titleView.text = book.title
        holder.libraryView.text = book.library
        holder.pagesView.text = book.pages.toString()
        holder.isAvailableView.text = if (book.isAvailable) "Available" else "Not available"
        holder.dateView.text = sdf.format(book.dueDate.time).toString()

        holder.itemView.setOnClickListener(onBookClicked)
    }

    override fun getItemCount() = books.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val titleView: TextView = view.findViewById(R.id.titleView);
        val libraryView: TextView = view.findViewById(R.id.libraryView);
        val pagesView: TextView = view.findViewById(R.id.pagesView);
        val isAvailableView: TextView = view.findViewById(R.id.isAvailableView);
        val dateView: TextView = view.findViewById(R.id.dateView);
    }
}