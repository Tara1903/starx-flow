package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.DashboardSummary
import com.starxflow.shared.domain.repository.DashboardRepository

data class DashboardUiState(
    val isLoading: Boolean = false,
    val summary: DashboardSummary = DashboardSummary(),
    val error: String? = null,
    val selectedPeriod: String = "7D" // 7D, 30D, 90D
)

class DashboardViewModel(
    private val dashboardRepository: DashboardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState(isLoading = true))
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            dashboardRepository.getDashboardSummary().collect { result ->
                when (result) {
                    is StarXResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            summary = result.data,
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

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            when (val result = dashboardRepository.refreshDashboard()) {
                is StarXResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        summary = result.data,
                        error = null
                    )
                }
                is StarXResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                StarXResult.Loading -> Unit
            }
        }
    }

    fun setPeriod(period: String) {
        _uiState.value = _uiState.value.copy(selectedPeriod = period)
    }
}
