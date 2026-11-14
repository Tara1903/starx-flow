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
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.starxflow.mobile.ui.components.AIResponseSuggestionChip
import com.starxflow.mobile.ui.components.EmptyState
import com.starxflow.mobile.ui.components.GlassSurface
import com.starxflow.mobile.ui.components.GlassTier
import com.starxflow.mobile.ui.components.StarXAvatar
import com.starxflow.mobile.ui.components.StarXCard
import com.starxflow.mobile.ui.components.StarXFilterChip
import com.starxflow.mobile.ui.components.StarXIconButton
import com.starxflow.mobile.ui.components.StarXSearchBar
import com.starxflow.mobile.ui.components.StarXTextField
import com.starxflow.mobile.ui.components.StatusIndicator
import com.starxflow.mobile.ui.theme.StarXBlack
import com.starxflow.mobile.ui.theme.StarXBorder
import com.starxflow.mobile.ui.theme.StarXBorderActive
import com.starxflow.mobile.ui.theme.StarXBorderEmerald
import com.starxflow.mobile.ui.theme.StarXCharcoal
import com.starxflow.mobile.ui.theme.StarXDarkSurface
import com.starxflow.mobile.ui.theme.StarXElevatedSurface
import com.starxflow.mobile.ui.theme.StarXFreshGreen
import com.starxflow.mobile.ui.theme.StarXGreen
import com.starxflow.mobile.ui.theme.StarXStatusActive
import com.starxflow.mobile.ui.theme.StarXStatusWarning
import com.starxflow.mobile.ui.theme.StarXTextMuted
import com.starxflow.mobile.ui.theme.StarXTextPrimary
import com.starxflow.mobile.ui.theme.StarXTextSecondary
import com.starxflow.mobile.ui.viewmodel.InboxViewModel
import com.starxflow.shared.domain.model.Conversation
import com.starxflow.shared.domain.model.Message

@Composable
fun InboxScreen(
    viewModel: InboxViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val selected = state.selectedConversation

    if (selected != null) {
        ChatDetailView(
            conversation = selected,
            messages = state.messages,
            isSending = state.isSending,
            onBack = { viewModel.selectConversation(null) },
            onSendMessage = { viewModel.sendMessage(it) },
            onToggleTakeover = { mode, reason -> viewModel.toggleControlMode(mode, reason) },
            modifier = modifier
        )
    } else {
        ConversationListView(
            state = state,
            onSelectConversation = { viewModel.selectConversation(it) },
            onSelectChannel = { viewModel.setChannelFilter(it) },
            onSearchChange = { viewModel.setSearchQuery(it) },
            modifier = modifier
        )
    }
}

