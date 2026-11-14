package com.starxflow.mobile

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SmartToy
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.koin.compose.koinInject
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.StarXAvatar
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXIconButton
import com.starxflow.mobile.ui.screens.AgentScreen
import com.starxflow.mobile.ui.screens.AnalyticsScreen
import com.starxflow.mobile.ui.screens.AuthScreen
import com.starxflow.mobile.ui.screens.CalendarScreen
import com.starxflow.mobile.ui.screens.CrmScreen
import com.starxflow.mobile.ui.screens.DashboardScreen
import com.starxflow.mobile.ui.screens.InboxScreen
import com.starxflow.mobile.ui.screens.WorkflowScreen
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXCharcoal
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXSecondaryBg
import com.starxflow.mobile.ui.theme.StarXStatusActive
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.theme.StarXTheme
import com.starxflow.mobile.ui.viewmodel.AgentViewModel
import com.starxflow.mobile.ui.viewmodel.AuthViewModel
import com.starxflow.mobile.ui.viewmodel.CalendarViewModel
import com.starxflow.mobile.ui.viewmodel.CrmViewModel
import com.starxflow.mobile.ui.viewmodel.DashboardViewModel
import com.starxflow.mobile.ui.viewmodel.InboxViewModel
import com.starxflow.mobile.ui.viewmodel.WorkflowViewModel
import com.starxflow.shared.domain.repository.AgentRepository
import com.starxflow.shared.domain.repository.AuthRepository
import com.starxflow.shared.domain.repository.CalendarRepository
import com.starxflow.shared.domain.repository.CrmRepository
import com.starxflow.shared.domain.repository.DashboardRepository
import com.starxflow.shared.domain.repository.InboxRepository
import com.starxflow.shared.domain.repository.WorkflowRepository

enum class NavigationTab(val label: String, val icon: ImageVector) {
    DASHBOARD("Home", Icons.Default.Dashboard),
    INBOX("Inbox", Icons.Default.Chat),
    AGENTS("AI Fleet", Icons.Default.SmartToy),
    CALENDAR("Calendar", Icons.Default.CalendarToday),
    MORE("More", Icons.Default.MoreHoriz),
    // Sub-screens routed through More
    CRM("Leads", Icons.Default.Group),
    AUTOMATION("Flows", Icons.Default.Bolt),
    ANALYTICS("Analytics", Icons.Default.BarChart)
}

