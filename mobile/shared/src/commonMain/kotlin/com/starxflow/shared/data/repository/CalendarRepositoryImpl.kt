package com.starxflow.shared.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.core.Constants
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.database.StarXDatabase
import com.starxflow.shared.data.network.StarXApiClient
import com.starxflow.shared.domain.model.Appointment
import com.starxflow.shared.domain.repository.CalendarRepository

class CalendarRepositoryImpl(
    private val apiClient: StarXApiClient,
    private val secureStorage: SecureStorage,
    private val database: StarXDatabase
) : CalendarRepository {

    override fun getAppointments(): Flow<StarXResult<List<Appointment>>> = flow {
        emit(StarXResult.Loading)

        val userId = secureStorage.getString(Constants.KEY_USER_ID)
        if (userId != null) {
            val cached = database.starXDatabaseQueries.selectAllAppointments(userId).executeAsList().map { row ->
                Appointment(
                    id = row.id,
                    userId = row.userId,
                    organizationId = row.organizationId,
                    leadId = row.leadId,
                    customerName = row.customerName,
                    customerPhone = row.customerPhone,
                    customerEmail = row.customerEmail,
                    serviceName = row.serviceName,
                    startTime = row.startTime,
                    endTime = row.endTime,
                    timezone = row.timezone,
                    status = row.status,
                    notes = row.notes
                )
            }
            if (cached.isNotEmpty()) {
                emit(StarXResult.Success(cached))
            }
        }

        when (val result = refreshAppointments()) {
            is StarXResult.Success -> emit(result)
            is StarXResult.Error -> emit(result)
            StarXResult.Loading -> Unit
        }
    }

    override suspend fun refreshAppointments(): StarXResult<List<Appointment>> {
        val userId = secureStorage.getString(Constants.KEY_USER_ID)
            ?: return StarXResult.Error("Not authenticated", statusCode = 401)

        return when (val result = apiClient.getAppointments()) {
            is StarXResult.Success -> {
                val list = result.data.map { dto ->
                    Appointment(
                        id = dto.id,
                        userId = dto.userId,
                        organizationId = dto.organizationId,
                        leadId = dto.leadId,
                        customerName = dto.customerName,
                        customerPhone = dto.customerPhone,
                        customerEmail = dto.customerEmail,
                        serviceName = dto.serviceName,
                        startTime = dto.startTime,
                        endTime = dto.endTime,
                        timezone = dto.timezone,
                        status = dto.status,
                        notes = dto.notes
                    )
                }

                // Cache in SQLDelight
                list.forEach { apt ->
                    database.starXDatabaseQueries.insertOrReplaceAppointment(
                        id = apt.id,
                        userId = apt.userId,
                        organizationId = apt.organizationId,
                        leadId = apt.leadId,
                        customerName = apt.customerName,
                        customerPhone = apt.customerPhone,
                        customerEmail = apt.customerEmail,
                        serviceName = apt.serviceName,
                        startTime = apt.startTime,
                        endTime = apt.endTime,
                        timezone = apt.timezone,
                        status = apt.status,
                        notes = apt.notes
                    )
                }

                StarXResult.Success(list)
            }
            is StarXResult.Error -> StarXResult.Error(result.message, result.throwable, result.statusCode)
            StarXResult.Loading -> StarXResult.Loading
        }
    }

    override suspend fun createAppointment(appointment: Appointment): StarXResult<Appointment> {
        val userId = secureStorage.getString(Constants.KEY_USER_ID)
            ?: return StarXResult.Error("Not authenticated", statusCode = 401)

        // 1. Conflict detection against active appointments in cache / database
        val existing = database.starXDatabaseQueries.selectAllAppointments(userId).executeAsList()
        val hasConflict = existing.any { cached ->
            if (cached.status == "cancelled") return@any false
            // ISO-8601 string comparison window check: StartA < EndB && EndA > StartB
            appointment.startTime < cached.endTime && appointment.endTime > cached.startTime
        }

        if (hasConflict) {
            return StarXResult.Error(
                "Time slot conflict detected. An appointment is already scheduled during this window."
            )
        }

        // 2. Persist appointment to Supabase
        val request = com.starxflow.shared.data.network.CreateAppointmentRequest(
            customerName = appointment.customerName,
            serviceName = appointment.serviceName,
            startTime = appointment.startTime,
            endTime = appointment.endTime,
            timezone = appointment.timezone,
            customerPhone = appointment.customerPhone,
            customerEmail = appointment.customerEmail,
            notes = appointment.notes,
            status = appointment.status
        )

        val serverResult = apiClient.createAppointment(request)
        val finalAppointment = if (serverResult is StarXResult.Success) {
            val dto = serverResult.data
            appointment.copy(id = dto.id)
        } else {
            appointment
        }

        // Cache locally
        database.starXDatabaseQueries.insertOrReplaceAppointment(
            id = finalAppointment.id,
            userId = userId,
            organizationId = finalAppointment.organizationId,
            leadId = finalAppointment.leadId,
            customerName = finalAppointment.customerName,
            customerPhone = finalAppointment.customerPhone,
            customerEmail = finalAppointment.customerEmail,
            serviceName = finalAppointment.serviceName,
            startTime = finalAppointment.startTime,
            endTime = finalAppointment.endTime,
            timezone = finalAppointment.timezone,
            status = finalAppointment.status,
            notes = finalAppointment.notes
        )

        return StarXResult.Success(finalAppointment)
    }
}
