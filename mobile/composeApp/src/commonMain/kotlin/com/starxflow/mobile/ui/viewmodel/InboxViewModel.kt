package com.starxflow.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Conversation
import com.starxflow.shared.domain.model.Message
import com.starxflow.shared.domain.repository.InboxRepository

data class InboxUiState(
    val isLoading: Boolean = false,
    val conversations: List<Conversation> = emptyList(),
    val filteredConversations: List<Conversation> = emptyList(),
    val selectedConversation: Conversation? = null,
    val messages: List<Message> = emptyList(),
    val isMessagesLoading: Boolean = false,
    val isSending: Boolean = false,
    val selectedChannel: String = "All", // All, WhatsApp, Instagram, Email, Web
    val searchQuery: String = "",
    val error: String? = null
)

class InboxViewModel(
    private val inboxRepository: InboxRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(InboxUiState(isLoading = true))
    val uiState: StateFlow<InboxUiState> = _uiState.asStateFlow()

    init {
        loadConversations()
    }

    fun loadConversations() {
        viewModelScope.launch {
            val channelFilter = if (_uiState.value.selectedChannel == "All") null else _uiState.value.selectedChannel
            inboxRepository.getConversations(channel = channelFilter, search = _uiState.value.searchQuery.ifBlank { null })
                .collect { result ->
                    when (result) {
                        is StarXResult.Success -> {
                            val list = result.data
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                conversations = list,
                                filteredConversations = filterConversations(list, _uiState.value.selectedChannel, _uiState.value.searchQuery),
                                error = null
                            )
                        }
                        is StarXResult.Error -> {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = result.message
                            )
                        }
                        StarXResult.Loading -> {
                            _uiState.value = _uiState.value.copy(isLoading = true)
                        }
                    }
                }
        }
    }

    fun selectConversation(conversation: Conversation?) {
        _uiState.value = _uiState.value.copy(selectedConversation = conversation, messages = emptyList())
        if (conversation != null) {
            loadMessages(conversation.id)
        }
    }

    private fun loadMessages(conversationId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isMessagesLoading = true)
            inboxRepository.getMessages(conversationId).collect { result ->
                when (result) {
                    is StarXResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            isMessagesLoading = false,
                            messages = result.data
                        )
                    }
                    is StarXResult.Error -> {
                        _uiState.value = _uiState.value.copy(isMessagesLoading = false)
                    }
                    StarXResult.Loading -> Unit
                }
            }
        }
    }

    fun sendMessage(content: String) {
        val convo = _uiState.value.selectedConversation ?: return
        if (content.isBlank()) return

        _uiState.value = _uiState.value.copy(isSending = true)
        viewModelScope.launch {
            val result = inboxRepository.sendMessage(convo.id, content.trim())
            _uiState.value = _uiState.value.copy(isSending = false)
            if (result is StarXResult.Success) {
                loadMessages(convo.id)
            }
        }
    }

    fun toggleControlMode(controlMode: String, handoffReason: String? = null) {
        val convo = _uiState.value.selectedConversation ?: return
        viewModelScope.launch {
            val result = inboxRepository.updateControlMode(convo.id, controlMode, handoffReason)
            if (result is StarXResult.Success) {
                val updated = convo.copy(controlMode = controlMode, handoffReason = handoffReason)
                _uiState.value = _uiState.value.copy(selectedConversation = updated)
            }
        }
    }

    fun setChannelFilter(channel: String) {
        _uiState.value = _uiState.value.copy(
            selectedChannel = channel,
            filteredConversations = filterConversations(_uiState.value.conversations, channel, _uiState.value.searchQuery)
        )
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(
            searchQuery = query,
            filteredConversations = filterConversations(_uiState.value.conversations, _uiState.value.selectedChannel, query)
        )
    }

    private fun filterConversations(list: List<Conversation>, channel: String, query: String): List<Conversation> {
        return list.filter { convo ->
            val matchesChannel = channel == "All" || convo.channel.equals(channel, ignoreCase = true)
            val matchesQuery = query.isBlank() || convo.customerName.contains(query, ignoreCase = true) ||
                    (convo.lastMessage?.contains(query, ignoreCase = true) == true)
            matchesChannel && matchesQuery
        }
    }
}
