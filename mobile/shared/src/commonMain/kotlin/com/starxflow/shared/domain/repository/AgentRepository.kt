package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.Flow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Agent

interface AgentRepository {
    fun getAgents(): Flow<StarXResult<List<Agent>>>
    suspend fun refreshAgents(): StarXResult<List<Agent>>
    suspend fun toggleAgent(agentId: String, isActive: Boolean): StarXResult<Boolean>
}
