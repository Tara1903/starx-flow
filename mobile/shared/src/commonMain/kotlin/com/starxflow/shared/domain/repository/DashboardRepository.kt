package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.Flow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.DashboardSummary

interface DashboardRepository {
    fun getDashboardSummary(): Flow<StarXResult<DashboardSummary>>
    suspend fun refreshDashboard(): StarXResult<DashboardSummary>
}
