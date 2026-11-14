package com.starxflow.shared.domain.repository

import kotlinx.coroutines.flow.Flow
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.domain.model.Conversation
import com.starxflow.shared.domain.model.Message

interface InboxRepository {
    fun getConversations(channel: String? = null, status: String? = null, search: String? = null): Flow<StarXResult<List<Conversation>>>
    fun getMessages(conversationId: String): Flow<StarXResult<List<Message>>>
    suspend fun sendMessage(conversationId: String, content: String, role: String = "human", isInternal: Boolean = false): StarXResult<Boolean>
    suspend fun updateControlMode(conversationId: String, controlMode: String, handoffReason: String? = null): StarXResult<Boolean>
}
