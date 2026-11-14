package com.starxflow.shared.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.core.Constants
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.database.StarXDatabase
import com.starxflow.shared.data.network.StarXApiClient
import com.starxflow.shared.domain.model.Agent
import com.starxflow.shared.domain.repository.AgentRepository

class AgentRepositoryImpl(
    private val apiClient: StarXApiClient,
    private val secureStorage: SecureStorage,
    private val database: StarXDatabase
) : AgentRepository {

    override fun getAgents(): Flow<StarXResult<List<Agent>>> = flow {
        emit(StarXResult.Loading)

        val userId = secureStorage.getString(Constants.KEY_USER_ID)
        if (userId != null) {
            val cached = database.starXDatabaseQueries.selectAllAgents(userId).executeAsList().map { row ->
                Agent(
                    id = row.id,
                    userId = row.userId,
                    name = row.name,
                    role = row.role,
                    description = row.description,
                    isActive = row.isActive != 0L,
                    systemPrompt = row.systemPrompt
                )
            }
            if (cached.isNotEmpty()) {
                emit(StarXResult.Success(cached))
            }
        }

        when (val result = refreshAgents()) {
            is StarXResult.Success -> emit(result)
            is StarXResult.Error -> emit(result)
            StarXResult.Loading -> Unit
        }
    }

    override suspend fun refreshAgents(): StarXResult<List<Agent>> {
        val userId = secureStorage.getString(Constants.KEY_USER_ID)
            ?: return StarXResult.Error("Not authenticated", statusCode = 401)

        return when (val result = apiClient.getAgents()) {
            is StarXResult.Success -> {
                val list = if (result.data.isNotEmpty()) {
                    result.data.map { dto ->
                        Agent(
                            id = dto.id,
                            userId = dto.userId,
                            name = dto.name,
                            role = dto.role,
                            description = dto.description,
                            isActive = dto.isActive,
                            systemPrompt = dto.systemPrompt,
                            permissions = dto.permissions
                        )
                    }
                } else {
                    // Default production fleet if database table has not yet populated custom user agents
                    listOf(
                        Agent("agent_1", userId, "Receptionist AI", "receptionist", "Answers inbound multi-channel customer questions 24/7", true),
                        Agent("agent_2", userId, "Booking AI", "booking", "Books and reschedules customer appointments in real time", true),
                        Agent("agent_3", userId, "Lead Qualifier AI", "sales", "Scores, qualifies, and tags high-intent prospects", true),
                        Agent("agent_4", userId, "Review & Reputation AI", "review", "Monitors sentiment and follows up for positive customer reviews", true)
                    )
                }

                // Cache in SQLDelight
                list.forEach { agent ->
                    database.starXDatabaseQueries.insertOrReplaceAgent(
                        id = agent.id,
                        userId = agent.userId,
                        name = agent.name,
                        role = agent.role,
                        description = agent.description,
                        isActive = if (agent.isActive) 1L else 0L,
                        systemPrompt = agent.systemPrompt,
                        permissionsJson = ""
                    )
                }

                StarXResult.Success(list)
            }
            is StarXResult.Error -> StarXResult.Error(result.message, result.throwable, result.statusCode)
            StarXResult.Loading -> StarXResult.Loading
        }
    }

    override suspend fun toggleAgent(agentId: String, isActive: Boolean): StarXResult<Boolean> {
        // Optimistic local update
        database.starXDatabaseQueries.updateAgentStatus(if (isActive) 1L else 0L, agentId)
        // Remote update to Supabase
        return apiClient.updateAgent(agentId, isActive)
    }
}
