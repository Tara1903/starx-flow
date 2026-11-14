package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Appointment
import com.starxflow.shared.domain.repository.CalendarRepository

data class CalendarUiState(
    val isLoading: Boolean = false,
    val appointments: List<Appointment> = emptyList(),
    val isCreatingBooking: Boolean = false,
    val bookingError: String? = null,
    val error: String? = null
)

class CalendarViewModel(
    private val calendarRepository: CalendarRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CalendarUiState(isLoading = true))
    val uiState: StateFlow<CalendarUiState> = _uiState.asStateFlow()

    init {
        loadAppointments()
    }

    fun loadAppointments() {
        viewModelScope.launch {
            calendarRepository.getAppointments().collect { result ->
                when (result) {
                    is StarXResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            appointments = result.data,
                            error = null
                        )
                    }
                    is StarXResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = result.message
                        )
                    }
                    StarXResult.Loading -> {
                        _uiState.value = _uiState.value.copy(isLoading = true)
                    }
                }
            }
        }
    }

    fun createBooking(
        customerName: String,
        customerPhone: String?,
        serviceName: String,
        startTime: String,
        endTime: String
    ) {
        val newApt = Appointment(
            id = "apt_${(100000..999999).random()}",
            userId = "",
            customerName = customerName.trim(),
            customerPhone = customerPhone?.trim(),
            serviceName = serviceName.trim(),
            startTime = startTime,
            endTime = endTime
        )

        _uiState.value = _uiState.value.copy(isCreatingBooking = true, bookingError = null)
        viewModelScope.launch {
            when (val result = calendarRepository.createAppointment(newApt)) {
                is StarXResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isCreatingBooking = false,
                        bookingError = null,
                        appointments = _uiState.value.appointments + result.data
                    )
                }
                is StarXResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isCreatingBooking = false,
                        bookingError = result.message
                    )
                }
                StarXResult.Loading -> Unit
            }
        }
    }

    fun clearBookingError() {
        _uiState.value = _uiState.value.copy(bookingError = null)
    }
}
