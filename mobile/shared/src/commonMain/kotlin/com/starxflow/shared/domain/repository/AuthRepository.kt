package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.StateFlow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.User

interface AuthRepository {
    val currentUser: StateFlow<User?>
    val isLoggedIn: StateFlow<Boolean>

    suspend fun sendOtp(email: String, purpose: String = "login"): StarXResult<String?>
    suspend fun verifyOtp(email: String, code: String): StarXResult<User>
    suspend fun refreshSession(): Boolean
    suspend fun logout()
    suspend fun restoreSession(): Boolean
}
