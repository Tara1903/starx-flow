package com.starxflow.shared.core

sealed interface StarXResult<out T> {
    data class Success<T>(val data: T) : StarXResult<T>
    data class Error(val message: String, val throwable: Throwable? = null, val statusCode: Int? = null) : StarXResult<Nothing>
    data object Loading : StarXResult<Nothing>
}
