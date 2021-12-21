package ro.ubb.android_app.book.book

import android.annotation.SuppressLint
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
import androidx.work.*
import kotlinx.android.synthetic.main.book_view.view.*
import kotlinx.android.synthetic.main.fragment_book_edit.*
import ro.ubb.android_app.R
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.local.SyncWorker
import ro.ubb.android_app.core.TAG
import java.text.SimpleDateFormat
import java.util.*
import com.google.gson.Gson

class BookEditFragment : Fragment() {
    companion object {
        const val BOOK_ID = "ITEM_ID"
    }

    private lateinit var viewModel: BookEditViewModel
    private var bookId: String? = null
    private var book: Book? = null

    private var selectedDate : Long = Date().time;

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
            Log.v(TAG, "save book - $book")
            book?.let { it1 -> startAndObserveJob(it1) }
            return@setOnClickListener

            val i = book
            if(i!=null){
                i.title = titleEdit.text.toString()
                i.library = libraryEdit.text.toString()
                if(pagesEdit.text.toString().isEmpty())
                    i.pages = 0
                else
                    i.pages = pagesEdit.text.toString().toInt()
                i.isAvailable = isAvailableEdit.isChecked
                i.date = Date()
                i.dueDate = Date(selectedDate)//dueDateEdit.text
                viewModel.saveOrUpdateBook(i)
            }
        }

        calendarView.setOnDateChangeListener { calendarView, i, i2, i3 ->
            selectedDate = GregorianCalendar(i, i2, i3).timeInMillis
            Log.i(TAG, "${i} ${i2} ${i3} ${selectedDate} ${Date().time}")
        }
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(BookEditViewModel::class.java)

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
        if (id == null) {
            Log.v(TAG, "New book")
            book = Book("", "", Date(), Date(), "", false, -1)
        }else{
            Log.v(TAG, "Update book $id")
            viewModel.getBookById(id).observe(viewLifecycleOwner, {
                Log.v(TAG, "start update book $it")
                if (it != null) {
                    book = it
                    titleEdit.setText(it.title)
                    libraryEdit.setText(it.library)
                    pagesEdit.setText(it.pages.toString())
                    isAvailableEdit.isChecked = it.isAvailable
                    calendarView.setDate(it.dueDate.time)
                }
            })
        }
    }

    @SuppressLint("RestrictedApi")
    private fun startAndObserveJob(book: Book) {
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
        val workId = myWork.id
        this.context?.let {
            WorkManager.getInstance(it).apply {
                // enqueue Work
                enqueue(myWork)
                // observe work status
                getWorkInfoByIdLiveData(workId)
                    .observe(viewLifecycleOwner, { status ->
                        val isFinished = status?.state?.isFinished
                        Log.v(TAG, "Job $workId; finished: $isFinished")
                    })
            }
        }
    }
}