package ro.ubb.android_app.book.data.local

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat.getSystemService
import androidx.lifecycle.viewModelScope
import androidx.work.Worker
import androidx.work.WorkerParameters
import ro.ubb.android_app.core.TAG
import com.google.gson.Gson
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.book.data.remote.BookApi
import kotlinx.coroutines.*
import ro.ubb.android_app.MainActivity
import androidx.core.content.ContextCompat.getSystemService
import ro.ubb.android_app.R


class SyncWorker(context: Context,
                 workerParams: WorkerParameters): Worker(context, workerParams) {
    val CHANNEL_ID = "CHANNEL_ID"

    override fun doWork(): Result {
        val gson = Gson()
        val book = gson.fromJson(inputData.getString("book"), Book::class.java)
        Log.v(TAG, "starting worker $book")

        GlobalScope.launch{
            if (book._id.startsWith("~")) {
                Log.i(TAG, "create book")
                val createdBook = BookApi.service.create(book)
                val bookDao = BookDatabase.getDatabase(MainActivity.applicationContext(), GlobalScope).bookDao()
                bookDao.deleteById(book._id)
                bookDao.insert(createdBook)
            } else {
                Log.i(TAG,"update book")
                BookApi.service.update(book._id, book)
            }
        }
        createNotificationChannel()
        createNotification(book)
        return Result.success()
    }

    private fun createNotification(book: Book) {
        val intent = Intent(MainActivity.applicationContext(), MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent: PendingIntent = PendingIntent.getActivity(MainActivity.applicationContext(), 0, intent, 0)
        val builder = NotificationCompat.Builder(MainActivity.applicationContext(), CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("Sync")
            .setContentText("Updated: ${book.title}, library: ${book.library}")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
        with(NotificationManagerCompat.from(MainActivity.applicationContext())) {
            notify(1, builder.build())
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "My channel name"
            val descriptionText = "My channel description"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }

            val notificationManager: NotificationManager =
                getSystemService(MainActivity.applicationContext(), NotificationManager::class.java) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}