package com.starxflow.shared.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.core.Constants
import com.starxflow.shared.core.StarXResult
import com.starxflow.shared.database.StarXDatabase
import com.starxflow.shared.data.network.StarXApiClient
import com.starxflow.shared.domain.model.Conversation
import com.starxflow.shared.domain.model.Message
import com.starxflow.shared.domain.repository.InboxRepository

class InboxRepositoryImpl(
    private val apiClient: StarXApiClient,
    private val secureStorage: SecureStorage,
    private val database: StarXDatabase
) : InboxRepository {

    override fun getConversations(
        channel: String?,
        status: String?,
        search: String?
    ): Flow<StarXResult<List<Conversation>>> = flow {
        emit(StarXResult.Loading)

        val userId = secureStorage.getString(Constants.KEY_USER_ID)
        if (userId != null) {
            val cached = database.starXDatabaseQueries.selectAllConversations(userId).executeAsList().map { row ->
                Conversation(
                    id = row.id,
                    userId = row.userId,
                    organizationId = row.organizationId,
                    leadId = row.leadId,
                    customerName = row.customerName,
                    customerPhone = row.customerPhone,
                    customerEmail = row.customerEmail,
                    channel = row.channel,
                    status = row.status,
                    controlMode = row.controlMode,
                    handoffReason = row.handoffReason,
                    unreadCount = row.unreadCount.toInt(),
                    assignedTo = row.assignedTo,
                    lastMessage = row.lastMessage,
                    lastMessageAt = row.lastMessageAt
                )
            }
            if (cached.isNotEmpty()) {
                emit(StarXResult.Success(cached))
            }
        }

        when (val result = apiClient.getConversations(channel, status, search)) {
            is StarXResult.Success -> {
                val list = result.data.map { dto ->
                    Conversation(
                        id = dto.id,
                        userId = dto.userId,
                        organizationId = dto.organizationId,
                        leadId = dto.leadId,
                        customerName = dto.customerName,
                        customerPhone = dto.customerPhone,
                        customerEmail = dto.customerEmail,
                        channel = dto.channel,
                        status = dto.status,
                        controlMode = dto.controlMode,
                        handoffReason = dto.handoffReason,
                        unreadCount = dto.unreadCount,
                        assignedTo = dto.assignedTo,
                        lastMessage = dto.lastMessage,
                        lastMessageAt = dto.lastMessageAt
                    )
                }

                // Cache in SQLDelight
                if (userId != null) {
                    list.forEach { convo ->
                        database.starXDatabaseQueries.insertOrReplaceConversation(
                            id = convo.id,
                            userId = convo.userId,
                            organizationId = convo.organizationId,
                            leadId = convo.leadId,
                            customerName = convo.customerName,
                            customerPhone = convo.customerPhone,
                            customerEmail = convo.customerEmail,
                            channel = convo.channel,
                            status = convo.status,
                            controlMode = convo.controlMode,
                            handoffReason = convo.handoffReason,
                            unreadCount = convo.unreadCount.toLong(),
                            assignedTo = convo.assignedTo,
                            lastMessage = convo.lastMessage,
                            lastMessageAt = convo.lastMessageAt
                        )
                    }
                }

                emit(StarXResult.Success(list))
            }
            is StarXResult.Error -> emit(StarXResult.Error(result.message, result.throwable, result.statusCode))
            StarXResult.Loading -> Unit
        }
    }

    override fun getMessages(conversationId: String): Flow<StarXResult<List<Message>>> = flow {
        emit(StarXResult.Loading)

        // 1. Emit cached messages first
        val cached = database.starXDatabaseQueries.selectMessagesForConversation(conversationId).executeAsList().map { row ->
            Message(
                id = row.id,
                conversationId = row.conversationId,
                direction = row.direction,
                role = row.role,
                content = row.content,
                status = row.status,
                isInternal = row.isInternal != 0L,
                createdAt = row.createdAt
            )
        }
        if (cached.isNotEmpty()) {
            emit(StarXResult.Success(cached))
        }

        // 2. Fetch fresh from network
        when (val result = apiClient.getMessages(conversationId)) {
            is StarXResult.Success -> {
                val list = result.data.map { dto ->
                    Message(
                        id = dto.id,
                        conversationId = dto.conversationId,
                        direction = dto.direction,
                        role = dto.role,
                        content = dto.content,
                        status = dto.status,
                        isInternal = dto.isInternal,
                        createdAt = dto.createdAt
                    )
                }

                // Cache messages
                list.forEach { msg ->
                    database.starXDatabaseQueries.insertOrReplaceMessage(
                        id = msg.id,
                        conversationId = msg.conversationId,
                        direction = msg.direction,
                        role = msg.role,
                        content = msg.content,
                        status = msg.status,
                        isInternal = if (msg.isInternal) 1L else 0L,
                        createdAt = msg.createdAt
                    )
                }

                emit(StarXResult.Success(list))
            }
            is StarXResult.Error -> emit(StarXResult.Error(result.message, result.throwable, result.statusCode))
            StarXResult.Loading -> Unit
        }
    }

    override suspend fun sendMessage(
        conversationId: String,
        content: String,
        role: String,
        isInternal: Boolean
    ): StarXResult<Boolean> {
        val result = apiClient.postMessage(conversationId, content, role, isInternal)
        return when (result) {
            is StarXResult.Success -> StarXResult.Success(result.data.success)
            is StarXResult.Error -> StarXResult.Error(result.message, result.throwable, result.statusCode)
            StarXResult.Loading -> StarXResult.Loading
        }
    }

    override suspend fun updateControlMode(
        conversationId: String,
        controlMode: String,
        handoffReason: String?
    ): StarXResult<Boolean> {
        database.starXDatabaseQueries.updateConversationMode(controlMode, handoffReason, conversationId)
        return apiClient.updateConversation(conversationId, controlMode = controlMode, handoffReason = handoffReason)
    }
}
