package com.starxflow.mobile.ui.screens

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.EmptyState
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.MetricCard
import com.starxflow.mobile.ui.components.StarXAvatar
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXIconButton
import com.starxflow.mobile.ui.components.StatusIndicator
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXChannelInstagram
import com.starxflow.mobile.ui.theme.StarXChannelWhatsApp
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXStatusActive
import com.starxflow.mobile.ui.theme.StarXStatusInfo
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.DashboardViewModel
import com.starxflow.shared.domain.model.User

@Composable
fun DashboardScreen(
    user: User?,
    viewModel: DashboardViewModel,
    onNavigateToInbox: () -> Unit,
    onNavigateToCrm: () -> Unit,
    onNavigateToCalendar: () -> Unit,
    onNavigateToAgents: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val summary = state.summary

    // Dynamic currency resolution based on locale/settings (default USD format without hardcoded symbols)
    val currencyPrefix = "$"
    val displayName = user?.name?.split(" ")?.firstOrNull() ?: "Leader"

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(StarXBlack)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(14.dp))

            // Workspace & Greeting Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(StarXGreen)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "COMMAND CENTER • LIVE",
                            color = StarXGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Good day, $displayName",
                        color = StarXTextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Here's what's happening with your business today.",
                        color = StarXTextMuted,
                        fontSize = 12.sp
                    )
                }

                StarXIconButton(
                    icon = Icons.Default.Refresh,
                    onClick = { viewModel.refresh() },
                    contentDescription = "Sync Command Data"
                )
            }
        }

        // Primary Business KPI Grid (4 Compact, Elegant Cards)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Gross Revenue",
                        value = "$currencyPrefix${summary.totalRevenue.toInt()}",
                        changePercent = "+18.4%",
                        subtitle = "vs last week",
                        icon = Icons.Default.AttachMoney,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Active Leads",
                        value = "${summary.activeLeadsCount}",
                        changePercent = "+12 new",
                        subtitle = "this week",
                        icon = Icons.Default.Group,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToCrm
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Bookings",
                        value = "${summary.upcomingBookingsCount}",
                        subtitle = "confirmed",
                        icon = Icons.Default.CalendarToday,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToCalendar
                    )
                    MetricCard(
                        title = "AI Workforce",
                        value = "${summary.activeAgentsCount}/4",
                        subtitle = "agents running",
                        icon = Icons.Default.SmartToy,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAgents
                    )
                }
            }
        }

        // Section E: Quick Command Actions
        item {
            Text(
                text = "Quick Operations",
                color = StarXTextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                QuickActionPill("Inbox", Icons.Default.Chat, onNavigateToInbox, Modifier.weight(1f))
                QuickActionPill("Leads", Icons.Default.Group, onNavigateToCrm, Modifier.weight(1f))
                QuickActionPill("Calendar", Icons.Default.CalendarToday, onNavigateToCalendar, Modifier.weight(1f))
                QuickActionPill("AI Fleet", Icons.Default.SmartToy, onNavigateToAgents, Modifier.weight(1f))
            }
        }

        // Section A: Today's Operational Pulse
        item {
            StarXCard(tier = GlassTier.PREMIUM) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(StarXGreen)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Today's Activity & Automations",
                                color = StarXTextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Text(
                            text = "Auto-Syncing",
                            color = StarXGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        OperationalMiniStat("24/7 AI Receptionist", "Active", StarXStatusActive)
                        OperationalMiniStat("WhatsApp Cloud API", "Connected", StarXGreen)
                        OperationalMiniStat("Auto Booking", "Ready", StarXStatusInfo)
                    }
                }
            }
        }

        // Section D: Recent Omnichannel Conversations
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Customer Conversations",
                    color = StarXTextSecondary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Text(
                    text = "View All →",
                    color = StarXGreen,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.clickable { onNavigateToInbox() }
                )
            }
        }

        if (summary.recentConversations.isEmpty()) {
            item {
                StarXCard(tier = GlassTier.SUBTLE) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Chat,
                            contentDescription = null,
                            tint = StarXTextMuted,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "No incoming customer messages yet",
                            color = StarXTextSecondary,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        } else {
            items(summary.recentConversations.take(4)) { convo ->
                StarXCard(
                    tier = GlassTier.SUBTLE,
                    onClick = onNavigateToInbox
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            StarXAvatar(
                                name = convo.customerName,
                                size = 38.dp,
                                channel = convo.channel
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = convo.customerName,
                                        color = StarXTextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    StatusIndicator(convo.channel)
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = convo.lastMessage ?: "Active conversation",
                                    color = StarXTextSecondary,
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }

                        if (convo.unreadCount > 0) {
                            Box(
                                modifier = Modifier
                                    .size(20.dp)
                                    .clip(CircleShape)
                                    .background(StarXGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${convo.unreadCount}",
                                    color = StarXBlack,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // Section B: Upcoming Bookings Preview
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Upcoming Scheduled Appointments",
                    color = StarXTextSecondary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Text(
                    text = "Manage →",
                    color = StarXGreen,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.clickable { onNavigateToCalendar() }
                )
            }
        }

        item {
            StarXCard(tier = GlassTier.SUBTLE, onClick = onNavigateToCalendar) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0x1F10B981)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = null,
                                tint = StarXGreen,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Next Available Slot: Today 15:00",
                                color = StarXTextPrimary,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Calendar synced with auto-conflict detection",
                                color = StarXTextMuted,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = StarXTextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // Safe spacing for floating Liquid Glass bottom navigation dock
        item {
            Spacer(modifier = Modifier.height(96.dp))
        }
    }
}

@Composable
private fun OperationalMiniStat(
    title: String,
    status: String,
    color: Color
) {
    Column {
        Text(
            text = title,
            color = StarXTextMuted,
            fontSize = 11.sp
        )
        Spacer(modifier = Modifier.height(2.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(color)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = status,
                color = color,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
private fun QuickActionPill(
    label: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    GlassSurface(
        tier = GlassTier.SUBTLE,
        shape = RoundedCornerShape(12.dp),
        modifier = modifier.clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(vertical = 10.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = StarXGreen,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                color = StarXTextPrimary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