@Composable
private fun ConversationListView(
    state: com.starxflow.mobile.ui.viewmodel.InboxUiState,
    onSelectConversation: (Conversation) -> Unit,
    onSelectChannel: (String) -> Unit,
    onSearchChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val channels = listOf("All", "WhatsApp", "Instagram", "Email", "Web")
    val totalUnread = state.conversations.sumOf { it.unreadCount }

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
                    text = "Unified Inbox",
                    color = StarXTextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Omnichannel Customer Communications",
                    color = StarXTextMuted,
                    fontSize = 12.sp
                )
            }

            if (totalUnread > 0) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0x2610B981))
                        .border(1.dp, StarXBorderEmerald, RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = "$totalUnread Unread",
                        color = StarXGreen,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search Bar with Clear Button
        StarXSearchBar(
            value = state.searchQuery,
            onValueChange = onSearchChange,
            placeholder = "Search customers, messages, channels...",
            leadingIcon = Icons.Default.Search,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Channel Filter Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(channels) { channel ->
                val isSelected = state.selectedChannel == channel
                val count = if (channel == "All") null else {
                    val c = state.conversations.count { it.channel.equals(channel, ignoreCase = true) }
                    if (c > 0) c else null
                }
                StarXFilterChip(
                    label = channel,
                    isSelected = isSelected,
                    onClick = { onSelectChannel(channel) },
                    badgeCount = count
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (state.filteredConversations.isEmpty()) {
            EmptyState(
                title = "No Conversations Found",
                description = "No messages match your selected search or channel filter. Inbound customer chats from WhatsApp, Instagram and Web will stream here in real time.",
                icon = Icons.Default.Chat
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(state.filteredConversations) { convo ->
                    StarXCard(
                        tier = GlassTier.SUBTLE,
                        onClick = { onSelectConversation(convo) }
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
                                    name = convo.customerName,
                                    size = 42.dp,
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
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(
                                        text = convo.lastMessage ?: "Active conversation",
                                        color = StarXTextSecondary,
                                        fontSize = 12.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                if (convo.controlMode == "human") {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(Color(0x33F59E0B))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("Staff", color = Color(0xFFF59E0B), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(Color(0x2E10B981))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("AI Agent", color = StarXGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (convo.unreadCount > 0) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Box(
                                        modifier = Modifier
                                            .size(18.dp)
                                            .clip(CircleShape)
                                            .background(StarXGreen),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("${convo.unreadCount}", color = StarXBlack, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    }
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
    }
}

@Composable
private fun ChatDetailView(
    conversation: Conversation,
    messages: List<Message>,
    isSending: Boolean,
    onBack: () -> Unit,
    onSendMessage: (String) -> Unit,
    onToggleTakeover: (String, String?) -> Unit,
    modifier: Modifier = Modifier
) {
    var messageText by remember { mutableStateOf("") }
    val isHumanMode = conversation.controlMode == "human"

    // AI suggestions for rapid response
    val quickSuggestions = listOf(
        "Confirm your booking",
        "Send service catalog",
        "How can I assist you further?"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(StarXBlack)
    ) {
        // Chat Header with Channel & Mode
        GlassSurface(
            tier = GlassTier.PREMIUM,
            shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    StarXIconButton(
                        icon = Icons.AutoMirrored.Filled.ArrowBack,
                        onClick = onBack
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    StarXAvatar(
                        name = conversation.customerName,
                        size = 36.dp,
                        channel = conversation.channel
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = conversation.customerName,
                            color = StarXTextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            StatusIndicator(conversation.channel)
                            if (conversation.customerPhone != null) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(conversation.customerPhone!!, color = StarXTextMuted, fontSize = 11.sp)
                            }
                        }
                    }
                }

                // AI vs Human Takeover Toggle Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isHumanMode) Color(0x33F59E0B) else Color(0x3310B981))
                        .border(
                            1.dp,
                            if (isHumanMode) Color(0xFFF59E0B).copy(alpha = 0.5f) else StarXBorderEmerald,
                            RoundedCornerShape(20.dp)
                        )
                        .clickable {
                            if (isHumanMode) {
                                onToggleTakeover("ai", null)
                            } else {
                                onToggleTakeover("human", "Staff takeover from mobile command center")
                            }
                        }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isHumanMode) Icons.Default.Person else Icons.Default.SmartToy,
                            contentDescription = null,
                            tint = if (isHumanMode) Color(0xFFF59E0B) else StarXGreen,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = if (isHumanMode) "Human Mode" else "AI Active",
                            color = if (isHumanMode) Color(0xFFF59E0B) else StarXGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Messages Bubble Stream
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { msg ->
                val isInbound = msg.direction == "inbound"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isInbound) Arrangement.Start else Arrangement.End
                ) {
                    Box(
                        modifier = Modifier
                            .clip(
                                RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isInbound) 4.dp else 16.dp,
                                    bottomEnd = if (isInbound) 16.dp else 4.dp
                                )
                            )
                            .background(
                                when {
                                    isInbound -> StarXElevatedSurface
                                    msg.role == "ai" -> Color(0x2E10B981)
                                    else -> StarXGreen
                                }
                            )
                            .border(
                                1.dp,
                                when {
                                    isInbound -> StarXBorder
                                    msg.role == "ai" -> StarXBorderActive
                                    else -> StarXBorderEmerald
                                },
                                RoundedCornerShape(16.dp)
                            )
                            .padding(horizontal = 14.dp, vertical = 9.dp)
                    ) {
                        Column {
                            if (!isInbound) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = if (msg.role == "ai") "🤖 AI Agent" else "👤 Staff Response",
                                        color = if (msg.role == "ai") StarXFreshGreen else StarXBlack.copy(alpha = 0.8f),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Delivered",
                                        tint = if (msg.role == "ai") StarXFreshGreen else StarXBlack.copy(alpha = 0.8f),
                                        modifier = Modifier.size(10.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                            }
                            Text(
                                text = msg.content,
                                color = if (isInbound) StarXTextPrimary else if (msg.role == "ai") StarXTextPrimary else StarXBlack,
                                fontSize = 13.sp,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }

        // Quick AI Response Suggestions
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(quickSuggestions) { suggestion ->
                AIResponseSuggestionChip(
                    text = suggestion,
                    onClick = {
                        messageText = suggestion
                    }
                )
            }
        }

        // Message Composer Bar
        GlassSurface(
            tier = GlassTier.PREMIUM,
            shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                StarXTextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    placeholder = if (isHumanMode) "Type reply as staff..." else "Reply via AI / Send directly...",
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (messageText.isNotBlank()) StarXGreen else StarXDarkSurface)
                        .clickable(enabled = messageText.isNotBlank() && !isSending) {
                            val textToSend = messageText
                            messageText = ""
                            onSendMessage(textToSend)
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (isSending) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), color = StarXBlack, strokeWidth = 2.dp)
                    } else {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Send,
                            contentDescription = "Send",
                            tint = if (messageText.isNotBlank()) StarXBlack else StarXTextMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
