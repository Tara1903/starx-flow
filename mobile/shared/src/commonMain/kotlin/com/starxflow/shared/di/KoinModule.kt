package com.starxflow.shared.di

import org.koin.core.module.Module
import org.koin.dsl.module
import com.starxflow.shared.database.DriverFactory
import com.starxflow.shared.database.StarXDatabase
import com.starxflow.shared.data.network.StarXApiClient
import com.starxflow.shared.data.repository.AgentRepositoryImpl
import com.starxflow.shared.data.repository.AuthRepositoryImpl
import com.starxflow.shared.data.repository.CalendarRepositoryImpl
import com.starxflow.shared.data.repository.CrmRepositoryImpl
import com.starxflow.shared.data.repository.DashboardRepositoryImpl
import com.starxflow.shared.data.repository.InboxRepositoryImpl
import com.starxflow.shared.data.repository.WorkflowRepositoryImpl
import com.starxflow.shared.domain.repository.AgentRepository
import com.starxflow.shared.domain.repository.AuthRepository
import com.starxflow.shared.domain.repository.CalendarRepository
import com.starxflow.shared.domain.repository.CrmRepository
import com.starxflow.shared.domain.repository.DashboardRepository
import com.starxflow.shared.domain.repository.InboxRepository
import com.starxflow.shared.domain.repository.WorkflowRepository

val sharedModule = module {
    single<StarXDatabase> {
        val driverFactory: DriverFactory = get()
        StarXDatabase(driverFactory.createDriver())
    }

    single {
        StarXApiClient(
            secureStorage = get()
        )
    }

    single<AuthRepository> {
        AuthRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }

    single<DashboardRepository> {
        DashboardRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }

    single<InboxRepository> {
        InboxRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }

    single<CrmRepository> {
        CrmRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }

    single<CalendarRepository> {
        CalendarRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }

    single<AgentRepository> {
        AgentRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }

    single<WorkflowRepository> {
        WorkflowRepositoryImpl(
            apiClient = get(),
            secureStorage = get(),
            database = get()
        )
    }
}
