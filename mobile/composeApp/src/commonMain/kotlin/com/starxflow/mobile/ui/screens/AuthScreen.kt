package com.starxflow.mobile.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.StarXButton
import com.starxflow.mobile.ui.components.StarXTextField
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXStatusError
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.AuthUiState
import com.starxflow.mobile.ui.viewmodel.AuthViewModel

@Composable
fun AuthScreen(
    viewModel: AuthViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    var emailInput by remember { mutableStateOf("") }
    var otpInput by remember { mutableStateOf("") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF0F261E),
                        StarXBlack,
                        StarXBlack
                    ),
                    radius = 1200f
                )
            )
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Brand Logo & Header
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            listOf(StarXGreen, StarXFreshGreen)
                        )
                    )
                    .border(2.dp, StarXBorderEmerald, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = "StarX Logo",
                    tint = StarXBlack,
                    modifier = Modifier.size(36.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "StarX Flow",
                color = StarXTextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Build Smarter. Automate Everything.",
                color = StarXTextSecondary,
                fontSize = 14.sp
            )

            Spacer(modifier = Modifier.height(36.dp))

            // Auth Glass Card
            GlassSurface(
                tier = GlassTier.FOCAL,
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    when (val currentState = state) {
                        is AuthUiState.Initial, is AuthUiState.Error, is AuthUiState.Loading -> {
                            Text(
                                text = "Sign in to Command Center",
                                color = StarXTextPrimary,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "Enter your business email. We'll send an official 8-digit verification code.",
                                color = StarXTextSecondary,
                                fontSize = 13.sp,
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            StarXTextField(
                                value = emailInput,
                                onValueChange = { emailInput = it },
                                placeholder = "owner@business.com",
                                label = "Business Email",
                                leadingIcon = Icons.Default.Email,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                            )

                            if (currentState is AuthUiState.Error) {
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = currentState.message,
                                    color = StarXStatusError,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center
                                )
                            }

                            Spacer(modifier = Modifier.height(24.dp))

                            StarXButton(
                                text = "Send 8-Digit Code",
                                onClick = { viewModel.sendOtp(emailInput) },
                                isLoading = currentState is AuthUiState.Loading,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        is AuthUiState.OtpSent -> {
                            Text(
                                text = "Enter Verification Code",
                                color = StarXTextPrimary,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "Sent to ${currentState.email}. Preserves 8 digits.",
                                color = StarXTextSecondary,
                                fontSize = 13.sp,
                                textAlign = TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            StarXTextField(
                                value = otpInput,
                                onValueChange = {
                                    if (it.length <= 8) {
                                        otpInput = it
                                        if (it.length == 8) {
                                            viewModel.verifyOtp(currentState.email, it)
                                        }
                                    }
                                },
                                placeholder = "12345678",
                                label = "8-Digit OTP Code",
                                leadingIcon = Icons.Default.Lock,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                            )

                            if (currentState.error != null) {
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = currentState.error,
                                    color = StarXStatusError,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center
                                )
                            }

                            Spacer(modifier = Modifier.height(24.dp))

                            StarXButton(
                                text = "Verify & Access Workspace",
                                onClick = { viewModel.verifyOtp(currentState.email, otpInput) },
                                isLoading = currentState.isVerifying,
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            StarXButton(
                                text = "Back / Change Email",
                                onClick = { viewModel.resetState() },
                                isSecondary = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        is AuthUiState.Authenticated -> {
                            Text(
                                text = "Authenticated!",
                                color = StarXGreen,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Welcome back, ${currentState.user.name}",
                                color = StarXTextSecondary,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Protected by StarX Enterprise Shield & Supabase RLS",
                color = StarXTextMuted,
                fontSize = 11.sp
            )
        }
    }
}
