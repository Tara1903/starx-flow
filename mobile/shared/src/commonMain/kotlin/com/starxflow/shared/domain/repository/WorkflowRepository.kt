package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.Flow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Workflow

interface WorkflowRepository {
    fun getWorkflows(): Flow<StarXResult<List<Workflow>>>
    suspend fun refreshWorkflows(): StarXResult<List<Workflow>>
    suspend fun toggleWorkflow(workflowId: String, isActive: Boolean): StarXResult<Boolean>
}
