package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Lead
import com.starxflow.shared.domain.repository.CrmRepository

data class CrmUiState(
    val isLoading: Boolean = false,
    val leads: List<Lead> = emptyList(),
    val filteredLeads: List<Lead> = emptyList(),
    val selectedStatus: String = "All", // All, new, contacted, qualified, converted, lost
    val searchQuery: String = "",
    val selectedLead: Lead? = null,
    val error: String? = null
)

class CrmViewModel(
    private val crmRepository: CrmRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CrmUiState(isLoading = true))
    val uiState: StateFlow<CrmUiState> = _uiState.asStateFlow()

    init {
        loadLeads()
    }

    fun loadLeads() {
        viewModelScope.launch {
            crmRepository.getLeads().collect { result ->
                when (result) {
                    is StarXResult.Success -> {
                        val list = result.data
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            leads = list,
                            filteredLeads = filterLeads(list, _uiState.value.selectedStatus, _uiState.value.searchQuery),
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

    fun selectLead(lead: Lead?) {
        _uiState.value = _uiState.value.copy(selectedLead = lead)
    }

    fun updateLeadStatus(leadId: String, status: String) {
        viewModelScope.launch {
            when (crmRepository.updateLeadStatus(leadId, status)) {
                is StarXResult.Success -> {
                    val updatedLeads = _uiState.value.leads.map {
                        if (it.id == leadId) it.copy(status = status) else it
                    }
                    _uiState.value = _uiState.value.copy(
                        leads = updatedLeads,
                        filteredLeads = filterLeads(updatedLeads, _uiState.value.selectedStatus, _uiState.value.searchQuery),
                        selectedLead = if (_uiState.value.selectedLead?.id == leadId) _uiState.value.selectedLead?.copy(status = status) else _uiState.value.selectedLead
                    )
                }
                else -> Unit
            }
        }
    }

    fun setStatusFilter(status: String) {
        _uiState.value = _uiState.value.copy(
            selectedStatus = status,
            filteredLeads = filterLeads(_uiState.value.leads, status, _uiState.value.searchQuery)
        )
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredLeads = filterLeads(_uiState.value.leads, _uiState.value.selectedStatus, query)
        )
    }

    private fun filterLeads(list: List<Lead>, status: String, query: String): List<Lead> {
        return list.filter { lead ->
            val matchesStatus = status == "All" || lead.status.equals(status, ignoreCase = true)
            val matchesQuery = query.isBlank() || lead.name.contains(query, ignoreCase = true) ||
                    (lead.phone?.contains(query, ignoreCase = true) == true) ||
                    (lead.email?.contains(query, ignoreCase = true) == true)
            matchesStatus && matchesQuery
        }
    }
}
