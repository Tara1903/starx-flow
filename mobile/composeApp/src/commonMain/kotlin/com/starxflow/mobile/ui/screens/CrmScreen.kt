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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Search
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.EmptyState
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.StarXAvatar
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXFilterChip
import com.starxflow.mobile.ui.components.StarXIconButton
import com.starxflow.mobile.ui.components.StarXSearchBar
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
import com.starxflow.mobile.ui.theme.StarXStatusWarning
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.CrmViewModel
import com.starxflow.shared.domain.model.Lead

@Composable
fun CrmScreen(
    viewModel: CrmViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val selected = state.selectedLead

    if (selected != null) {
        LeadDetailSheet(
            lead = selected,
            onBack = { viewModel.selectLead(null) },
            onUpdateStatus = { viewModel.updateLeadStatus(selected.id, it) },
            modifier = modifier
        )
    } else {
        LeadListView(
            state = state,
            onSelectLead = { viewModel.selectLead(it) },
            onSelectStatus = { viewModel.setStatusFilter(it) },
            onSearchChange = { viewModel.setSearchQuery(it) },
            modifier = modifier
        )
    }
}

@Composable
private fun LeadListView(
    state: com.starxflow.mobile.ui.viewmodel.CrmUiState,
    onSelectLead: (Lead) -> Unit,
    onSelectStatus: (String) -> Unit,
    onSearchChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val statuses = listOf("All", "new", "contacted", "qualified", "converted", "lost")

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
                    text = "Customer CRM & Leads",
                    color = StarXTextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Lead Qualification & Contact Intelligence",
                    color = StarXTextMuted,
                    fontSize = 12.sp
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0x2610B981))
                    .border(1.dp, StarXBorderEmerald, RoundedCornerShape(12.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Text(
                    text = "${state.leads.size} Contacts",
                    color = StarXGreen,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar
        StarXSearchBar(
            value = state.searchQuery,
            onValueChange = onSearchChange,
            placeholder = "Search leads, emails, phones...",
            leadingIcon = Icons.Default.Search,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Status Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(statuses) { status ->
                val isSelected = state.selectedStatus == status
                val count = if (status == "All") null else {
                    val c = state.leads.count { it.status.equals(status, ignoreCase = true) }
                    if (c > 0) c else null
                }
                StarXFilterChip(
                    label = status.replaceFirstChar { it.uppercase() },
                    isSelected = isSelected,
                    onClick = { onSelectStatus(status) },
                    badgeCount = count
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (state.filteredLeads.isEmpty()) {
            EmptyState(
                title = "No Customers Found",
                description = "No leads or customers match the selected filter. Leads created manually or captured via WhatsApp and web chats will appear here.",
                icon = Icons.Default.Group
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(state.filteredLeads) { lead ->
                    StarXCard(
                        tier = GlassTier.SUBTLE,
                        onClick = { onSelectLead(lead) }
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
                                StarXAvatar(
                                    name = lead.name,
                                    size = 40.dp,
                                    channel = lead.source
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = lead.name,
                                            color = StarXTextPrimary,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        StatusIndicator(lead.status)
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = lead.phone ?: lead.email ?: "Source: ${lead.source}",
                                        color = StarXTextSecondary,
                                        fontSize = 12.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }

                            // Lead Score Pill Meter
                            val scoreColor = when {
                                lead.score >= 80 -> StarXStatusActive
                                lead.score >= 50 -> StarXStatusWarning
                                else -> StarXTextMuted
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(scoreColor.copy(alpha = 0.15f))
                                    .border(1.dp, scoreColor.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "Score ${lead.score}",
                                    color = scoreColor,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
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

@Composable
private fun LeadDetailSheet(
    lead: Lead,
    onBack: () -> Unit,
    onUpdateStatus: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val statusOptions = listOf("new", "contacted", "qualified", "converted", "lost")

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(StarXBlack)
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(14.dp))

        // Detail Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            StarXIconButton(
                icon = Icons.AutoMirrored.Filled.ArrowBack,
                onClick = onBack
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = lead.name,
                    color = StarXTextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Customer Profile & Activity",
                    color = StarXTextMuted,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Contact Info Card
        StarXCard(tier = GlassTier.PREMIUM) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    StarXAvatar(name = lead.name, size = 52.dp, channel = lead.source)
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = lead.name,
                            color = StarXTextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            StatusIndicator(lead.status)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Lead Score: ${lead.score}/100",
                                color = StarXGreen,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (lead.phone != null) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Phone, contentDescription = null, tint = StarXGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(lead.phone!!, color = StarXTextPrimary, fontSize = 13.sp)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }

                if (lead.email != null) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Email, contentDescription = null, tint = StarXGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(lead.email!!, color = StarXTextPrimary, fontSize = 13.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Pipeline Status Stage Selector
        Text(
            text = "Update Pipeline Stage",
            color = StarXTextSecondary,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(8.dp))

        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(statusOptions) { status ->
                val isCurrent = lead.status.equals(status, ignoreCase = true)
                StarXFilterChip(
                    label = status.replaceFirstChar { it.uppercase() },
                    isSelected = isCurrent,
                    onClick = { onUpdateStatus(status) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Notes & Activity Section
        Text(
            text = "Lead Notes & Context",
            color = StarXTextSecondary,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(8.dp))

        GlassSurface(
            tier = GlassTier.SUBTLE,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = lead.notes ?: "No customer notes recorded yet. Conversations and automated qualification data are captured here automatically.",
                    color = StarXTextSecondary,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
