package com.starxflow.mobile.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.EmptyState
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.StarXAvatar
import com.starxflow.mobile.ui.components.StarXButton
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXFilterChip
import com.starxflow.mobile.ui.components.StarXIconButton
import com.starxflow.mobile.ui.components.StarXTextField
import com.starxflow.mobile.ui.components.StatusIndicator
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXStatusActive
import com.starxflow.mobile.ui.theme.StarXStatusError
import com.starxflow.mobile.ui.theme.StarXStatusInfo
import com.starxflow.mobile.ui.theme.StarXStatusWarning
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.CalendarViewModel

@Composable
fun CalendarScreen(
    viewModel: CalendarViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    var showBookingDialog by remember { mutableStateOf(false) }

    var customerNameInput by remember { mutableStateOf("") }
    var serviceNameInput by remember { mutableStateOf("") }
    var startTimeInput by remember { mutableStateOf("2026-11-15T10:00:00Z") }
    var endTimeInput by remember { mutableStateOf("2026-11-15T11:00:00Z") }

    val days = listOf("Today", "Tomorrow", "This Week", "Next Week")
    var selectedDayFilter by remember { mutableStateOf("Today") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(StarXBlack)
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Calendar & Bookings",
                    color = StarXTextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Timezone: Europe/Berlin • Synced",
                    color = StarXTextMuted,
                    fontSize = 12.sp
                )
            }

            StarXButton(
                text = "New Slot",
                onClick = { showBookingDialog = true },
                leadingIcon = Icons.Default.Add
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Agenda Timeframe Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(days) { day ->
                StarXFilterChip(
                    label = day,
                    isSelected = selectedDayFilter == day,
                    onClick = { selectedDayFilter = day }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Create Booking Bottom Sheet / Dialog
        AnimatedVisibility(
            visible = showBookingDialog,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            GlassSurface(
                tier = GlassTier.FOCAL,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Schedule Appointment",
                            color = StarXTextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        StarXIconButton(
                            icon = Icons.Default.Close,
                            onClick = { showBookingDialog = false }
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    StarXTextField(
                        value = customerNameInput,
                        onValueChange = { customerNameInput = it },
                        placeholder = "Customer name (e.g. John Doe)",
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    StarXTextField(
                        value = serviceNameInput,
                        onValueChange = { serviceNameInput = it },
                        placeholder = "Service / Consultation type",
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    StarXTextField(
                        value = startTimeInput,
                        onValueChange = { startTimeInput = it },
                        placeholder = "Start time (ISO-8601)",
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    StarXButton(
                        text = "Confirm & Dispatch Notification",
                        onClick = {
                            if (customerNameInput.isNotBlank() && serviceNameInput.isNotBlank()) {
                                viewModel.createBooking(
                                    customerName = customerNameInput,
                                    customerPhone = null,
                                    serviceName = serviceNameInput,
                                    startTime = startTimeInput,
                                    endTime = endTimeInput
                                )
                                showBookingDialog = false
                                customerNameInput = ""
                                serviceNameInput = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        if (state.appointments.isEmpty()) {
            EmptyState(
                title = "No Bookings Scheduled",
                description = "Your calendar has no active appointments for this timeframe. When customers book via WhatsApp AI Receptionist or Google Calendar, slots appear here.",
                icon = Icons.Default.CalendarToday,
                actionButtonText = "Schedule Appointment",
                onActionClick = { showBookingDialog = true }
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(state.appointments) { appt ->
                    StarXCard(tier = GlassTier.SUBTLE) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0x1F10B981))
                                        .border(1.dp, StarXBorderEmerald, RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Schedule,
                                        contentDescription = null,
                                        tint = StarXGreen,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                Column {
                                    Text(
                                        text = appt.customerName,
                                        color = StarXTextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "${appt.serviceName} • 45 mins",
                                        color = StarXTextSecondary,
                                        fontSize = 12.sp
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = appt.startTime.take(16).replace("T", " "),
                                        color = StarXGreen,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }

                            StatusIndicator(appt.status)
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(96.dp))
                }
            }
        }
    }
}
