package ro.ubb.android_app.book.data.remote

import retrofit2.http.*
import ro.ubb.android_app.book.data.Book
import ro.ubb.android_app.core.Api

object BookApi {
    interface Service {
        @GET("/api/book")
        suspend fun find(): List<Book>

        @GET("/api/book/{id}")
        suspend fun read(@Path("id") itemId: String): Book;

        @Headers("Content-Type: application/json")
        @POST("/api/book")
        suspend fun create(@Body item: Book): Book

        @Headers("Content-Type: application/json")
        @PUT("/api/book/{id}")
        suspend fun update(@Path("id") itemId: String, @Body item: Book): Book
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}