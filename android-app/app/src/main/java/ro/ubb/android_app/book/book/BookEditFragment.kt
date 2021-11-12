package ro.ubb.android_app.book.book

import android.app.DatePickerDialog
import android.app.Dialog
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.DatePicker
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import kotlinx.android.synthetic.main.book_view.view.*
import kotlinx.android.synthetic.main.fragment_book_edit.*
import ro.ubb.android_app.R
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.core.TAG
import java.text.SimpleDateFormat
import java.util.*


class BookEditFragment : Fragment() {
    companion object {
        const val BOOK_ID = "ITEM_ID"
    }

    private lateinit var viewModel: BookEditViewModel
    private var bookId: String? = null

    private var selectedDate : Long = 0;

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.v(TAG, "onCreate")
        arguments?.let {
            if (it.containsKey(BOOK_ID)) {
                bookId = it.getString(BOOK_ID)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.v(TAG, "onCreateView")
        return inflater.inflate(R.layout.fragment_book_edit, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.v(TAG, "onViewCreated")
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.v(TAG, "onActivityCreated")
        setupViewModel()
        fab.setOnClickListener {
            Log.v(TAG, "save book")
            var id:String? = null
            bookId?.let {
                id = it
            }
            val sdf = SimpleDateFormat("dd-MM-yyyy")
            Log.i(TAG, "calendar ${calendarView.date} ${Date(calendarView.date)}")
            viewModel.saveOrUpdateBook(
                Book(
                    _id = id,
                    title = titleEdit.text.toString(),
                    library = libraryEdit.text.toString(),
                    pages = pagesEdit.text.toString().toInt(),
                    isAvailable = isAvailableEdit.isChecked,
                    date = Date(),
                    dueDate = Date(selectedDate)//dueDateEdit.text
                )
            )
        }

        calendarView.setOnDateChangeListener { calendarView, i, i2, i3 ->
            selectedDate = GregorianCalendar(i, i2, i3).timeInMillis
            //Log.i(TAG, "${i} ${i2} ${i3} ${selectedDate} ${Date().time}")
        }
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(BookEditViewModel::class.java)
        viewModel.book.observe(viewLifecycleOwner, { book ->
            if(book._id?.isEmpty() == true)
                return@observe
            Log.v(TAG, "update book${book}")
            titleEdit.setText(book.title)
            libraryEdit.setText(book.library)
            pagesEdit.setText(book.pages.toString())
            if(book.isAvailable)
                isAvailableEdit.isChecked = true
            calendarView.date = book.dueDate.time
            selectedDate = book.dueDate.time
        })
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigateUp()
            }
        })
        val id = bookId
        if (id != null) {
            viewModel.loadBook(id)
        }
    }

}