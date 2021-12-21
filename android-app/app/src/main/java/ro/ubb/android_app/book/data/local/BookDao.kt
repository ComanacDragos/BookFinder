package ro.ubb.android_app.book.data.local
import androidx.lifecycle.LiveData
import androidx.room.*
import ro.ubb.android_app.book.data.Book

@Dao
interface BookDao {
    @Query("SELECT * from books ORDER BY _id ASC")
    fun getAll(): LiveData<List<Book>>

    @Query("SELECT * FROM books WHERE _id=:id ")
    fun getById(id: String): LiveData<Book>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(book: Book)

    @Update(onConflict = OnConflictStrategy.REPLACE)
    suspend fun update(book: Book)

    @Query("DELETE FROM books")
    suspend fun deleteAll()

    @Query("DELETE FROM books WHERE _id=:id ")
    suspend fun deleteById(id: String)
}