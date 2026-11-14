package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Agent
import com.starxflow.shared.domain.repository.AgentRepository

data class AgentUiState(
    val isLoading: Boolean = false,
    val agents: List<Agent> = emptyList(),
    val selectedAgent: Agent? = null,
    val error: String? = null
)

class AgentViewModel(
    private val agentRepository: AgentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AgentUiState(isLoading = true))
    val uiState: StateFlow<AgentUiState> = _uiState.asStateFlow()

    init {
        loadAgents()
    }

    fun loadAgents() {
        viewModelScope.launch {
            agentRepository.getAgents().collect { result ->
                when (result) {
                    is StarXResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            agents = result.data,
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

    fun selectAgent(agent: Agent?) {
        _uiState.value = _uiState.value.copy(selectedAgent = agent)
    }

    fun toggleAgent(agentId: String, isActive: Boolean) {
        viewModelScope.launch {
            val result = agentRepository.toggleAgent(agentId, isActive)
            if (result is StarXResult.Success) {
                val updatedList = _uiState.value.agents.map {
                    if (it.id == agentId) it.copy(isActive = isActive) else it
                }
                _uiState.value = _uiState.value.copy(
                    agents = updatedList,
                    selectedAgent = if (_uiState.value.selectedAgent?.id == agentId) {
                        _uiState.value.selectedAgent?.copy(isActive = isActive)
                    } else _uiState.value.selectedAgent
                )
            }
        }
    }
}
