package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Workflow
import com.starxflow.shared.domain.repository.WorkflowRepository

data class WorkflowUiState(
    val isLoading: Boolean = false,
    val workflows: List<Workflow> = emptyList(),
    val selectedWorkflow: Workflow? = null,
    val error: String? = null
)

class WorkflowViewModel(
    private val workflowRepository: WorkflowRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WorkflowUiState(isLoading = true))
    val uiState: StateFlow<WorkflowUiState> = _uiState.asStateFlow()

    init {
        loadWorkflows()
    }

    fun loadWorkflows() {
        viewModelScope.launch {
            workflowRepository.getWorkflows().collect { result ->
                when (result) {
                    is StarXResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            workflows = result.data,
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

    fun selectWorkflow(workflow: Workflow?) {
        _uiState.value = _uiState.value.copy(selectedWorkflow = workflow)
    }

    fun toggleWorkflow(workflowId: String, isActive: Boolean) {
        viewModelScope.launch {
            val result = workflowRepository.toggleWorkflow(workflowId, isActive)
            if (result is StarXResult.Success) {
                val updated = _uiState.value.workflows.map {
                    if (it.id == workflowId) it.copy(isActive = isActive) else it
                }
                _uiState.value = _uiState.value.copy(
                    workflows = updated,
                    selectedWorkflow = if (_uiState.value.selectedWorkflow?.id == workflowId) {
                        _uiState.value.selectedWorkflow?.copy(isActive = isActive)
                    } else _uiState.value.selectedWorkflow
                )
            }
        }
    }
}
