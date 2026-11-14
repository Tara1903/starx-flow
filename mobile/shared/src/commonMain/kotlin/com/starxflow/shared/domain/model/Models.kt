package com.starxflow.shared.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String,
    val businessName: String,
    val businessType: String = "General",
    val role: String = "owner",
    val onboardingComplete: Boolean = true,
    val plan: String = "starter"
)

@Serializable
data class Organization(
    val id: String,
    val name: String,
    val slug: String,
    val plan: String = "starter",
    val currency: String = "EUR",
    val timezone: String = "Europe/Berlin"
)

@Serializable
data class Lead(
    val id: String,
    val userId: String,
    val organizationId: String? = null,
    val name: String,
    val phone: String? = null,
    val email: String? = null,
    val status: String = "new", // new, contacted, qualified, converted, lost
    val source: String = "manual", // whatsapp, instagram, sms, web_chat, manual
    val score: Int = 50,
    val tags: List<String> = emptyList(),
    val notes: String? = null,
    val lastContactAt: String? = null,
    val createdAt: String? = null
)

@Serializable
data class Conversation(
    val id: String,
    val userId: String,
    val organizationId: String? = null,
    val leadId: String? = null,
    val customerName: String,
    val customerPhone: String? = null,
    val customerEmail: String? = null,
    val channel: String, // WhatsApp, Instagram, SMS, Web, Email
    val status: String = "active", // active, needs_attention, resolved, snoozed
    val controlMode: String = "ai", // ai, human
    val handoffReason: String? = null,
    val unreadCount: Int = 0,
    val assignedTo: String? = null,
    val lastMessage: String? = null,
    val lastMessageAt: String? = null
)

@Serializable
data class Message(
    val id: String,
    val conversationId: String,
    val direction: String, // inbound, outbound
    val role: String, // user, ai, human, system
    val content: String,
    val status: String = "sent", // sent, delivered, read, failed
    val isInternal: Boolean = false,
    val createdAt: String
)

@Serializable
data class Appointment(
    val id: String,
    val userId: String,
    val organizationId: String? = null,
    val leadId: String? = null,
    val customerName: String,
    val customerPhone: String? = null,
    val customerEmail: String? = null,
    val serviceName: String,
    val startTime: String,
    val endTime: String,
    val timezone: String = "Europe/Berlin",
    val status: String = "scheduled", // scheduled, confirmed, completed, cancelled, no_show
    val notes: String? = null
)

@Serializable
data class OrderItem(
    val name: String,
    val quantity: Int = 1,
    val price: Double
)

@Serializable
data class Order(
    val id: String,
    val userId: String,
    val organizationId: String? = null,
    val orderNumber: String,
    val customerName: String,
    val customerPhone: String? = null,
    val customerEmail: String? = null,
    val status: String = "pending", // pending, processing, completed, cancelled
    val paymentStatus: String = "unpaid", // unpaid, paid, refunded
    val totalAmount: Double,
    val currency: String = "EUR",
    val items: List<OrderItem> = emptyList(),
    val createdAt: String? = null
)

@Serializable
data class Agent(
    val id: String,
    val userId: String,
    val name: String,
    val role: String, // receptionist, booking, review, sales
    val description: String? = null,
    val isActive: Boolean = true,
    val systemPrompt: String? = null,
    val permissions: List<String> = emptyList()
)

@Serializable
data class Workflow(
    val id: String,
    val userId: String,
    val name: String,
    val description: String? = null,
    val trigger: String? = null,
    val action: String? = null,
    val isActive: Boolean = false,
    val channel: String = "WhatsApp",
    val aiTone: String = "Professional",
    val executionsCount: Int = 0,
    val successRate: Double = 100.0,
    val savedHours: Double = 0.0
)

@Serializable
data class TrendPoint(
    val label: String,
    val value: Double
)

@Serializable
data class ChannelShare(
    val channel: String,
    val count: Int,
    val percentage: String
)

@Serializable
data class DashboardSummary(
    val totalRevenue: Double = 0.0,
    val activeLeadsCount: Int = 0,
    val upcomingBookingsCount: Int = 0,
    val activeAgentsCount: Int = 0,
    val conversionRate: Double = 0.0,
    val revenueTrend: List<TrendPoint> = emptyList(),
    val leadTrend: List<TrendPoint> = emptyList(),
    val channelDistribution: List<ChannelShare> = emptyList(),
    val recentConversations: List<Conversation> = emptyList()
)
