package com.starxflow.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.GlobalContext
import org.koin.core.context.startKoin
import org.koin.dsl.module
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.database.DriverFactory
import com.starxflow.shared.di.sharedModule

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (GlobalContext.getOrNull() == null) {
            startKoin {
                androidContext(this@MainActivity)
                modules(
                    sharedModule,
                    module {
                        single { DriverFactory(this@MainActivity) }
                        single { SecureStorage(this@MainActivity) }
                    }
                )
            }
        }

        setContent {
            App()
        }
    }
}
