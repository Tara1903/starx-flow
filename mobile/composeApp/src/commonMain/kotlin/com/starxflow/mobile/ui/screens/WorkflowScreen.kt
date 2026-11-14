package com.starxflow.mobile.ui.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.SmartToy
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.MetricCard
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StatusIndicator
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
import com.starxflow.mobile.ui.viewmodel.WorkflowViewModel
import com.starxflow.shared.domain.model.Workflow

@Composable
fun WorkflowScreen(
    viewModel: WorkflowViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val totalSavedHours = state.workflows.sumOf { it.savedHours }
    val totalExecutions = state.workflows.sumOf { it.executionsCount }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(StarXBlack)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Automation Center",
                color = StarXTextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Autonomous Operating Workflows & Integrations",
                color = StarXTextMuted,
                fontSize = 12.sp
            )
        }

        // Operational Metric Overview
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Hours Saved",
                    value = "${totalSavedHours.toInt()} hrs",
                    changePercent = "Automated",
                    icon = Icons.Default.Bolt,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Executions",
                    value = "$totalExecutions runs",
                    subtitle = "100% success rate",
                    icon = Icons.Default.CheckCircle,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Text(
                text = "Active Workflow Pipelines",
                color = StarXTextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        items(state.workflows) { wf ->
            WorkflowFlowCard(
                workflow = wf,
                onToggle = { isActive -> viewModel.toggleWorkflow(wf.id, isActive) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(96.dp))
        }
    }
}

@Composable
private fun WorkflowFlowCard(
    workflow: Workflow,
    onToggle: (Boolean) -> Unit
) {
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
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(Color(0x1F10B981)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = StarXGreen,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = workflow.name,
                            color = StarXTextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Channel: ${workflow.channel}",
                            color = StarXTextMuted,
                            fontSize = 11.sp
                        )
                    }
                }

                Switch(
                    checked = workflow.isActive,
                    onCheckedChange = onToggle,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = StarXBlack,
                        checkedTrackColor = StarXGreen,
                        uncheckedThumbColor = StarXTextMuted,
                        uncheckedTrackColor = StarXDarkSurface
                    )
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Visual Flow Diagram (Trigger ───> AI ───> Action)
            GlassSurface(
                tier = GlassTier.SUBTLE,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    FlowNodeStep(
                        title = "TRIGGER",
                        desc = workflow.trigger ?: "Customer msg"
                    )

                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Flow",
                        tint = StarXGreen,
                        modifier = Modifier.size(14.dp)
                    )

                    FlowNodeStep(
                        title = "AI AGENT",
                        desc = "Analyze & Route"
                    )

                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Flow",
                        tint = StarXGreen,
                        modifier = Modifier.size(14.dp)
                    )

                    FlowNodeStep(
                        title = "ACTION",
                        desc = workflow.action ?: "Dispatch reply"
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Operational Stats Footer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${workflow.executionsCount} total executions",
                    color = StarXTextMuted,
                    fontSize = 11.sp
                )
                Text(
                    text = "${workflow.savedHours.toInt()} hrs saved",
                    color = StarXGreen,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
private fun FlowNodeStep(
    title: String,
    desc: String
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = title,
            color = StarXGreen,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = desc,
            color = StarXTextPrimary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 1
        )
    }
}
