package com.starxflow.shared.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.core.Constants
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.database.StarXDatabase
import com.starxflow.shared.data.network.StarXApiClient
import com.starxflow.shared.domain.model.Lead
import com.starxflow.shared.domain.repository.CrmRepository

class CrmRepositoryImpl(
    private val apiClient: StarXApiClient,
    private val secureStorage: SecureStorage,
    private val database: StarXDatabase
) : CrmRepository {

    override fun getLeads(): Flow<StarXResult<List<Lead>>> = flow {
        emit(StarXResult.Loading)

        val userId = secureStorage.getString(Constants.KEY_USER_ID)
        if (userId != null) {
            val cached = database.starXDatabaseQueries.selectAllLeads(userId).executeAsList().map { row ->
                Lead(
                    id = row.id,
                    userId = row.userId,
                    organizationId = row.organizationId,
                    name = row.name,
                    phone = row.phone,
                    email = row.email,
                    status = row.status,
                    source = row.source,
                    score = row.score.toInt(),
                    tags = if (row.tags.isBlank()) emptyList() else row.tags.split(","),
                    notes = row.notes,
                    lastContactAt = row.lastContactAt,
                    createdAt = row.createdAt
                )
            }
            if (cached.isNotEmpty()) {
                emit(StarXResult.Success(cached))
            }
        }

        when (val result = refreshLeads()) {
            is StarXResult.Success -> emit(result)
            is StarXResult.Error -> emit(result)
            StarXResult.Loading -> Unit
        }
    }

    override suspend fun refreshLeads(): StarXResult<List<Lead>> {
        val userId = secureStorage.getString(Constants.KEY_USER_ID)
            ?: return StarXResult.Error("Not authenticated", statusCode = 401)

        return when (val result = apiClient.getLeads()) {
            is StarXResult.Success -> {
                val list = result.data.map { dto ->
                    Lead(
                        id = dto.id,
                        userId = dto.userId,
                        organizationId = dto.organizationId,
                        name = dto.name,
                        phone = dto.phone,
                        email = dto.email,
                        status = dto.status,
                        source = dto.source,
                        score = dto.score,
                        tags = dto.tags,
                        notes = dto.notes,
                        lastContactAt = dto.lastContactAt,
                        createdAt = dto.createdAt
                    )
                }

                // Cache in SQLDelight
                list.forEach { lead ->
                    database.starXDatabaseQueries.insertOrReplaceLead(
                        id = lead.id,
                        userId = lead.userId,
                        organizationId = lead.organizationId,
                        name = lead.name,
                        phone = lead.phone,
                        email = lead.email,
                        status = lead.status,
                        source = lead.source,
                        score = lead.score.toLong(),
                        tags = lead.tags.joinToString(","),
                        notes = lead.notes,
                        lastContactAt = lead.lastContactAt,
                        createdAt = lead.createdAt
                    )
                }

                StarXResult.Success(list)
            }
            is StarXResult.Error -> StarXResult.Error(result.message, result.throwable, result.statusCode)
            StarXResult.Loading -> StarXResult.Loading
        }
    }

    override suspend fun updateLeadStatus(leadId: String, status: String): StarXResult<Boolean> {
        return apiClient.updateLeadStatus(leadId, status)
    }
}
