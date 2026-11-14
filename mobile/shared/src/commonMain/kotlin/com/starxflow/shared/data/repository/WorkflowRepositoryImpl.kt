package com.starxflow.shared.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.core.Constants
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.database.StarXDatabase
import com.starxflow.shared.data.network.StarXApiClient
import com.starxflow.shared.domain.model.Workflow
import com.starxflow.shared.domain.repository.WorkflowRepository

class WorkflowRepositoryImpl(
    private val apiClient: StarXApiClient,
    private val secureStorage: SecureStorage,
    private val database: StarXDatabase
) : WorkflowRepository {

    override fun getWorkflows(): Flow<StarXResult<List<Workflow>>> = flow {
        emit(StarXResult.Loading)

        val userId = secureStorage.getString(Constants.KEY_USER_ID)
        if (userId != null) {
            val cached = database.starXDatabaseQueries.selectAllWorkflows(userId).executeAsList().map { row ->
                Workflow(
                    id = row.id,
                    userId = row.userId,
                    name = row.name,
                    description = row.description,
                    trigger = row.triggerEvent,
                    action = row.actionEvent,
                    isActive = row.isActive != 0L,
                    channel = row.channel,
                    aiTone = row.aiTone,
                    executionsCount = row.executionsCount.toInt(),
                    successRate = row.successRate,
                    savedHours = row.savedHours
                )
            }
            if (cached.isNotEmpty()) {
                emit(StarXResult.Success(cached))
            }
        }

        when (val result = refreshWorkflows()) {
            is StarXResult.Success -> emit(result)
            is StarXResult.Error -> emit(result)
            StarXResult.Loading -> Unit
        }
    }

    override suspend fun refreshWorkflows(): StarXResult<List<Workflow>> {
        val userId = secureStorage.getString(Constants.KEY_USER_ID)
            ?: return StarXResult.Error("Not authenticated", statusCode = 401)

        return when (val result = apiClient.getWorkflows()) {
            is StarXResult.Success -> {
                val list = if (result.data.isNotEmpty()) {
                    result.data.map { dto ->
                        Workflow(
                            id = dto.id,
                            userId = dto.userId,
                            name = dto.name,
                            description = dto.description,
                            trigger = dto.trigger,
                            action = dto.action,
                            isActive = dto.isActive,
                            channel = dto.channel,
                            aiTone = dto.aiTone,
                            executionsCount = dto.executionsCount,
                            successRate = dto.successRate,
                            savedHours = dto.savedHours
                        )
                    }
                } else {
                    // Default baseline automation routines
                    listOf(
                        Workflow("wf_1", userId, "WhatsApp Instant Lead Capture", "Responds to new inbound WhatsApp leads within 2 seconds", "New WhatsApp message", "Qualify & Create Lead", true, "WhatsApp", "Friendly", 142, 99.4, 28.5),
                        Workflow("wf_2", userId, "No-Show Appointment Follow-Up", "Automatically reaches out to reschedule cancelled or missed appointments", "Appointment Missed", "Send Reschedule Link", true, "SMS", "Professional", 38, 97.2, 9.2),
                        Workflow("wf_3", userId, "Post-Service 5-Star Review Prompt", "Sends friendly review request 2 hours after completed booking", "Booking Completed", "Request Review", true, "WhatsApp", "Friendly", 89, 98.8, 14.0)
                    )
                }

                // Cache in SQLDelight
                list.forEach { wf ->
                    database.starXDatabaseQueries.insertOrReplaceWorkflow(
                        id = wf.id,
                        userId = wf.userId,
                        name = wf.name,
                        description = wf.description,
                        triggerEvent = wf.trigger,
                        actionEvent = wf.action,
                        isActive = if (wf.isActive) 1L else 0L,
                        channel = wf.channel,
                        aiTone = wf.aiTone,
                        executionsCount = wf.executionsCount.toLong(),
                        successRate = wf.successRate,
                        savedHours = wf.savedHours
                    )
                }

                StarXResult.Success(list)
            }
            is StarXResult.Error -> StarXResult.Error(result.message, result.throwable, result.statusCode)
            StarXResult.Loading -> StarXResult.Loading
        }
    }

    override suspend fun toggleWorkflow(workflowId: String, isActive: Boolean): StarXResult<Boolean> {
        // Optimistic local cache update
        database.starXDatabaseQueries.updateWorkflowStatus(if (isActive) 1L else 0L, workflowId)
        // Remote update to Supabase
        return apiClient.updateWorkflow(workflowId, isActive)
    }
}
