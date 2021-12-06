package ro.ubb.android_app.auth.data.remote

import ro.ubb.android_app.auth.data.TokenHolder
import ro.ubb.android_app.auth.data.User
import ro.ubb.android_app.book.data.local.BookDao
import ro.ubb.android_app.core.Api
import ro.ubb.android_app.core.Result

object AuthRepository {
    var user: User? = null
        private set

    val isLoggedIn: Boolean
        get() = user != null

    init {
        user = null
    }

    suspend fun logout(bookDao: BookDao) {
        user = null
        Api.tokenInterceptor.token = null
        bookDao.deleteAll()
    }

    suspend fun login(username: String, password: String): Result<TokenHolder> {
        val user = User(username, password)
        val result = RemoteAuthDataSource.login(user)
        if (result is Result.Success<TokenHolder>) {
            setLoggedInUser(user, result.data)
        }
        return result
    }

    private fun setLoggedInUser(user: User, tokenHolder: TokenHolder) {
        this.user = user
        Api.tokenInterceptor.token = tokenHolder.token
    }
}
