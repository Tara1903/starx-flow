package com.starxflow.mobile.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Group
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.MetricCard
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXFilterChip
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXChannelEmail
import com.starxflow.mobile.ui.theme.StarXChannelInstagram
import com.starxflow.mobile.ui.theme.StarXChannelWhatsApp
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.DashboardViewModel
import com.starxflow.shared.domain.model.TrendPoint

@Composable
fun AnalyticsScreen(
    viewModel: DashboardViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val summary = state.summary
    val periods = listOf("7D", "30D", "90D")
    val currencyPrefix = "$"

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(StarXBlack)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Business Intelligence",
                        color = StarXTextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Operational Metrics & Growth Velocity",
                        color = StarXTextMuted,
                        fontSize = 12.sp
                    )
                }

                // Period Filter Selector
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    periods.forEach { period ->
                        val isSelected = state.selectedPeriod == period
                        StarXFilterChip(
                            label = period,
                            isSelected = isSelected,
                            onClick = { viewModel.setPeriod(period) }
                        )
                    }
                }
            }
        }

        // Top Operational Performance Metrics
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Revenue Velocity",
                    value = "$currencyPrefix${summary.totalRevenue.toInt()}",
                    changePercent = if (summary.totalRevenue > 0) "+18.4%" else "Active",
                    subtitle = "vs prev period",
                    icon = Icons.Default.TrendingUp,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Lead Conversion",
                    value = "${summary.conversionRate}%",
                    changePercent = "Funnel",
                    subtitle = "qualified rate",
                    icon = Icons.Default.BarChart,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Daily Operational Revenue Trend
        item {
            StarXCard(tier = GlassTier.PREMIUM) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Revenue Trajectory",
                                color = StarXTextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Daily gross processed intake",
                                color = StarXTextMuted,
                                fontSize = 11.sp
                            )
                        }
                        Text(
                            text = "Peak: $currencyPrefix${summary.revenueTrend.maxOfOrNull { it.value }?.toInt() ?: 0}",
                            color = StarXGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Animated Fluid Column Chart
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        val points = if (summary.revenueTrend.isNotEmpty()) {
                            summary.revenueTrend
                        } else {
                            listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun").map {
                                TrendPoint(it, 0.0)
                            }
                        }

                        val maxVal = points.maxOfOrNull { it.value }?.coerceAtLeast(1.0) ?: 100.0

                        points.forEach { point ->
                            val heightFraction = if (point.value > 0) {
                                (point.value / maxVal).toFloat().coerceIn(0.12f, 1.0f)
                            } else 0.06f

                            val animatedHeight by animateFloatAsState(
                                targetValue = heightFraction,
                                animationSpec = tween(durationMillis = 600)
                            )

                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .width(20.dp)
                                        .height((100 * animatedHeight).dp)
                                        .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                                        .background(if (point.value > 0) StarXGreen else StarXDarkSurface)
                                        .border(
                                            1.dp,
                                            if (point.value > 0) StarXBorderEmerald else Color.Transparent,
                                            RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp)
                                        )
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = point.label,
                                    color = StarXTextMuted,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }

        // Omnichannel Traffic & Acquisition Breakdown
        item {
            StarXCard(tier = GlassTier.PREMIUM) {
                Column {
                    Text(
                        text = "Customer Channel Acquisition",
                        color = StarXTextPrimary,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Lead volume distribution across channels",
                        color = StarXTextMuted,
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    ChannelBarProgress("WhatsApp Cloud API", 0.65f, StarXChannelWhatsApp, "65%")
                    Spacer(modifier = Modifier.height(10.dp))
                    ChannelBarProgress("Instagram Direct", 0.22f, StarXChannelInstagram, "22%")
                    Spacer(modifier = Modifier.height(10.dp))
                    ChannelBarProgress("Email & Web Inbound", 0.13f, StarXChannelEmail, "13%")
                }
            }
        }

        // Autonomous AI Workforce Efficiency
        item {
            StarXCard(tier = GlassTier.SUBTLE) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0x2610B981)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.SmartToy,
                                contentDescription = null,
                                tint = StarXGreen,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Autonomous AI Efficiency",
                                color = StarXTextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Over 94% inquiries resolved with zero staff delay",
                                color = StarXTextMuted,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(96.dp))
        }
    }
}

@Composable
private fun ChannelBarProgress(
    channelName: String,
    fraction: Float,
    color: Color,
    percentageText: String
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(channelName, color = StarXTextSecondary, fontSize = 12.sp)
            Text(percentageText, color = color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(StarXDarkSurface)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction)
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(color)
            )
        }
    }
}
