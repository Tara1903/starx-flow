package com.starxflow.mobile

import androidx.compose.ui.window.ComposeUIViewController
import org.koin.core.context.GlobalContext
import org.koin.core.context.startKoin
import org.koin.dsl.module
import platform.UIKit.UIViewController
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.database.DriverFactory
import com.starxflow.shared.di.sharedModule

fun MainViewController(): UIViewController {
    if (GlobalContext.getOrNull() == null) {
        startKoin {
            modules(
                sharedModule,
                module {
                    single { DriverFactory() }
                    single { SecureStorage() }
                }
            )
        }
    }
    return ComposeUIViewController {
        App()
    }
}
