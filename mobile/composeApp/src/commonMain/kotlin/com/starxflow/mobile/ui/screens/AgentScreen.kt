package com.starxflow.mobile.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXIconButton
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXStatusActive
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.AgentViewModel
import com.starxflow.shared.domain.model.Agent

@Composable
fun AgentScreen(
    viewModel: AgentViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val selected = state.selectedAgent
    val activeCount = state.agents.count { it.isActive }

    // Subtle breathing pulse for active agents
    val infiniteTransition = rememberInfiniteTransition()
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200),
            repeatMode = RepeatMode.Reverse
        )
    )

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
                    text = "Your AI Workforce",
                    color = StarXTextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Autonomous Business Operating Agents",
                    color = StarXTextMuted,
                    fontSize = 12.sp
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0x2610B981))
                    .border(1.dp, StarXBorderEmerald, RoundedCornerShape(20.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(StarXGreen.copy(alpha = pulseAlpha))
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "$activeCount / ${state.agents.size} Active",
                        color = StarXGreen,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Selected Agent Details Sheet / Modal
        AnimatedVisibility(
            visible = selected != null,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            if (selected != null) {
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
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(Color(0x2610B981)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = getAgentIcon(selected.role),
                                        contentDescription = null,
                                        tint = StarXGreen,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = selected.name,
                                        color = StarXTextPrimary,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Role: ${selected.role.replaceFirstChar { it.uppercase() }}",
                                        color = StarXGreen,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            StarXIconButton(
                                icon = Icons.Default.Close,
                                onClick = { viewModel.selectAgent(null) }
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = selected.description ?: "Active business operating agent for StarX ecosystem.",
                            color = StarXTextSecondary,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Text(
                            text = "Operational Directive & Instructions",
                            color = StarXGreen,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(StarXDarkSurface)
                                .border(1.dp, StarXBorder, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = selected.systemPrompt
                                    ?: "You are an autonomous AI operating agent for StarX Flow enterprise. Respond courteously, execute tools accurately, and respect tenant privacy boundaries at all times.",
                                color = StarXTextSecondary,
                                fontSize = 12.sp,
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(state.agents) { agent ->
                val icon = getAgentIcon(agent.role)
                val purposeText = when (agent.role.lowercase()) {
                    "receptionist", "support" -> "24/7 Inbound inquiry & FAQ resolution"
                    "booking", "calendar" -> "Automated slot discovery & appointment booking"
                    "sales", "lead" -> "Lead discovery, qualification & scoring"
                    "voice" -> "Voice concierge & call transcription"
                    else -> "Autonomous operations & workflow execution"
                }

                StarXCard(
                    tier = GlassTier.SUBTLE,
                    onClick = { viewModel.selectAgent(agent) }
                ) {
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
                                    .clip(CircleShape)
                                    .background(if (agent.isActive) Color(0x2610B981) else Color(0x14FFFFFF))
                                    .border(
                                        1.dp,
                                        if (agent.isActive) StarXBorderEmerald else Color(0x22FFFFFF),
                                        CircleShape
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = null,
                                    tint = if (agent.isActive) StarXGreen else StarXTextMuted,
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = agent.name,
                                        color = StarXTextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    if (agent.isActive) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(StarXGreen.copy(alpha = pulseAlpha))
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = purposeText,
                                    color = StarXTextSecondary,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        Switch(
                            checked = agent.isActive,
                            onCheckedChange = { isActive ->
                                viewModel.toggleAgent(agent.id, isActive)
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = StarXBlack,
                                checkedTrackColor = StarXGreen,
                                uncheckedThumbColor = StarXTextMuted,
                                uncheckedTrackColor = StarXDarkSurface
                            )
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(96.dp))
            }
        }
    }
}

private fun getAgentIcon(role: String): ImageVector {
    return when (role.lowercase()) {
        "receptionist", "whatsapp" -> Icons.Default.Chat
        "support" -> Icons.Default.SupportAgent
        "booking", "calendar" -> Icons.Default.CalendarToday
        "voice" -> Icons.Default.Phone
        "sales", "lead" -> Icons.Default.Group
        else -> Icons.Default.SmartToy
    }
}
