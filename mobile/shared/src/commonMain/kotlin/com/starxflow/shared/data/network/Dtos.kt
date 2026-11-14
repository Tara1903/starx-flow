package com.starxflow.shared.data.network

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import com.starxflow.shared.domain.model.OrderItem

@Serializable
data class SendOtpRequest(
    val email: String,
    val purpose: String = "login",
    val metadata: Map<String, String>? = null
)

@Serializable
data class SendOtpResponse(
    val success: Boolean,
    val message: String? = null,
    val expiresAt: String? = null,
    val error: String? = null
)

@Serializable
data class VerifyOtpRequest(
    val email: String,
    val code: String
)

@Serializable
data class VerifyOtpUserDto(
    val id: String,
    val email: String,
    val name: String,
    val businessName: String,
    val businessType: String = "General",
    val role: String = "owner",
    val onboardingComplete: Boolean = true
)

@Serializable
data class VerifyOtpResponse(
    val success: Boolean,
    val user: VerifyOtpUserDto? = null,
    val tokenHash: String? = null,
    val emailOtp: String? = null,
    val isNewUser: Boolean = false,
    val error: String? = null
)

@Serializable
data class SupabaseTokenResponse(
    @SerialName("access_token") val accessToken: String? = null,
    @SerialName("refresh_token") val refreshToken: String? = null,
    @SerialName("token_type") val tokenType: String? = null,
    @SerialName("expires_in") val expiresIn: Long? = null
)

@Serializable
data class PostMessageRequest(
    val content: String,
    val role: String = "human",
    val isInternal: Boolean = false,
    val agentName: String? = null
)

@Serializable
data class PostMessageResponse(
    val success: Boolean,
    val deduplicated: Boolean? = false,
    val error: String? = null
)

@Serializable
data class PatchConversationRequest(
    val status: String? = null,
    @SerialName("control_mode") val controlMode: String? = null,
    @SerialName("handoff_reason") val handoffReason: String? = null,
    @SerialName("assigned_to") val assignedTo: String? = null
)

@Serializable
data class ConversationsResponse(
    val conversations: List<ConversationDto> = emptyList(),
    val total: Int = 0
)

@Serializable
data class ConversationDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    @SerialName("organization_id") val organizationId: String? = null,
    @SerialName("lead_id") val leadId: String? = null,
    @SerialName("customer_name") val customerName: String,
    @SerialName("customer_phone") val customerPhone: String? = null,
    @SerialName("customer_email") val customerEmail: String? = null,
    val channel: String,
    val status: String = "active",
    @SerialName("control_mode") val controlMode: String = "ai",
    @SerialName("handoff_reason") val handoffReason: String? = null,
    @SerialName("unread_count") val unreadCount: Int = 0,
    @SerialName("assigned_to") val assignedTo: String? = null,
    @SerialName("last_message") val lastMessage: String? = null,
    @SerialName("last_message_at") val lastMessageAt: String? = null
)

@Serializable
data class MessagesResponse(
    val messages: List<MessageDto> = emptyList()
)

@Serializable
data class MessageDto(
    val id: String,
    @SerialName("conversation_id") val conversationId: String,
    val direction: String,
    val role: String,
    val content: String,
    val status: String = "sent",
    @SerialName("is_internal") val isInternal: Boolean = false,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class OrdersResponse(
    val orders: List<OrderDto> = emptyList()
)

@Serializable
data class OrderDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    @SerialName("organization_id") val organizationId: String? = null,
    @SerialName("order_number") val orderNumber: String,
    @SerialName("customer_name") val customerName: String,
    @SerialName("customer_phone") val customerPhone: String? = null,
    @SerialName("customer_email") val customerEmail: String? = null,
    val status: String = "pending",
    @SerialName("payment_status") val paymentStatus: String = "unpaid",
    @SerialName("total_amount") val totalAmount: Double = 0.0,
    val currency: String = "EUR",
    val items: List<OrderItem> = emptyList(),
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class CreateOrderRequest(
    val customerName: String,
    val customerPhone: String? = null,
    val customerEmail: String? = null,
    val items: List<OrderItem>,
    val totalAmount: Double? = null,
    val status: String = "pending",
    val paymentStatus: String = "unpaid"
)

@Serializable
data class LeadDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    @SerialName("organization_id") val organizationId: String? = null,
    val name: String,
    val phone: String? = null,
    val email: String? = null,
    val status: String = "new",
    val source: String = "manual",
    val score: Int = 50,
    val tags: List<String> = emptyList(),
    val notes: String? = null,
    @SerialName("last_contact_at") val lastContactAt: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class AppointmentDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    @SerialName("organization_id") val organizationId: String? = null,
    @SerialName("lead_id") val leadId: String? = null,
    @SerialName("customer_name") val customerName: String,
    @SerialName("customer_phone") val customerPhone: String? = null,
    @SerialName("customer_email") val customerEmail: String? = null,
    @SerialName("service_name") val serviceName: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("end_time") val endTime: String,
    val timezone: String = "Europe/Berlin",
    val status: String = "scheduled",
    val notes: String? = null
)

@Serializable
data class AgentDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    val role: String,
    val description: String? = null,
    @SerialName("is_active") val isActive: Boolean = true,
    @SerialName("system_prompt") val systemPrompt: String? = null,
    val permissions: List<String> = emptyList()
)

@Serializable
data class WorkflowDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    val description: String? = null,
    val trigger: String? = null,
    val action: String? = null,
    @SerialName("is_active") val isActive: Boolean = false,
    val channel: String = "WhatsApp",
    @SerialName("ai_tone") val aiTone: String = "Professional",
    @SerialName("executions_count") val executionsCount: Int = 0,
    @SerialName("success_rate") val successRate: Double = 100.0,
    @SerialName("saved_hours") val savedHours: Double = 0.0
)

@Serializable
data class TrendPointDto(
    val label: String,
    val value: Double
)

@Serializable
data class ChannelShareDto(
    val channel: String,
    val count: Int,
    val percentage: String
)

@Serializable
data class DashboardSummaryDto(
    val totalRevenue: Double = 0.0,
    val activeLeadsCount: Int = 0,
    val upcomingBookingsCount: Int = 0,
    val activeAgentsCount: Int = 0,
    val conversionRate: Double = 0.0,
    val revenueTrend: List<TrendPointDto> = emptyList(),
    val leadTrend: List<TrendPointDto> = emptyList(),
    val channelDistribution: List<ChannelShareDto> = emptyList(),
    val recentConversations: List<ConversationDto> = emptyList()
)

@Serializable
data class DashboardSummaryResponse(
    val success: Boolean = true,
    val summary: DashboardSummaryDto? = null,
    val error: String? = null
)

@Serializable
data class CreateAppointmentRequest(
    @SerialName("customer_name") val customerName: String,
    @SerialName("service_name") val serviceName: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("end_time") val endTime: String,
    val timezone: String = "Europe/Berlin",
    @SerialName("customer_phone") val customerPhone: String? = null,
    @SerialName("customer_email") val customerEmail: String? = null,
    val notes: String? = null,
    val status: String = "scheduled"
)

@Serializable
data class RegisterPushTokenRequest(
    val token: String,
    val platform: String
)

@Serializable
data class RegisterPushTokenResponse(
    val success: Boolean,
    val message: String? = null,
    val error: String? = null
)

@Serializable
data class UpdateActiveRequest(
    @SerialName("is_active") val isActive: Boolean
)

@Serializable
data class UpdateLeadStatusRequest(
    val status: String
)
