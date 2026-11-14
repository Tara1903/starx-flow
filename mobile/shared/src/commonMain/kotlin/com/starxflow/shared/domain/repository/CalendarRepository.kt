package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.Flow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Appointment

interface CalendarRepository {
    fun getAppointments(): Flow<StarXResult<List<Appointment>>>
    suspend fun refreshAppointments(): StarXResult<List<Appointment>>
    suspend fun createAppointment(appointment: Appointment): StarXResult<Appointment>
}
