package com.starxflow.mobile.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = StarXGreen,
    onPrimary = StarXBlack,
    secondary = StarXFreshGreen,
    onSecondary = StarXBlack,
    tertiary = StarXDarkGreen,
    background = StarXBlack,
    onBackground = StarXTextPrimary,
    surface = StarXCharcoal,
    onSurface = StarXTextPrimary,
    surfaceVariant = StarXElevatedSurface,
    onSurfaceVariant = StarXTextSecondary,
    outline = StarXBorder,
    outlineVariant = StarXBorderEmerald,
    error = StarXStatusError,
    onError = StarXTextPrimary
)

@Composable
fun StarXTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
