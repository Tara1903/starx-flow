package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.Flow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Lead

interface CrmRepository {
    fun getLeads(): Flow<StarXResult<List<Lead>>>
    suspend fun refreshLeads(): StarXResult<List<Lead>>
    suspend fun updateLeadStatus(leadId: String, status: String): StarXResult<Boolean>
}