@Composable
fun App() {
    StarXTheme {
        // Resolve Repositories and Services from Koin
        val apiClient: com.starxflow.shared.data.network.StarXApiClient = koinInject()
        val authRepo: AuthRepository = koinInject()
        val dashboardRepo: DashboardRepository = koinInject()
        val inboxRepo: InboxRepository = koinInject()
        val crmRepo: CrmRepository = koinInject()
        val calendarRepo: CalendarRepository = koinInject()
        val agentRepo: AgentRepository = koinInject()
        val workflowRepo: WorkflowRepository = koinInject()

        // Remember ViewModels with repository bindings
        val authViewModel = remember { AuthViewModel(authRepo, apiClient) }
        val dashboardViewModel = remember { DashboardViewModel(dashboardRepo) }
        val inboxViewModel = remember { InboxViewModel(inboxRepo) }
        val crmViewModel = remember { CrmViewModel(crmRepo) }
        val calendarViewModel = remember { CalendarViewModel(calendarRepo) }
        val agentViewModel = remember { AgentViewModel(agentRepo) }
        val workflowViewModel = remember { WorkflowViewModel(workflowRepo) }

        val currentUser by authViewModel.currentUser.collectAsState()
        val inboxState by inboxViewModel.uiState.collectAsState()
        val unreadTotal = inboxState.conversations.sumOf { it.unreadCount }

        var currentTab by remember { mutableStateOf(NavigationTab.DASHBOARD) }
        var showMoreSheet by remember { mutableStateOf(false) }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(StarXBlack)
                .statusBarsPadding()
        ) {
            if (currentUser == null) {
                AuthScreen(viewModel = authViewModel)
            } else {
                // Main Authenticated Command Center Shell
                Column(modifier = Modifier.fillMaxSize()) {
                    // Top App Header
                    GlassSurface(
                        tier = GlassTier.SUBTLE,
                        shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                StarXAvatar(
                                    name = currentUser?.businessName ?: "StarX",
                                    size = 36.dp
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = currentUser?.businessName ?: "StarX Enterprise",
                                        color = StarXTextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(StarXGreen)
                                        )
                                        Spacer(modifier = Modifier.width(5.dp))
                                        Text(
                                            text = "${currentUser?.name ?: "Leader"} • ${currentUser?.role?.uppercase() ?: "OWNER"}",
                                            color = StarXTextSecondary,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                StarXIconButton(
                                    icon = Icons.Default.Notifications,
                                    onClick = { /* notification panel */ },
                                    contentDescription = "Notifications",
                                    badgeCount = unreadTotal
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                StarXIconButton(
                                    icon = Icons.Default.ExitToApp,
                                    onClick = { authViewModel.logout() },
                                    contentDescription = "Sign Out",
                                    tint = StarXTextSecondary
                                )
                            }
                        }
                    }

                    // Primary Screen Body with Crossfade
                    Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                        Crossfade(targetState = currentTab) { tab ->
                            when (tab) {
                                NavigationTab.DASHBOARD -> DashboardScreen(
                                    user = currentUser,
                                    viewModel = dashboardViewModel,
                                    onNavigateToInbox = { currentTab = NavigationTab.INBOX },
                                    onNavigateToCrm = { currentTab = NavigationTab.CRM },
                                    onNavigateToCalendar = { currentTab = NavigationTab.CALENDAR },
                                    onNavigateToAgents = { currentTab = NavigationTab.AGENTS }
                                )
                                NavigationTab.INBOX -> InboxScreen(viewModel = inboxViewModel)
                                NavigationTab.AGENTS -> AgentScreen(viewModel = agentViewModel)
                                NavigationTab.CALENDAR -> CalendarScreen(viewModel = calendarViewModel)
                                NavigationTab.CRM -> CrmScreen(viewModel = crmViewModel)
                                NavigationTab.AUTOMATION -> WorkflowScreen(viewModel = workflowViewModel)
                                NavigationTab.ANALYTICS -> AnalyticsScreen(viewModel = dashboardViewModel)
                                NavigationTab.MORE -> DashboardScreen(
                                    user = currentUser,
                                    viewModel = dashboardViewModel,
                                    onNavigateToInbox = { currentTab = NavigationTab.INBOX },
                                    onNavigateToCrm = { currentTab = NavigationTab.CRM },
                                    onNavigateToCalendar = { currentTab = NavigationTab.CALENDAR },
                                    onNavigateToAgents = { currentTab = NavigationTab.AGENTS }
                                )
                            }
                        }
                    }
                }

                // Floating Liquid Glass Navigation Capsule Dock (Apple Liquid Glass + Linear Style)
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .navigationBarsPadding()
                        .padding(bottom = 14.dp, start = 20.dp, end = 20.dp)
                ) {
                    GlassSurface(
                        tier = GlassTier.FOCAL,
                        shape = RoundedCornerShape(30.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 10.dp, vertical = 7.dp),
                            horizontalArrangement = Arrangement.SpaceAround,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            listOf(
                                NavigationTab.DASHBOARD,
                                NavigationTab.INBOX,
                                NavigationTab.AGENTS,
                                NavigationTab.CALENDAR,
                                NavigationTab.MORE
                            ).forEach { tab ->
                                val isSelected = when (tab) {
                                    NavigationTab.MORE -> showMoreSheet || currentTab in listOf(
                                        NavigationTab.CRM,
                                        NavigationTab.AUTOMATION,
                                        NavigationTab.ANALYTICS
                                    )
                                    else -> currentTab == tab && !showMoreSheet
                                }

                                val scale by animateFloatAsState(
                                    targetValue = if (isSelected) 1.05f else 1.0f,
                                    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium)
                                )

                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier
                                        .scale(scale)
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(if (isSelected) StarXGreen.copy(alpha = 0.16f) else Color.Transparent)
                                        .clickable {
                                            if (tab == NavigationTab.MORE) {
                                                showMoreSheet = !showMoreSheet
                                            } else {
                                                showMoreSheet = false
                                                currentTab = tab
                                            }
                                        }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Box {
                                        Icon(
                                            imageVector = tab.icon,
                                            contentDescription = tab.label,
                                            tint = if (isSelected) StarXGreen else StarXTextMuted,
                                            modifier = Modifier.size(21.dp)
                                        )
                                        if (tab == NavigationTab.INBOX && unreadTotal > 0) {
                                            Box(
                                                modifier = Modifier
                                                    .align(Alignment.TopEnd)
                                                    .size(8.dp)
                                                    .clip(CircleShape)
                                                    .background(StarXGreen)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = tab.label,
                                        color = if (isSelected) StarXGreen else StarXTextMuted,
                                        fontSize = 10.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }

                // "More" Liquid Glass Hub Sheet
                AnimatedVisibility(
                    visible = showMoreSheet,
                    enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                    exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
                    modifier = Modifier.align(Alignment.BottomCenter)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color(0x8A060B08))
                            .clickable { showMoreSheet = false },
                        contentAlignment = Alignment.BottomCenter
                    ) {
                        GlassSurface(
                            tier = GlassTier.FOCAL,
                            shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = false) {}
                        ) {
                            Column(
                                modifier = Modifier
                                    .padding(24.dp)
                                    .navigationBarsPadding()
                                    .padding(bottom = 70.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Business Operations Hub",
                                            color = StarXTextPrimary,
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Management & Operating System Modules",
                                            color = StarXTextMuted,
                                            fontSize = 12.sp
                                        )
                                    }
                                    StarXIconButton(
                                        icon = Icons.Default.Close,
                                        onClick = { showMoreSheet = false }
                                    )
                                }

                                Spacer(modifier = Modifier.height(20.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    MoreItemCard(
                                        title = "CRM & Leads",
                                        subtitle = "Customer database",
                                        icon = Icons.Default.Group,
                                        onClick = {
                                            currentTab = NavigationTab.CRM
                                            showMoreSheet = false
                                        },
                                        modifier = Modifier.weight(1f)
                                    )
                                    MoreItemCard(
                                        title = "Automations",
                                        subtitle = "Operating flows",
                                        icon = Icons.Default.Bolt,
                                        onClick = {
                                            currentTab = NavigationTab.AUTOMATION
                                            showMoreSheet = false
                                        },
                                        modifier = Modifier.weight(1f)
                                    )
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    MoreItemCard(
                                        title = "Analytics",
                                        subtitle = "Growth & Revenue",
                                        icon = Icons.Default.BarChart,
                                        onClick = {
                                            currentTab = NavigationTab.ANALYTICS
                                            showMoreSheet = false
                                        },
                                        modifier = Modifier.weight(1f)
                                    )
                                    MoreItemCard(
                                        title = "Sign Out",
                                        subtitle = "End active session",
                                        icon = Icons.Default.ExitToApp,
                                        onClick = {
                                            showMoreSheet = false
                                            authViewModel.logout()
                                        },
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MoreItemCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    StarXCard(
        modifier = modifier,
        tier = GlassTier.PREMIUM,
        onClick = onClick
    ) {
        Column {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color(0x1F10B981)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = StarXGreen,
                    modifier = Modifier.size(18.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = title,
                color = StarXTextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                color = StarXTextMuted,
                fontSize = 11.sp
            )
        }
    }
}
