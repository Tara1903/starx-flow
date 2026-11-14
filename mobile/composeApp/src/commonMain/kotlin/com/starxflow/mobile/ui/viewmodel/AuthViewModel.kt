package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.User
import com.starxflow.shared.domain.repository.AuthRepository

sealed interface AuthUiState {
    data object Initial : AuthUiState
    data object Loading : AuthUiState
    data class OtpSent(
        val email: String,
        val expiresAt: String?,
        val error: String? = null,
        val isVerifying: Boolean = false
    ) : AuthUiState
    data class Authenticated(val user: User) : AuthUiState
    data class Error(val message: String) : AuthUiState
}

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val apiClient: com.starxflow.shared.data.network.StarXApiClient? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Initial)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    val currentUser: StateFlow<User?> = authRepository.currentUser
    val isLoggedIn: StateFlow<Boolean> = authRepository.isLoggedIn

    init {
        checkSession()
    }

    fun checkSession() {
        viewModelScope.launch {
            val user = authRepository.currentUser.value
            if (user != null) {
                _uiState.value = AuthUiState.Authenticated(user)
            } else {
                _uiState.value = AuthUiState.Initial
            }
        }
    }

    fun sendOtp(email: String) {
        if (email.isBlank() || !email.contains('@')) {
            _uiState.value = AuthUiState.Error("Please enter a valid business email address.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            when (val result = authRepository.sendOtp(email.trim().toLowerCase())) {
                is StarXResult.Success -> {
                    _uiState.value = AuthUiState.OtpSent(email.trim().toLowerCase(), result.data)
                }
                is StarXResult.Error -> {
                    _uiState.value = AuthUiState.Error(result.message)
                }
                StarXResult.Loading -> Unit
            }
        }
    }

    fun verifyOtp(email: String, code: String) {
        val cleanCode = code.filter { it.isLetterOrDigit() }
        val currentSent = _uiState.value as? AuthUiState.OtpSent

        if (cleanCode.length != 8) {
            if (currentSent != null) {
                _uiState.value = currentSent.copy(error = "Verification code must be exactly 8 digits.")
            } else {
                _uiState.value = AuthUiState.Error("Verification code must be exactly 8 digits.")
            }
            return
        }

        if (currentSent != null) {
            _uiState.value = currentSent.copy(isVerifying = true, error = null)
        } else {
            _uiState.value = AuthUiState.Loading
        }

        viewModelScope.launch {
            when (val result = authRepository.verifyOtp(email, cleanCode)) {
                is StarXResult.Success -> {
                    _uiState.value = AuthUiState.Authenticated(result.data)
                    // Register mobile device notification token on login
                    apiClient?.let { client ->
                        launch {
                            client.registerPushToken("device_token_${result.data.id}", "android")
                        }
                    }
                }
                is StarXResult.Error -> {
                    if (currentSent != null) {
                        _uiState.value = currentSent.copy(isVerifying = false, error = result.message)
                    } else {
                        _uiState.value = AuthUiState.Error(result.message)
                    }
                }
                StarXResult.Loading -> Unit
            }
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Initial
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState.Initial
        }
    }
}
