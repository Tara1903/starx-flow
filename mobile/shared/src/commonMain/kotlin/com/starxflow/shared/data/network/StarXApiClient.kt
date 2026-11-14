package com.starxflow.shared.data.network

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import com.starxflow.shared.auth.SecureStorage
import com.starxflow.shared.core.Constants
import com.starxflow.shared.core.StarXResult

class StarXApiClient(
    private val secureStorage: SecureStorage,
    private val baseUrl: String = Constants.DEFAULT_API_BASE_URL,
    private val supabaseUrl: String = Constants.SUPABASE_URL,
    private val supabaseAnonKey: String = Constants.SUPABASE_ANON_KEY
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private val httpClient = HttpClient {
        install(ContentNegotiation) {
            json(json)
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 8000
            connectTimeoutMillis = 6000
            socketTimeoutMillis = 6000
        }
        install(Logging) {
            level = LogLevel.INFO
        }
    }

    private fun getAuthToken(): String? {
        return secureStorage.getString(Constants.KEY_ACCESS_TOKEN)
    }

    /* ─── 8-DIGIT OTP AUTHENTICATION ─── */

    suspend fun sendOtp(email: String, purpose: String = "login"): StarXResult<SendOtpResponse> {
        return try {
            val response = httpClient.post("$baseUrl/api/auth/otp/send") {
                contentType(ContentType.Application.Json)
                setBody(SendOtpRequest(email = email, purpose = purpose))
            }
            if (response.status.isSuccess()) {
                val body: SendOtpResponse = response.body()
                StarXResult.Success(body)
            } else {
                val errorBody: SendOtpResponse? = runCatching { response.body<SendOtpResponse>() }.getOrNull()
                StarXResult.Error(errorBody?.error ?: "Failed to send verification code", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network failure. Please check your connection.", e)
        }
    }

    suspend fun verifyOtp(email: String, code: String): StarXResult<VerifyOtpResponse> {
        return try {
            val response = httpClient.post("$baseUrl/api/auth/otp/verify") {
                contentType(ContentType.Application.Json)
                setBody(VerifyOtpRequest(email = email, code = code))
            }
            if (response.status.isSuccess()) {
                val body: VerifyOtpResponse = response.body()
                StarXResult.Success(body)
            } else {
                val errorBody: VerifyOtpResponse? = runCatching { response.body<VerifyOtpResponse>() }.getOrNull()
                StarXResult.Error(errorBody?.error ?: "Verification failed. Check the 8-digit code.", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error during verification.", e)
        }
    }

    suspend fun exchangeTokenHashForSession(tokenHash: String): StarXResult<SupabaseTokenResponse> {
        return try {
            val response = httpClient.post("$supabaseUrl/auth/v1/verify") {
                contentType(ContentType.Application.Json)
                header("apikey", supabaseAnonKey)
                setBody(mapOf(
                    "token_hash" to tokenHash,
                    "type" to "email"
                ))
            }
            if (response.status.isSuccess()) {
                val body: SupabaseTokenResponse = response.body()
                StarXResult.Success(body)
            } else {
                StarXResult.Error("Failed to synchronize Supabase session", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Failed to establish secure session", e)
        }
    }

    /* ─── UNIFIED INBOX (CONVERSATIONS & MESSAGES) ─── */

    suspend fun getConversations(
        channel: String? = null,
        status: String? = null,
        search: String? = null
    ): StarXResult<List<ConversationDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val urlBuilder = StringBuilder("$baseUrl/api/conversations?")
            channel?.let { urlBuilder.append("channel=$it&") }
            status?.let { urlBuilder.append("status=$it&") }
            search?.let { urlBuilder.append("search=$it&") }

            val response = httpClient.get(urlBuilder.toString().trimEnd('&', '?')) {
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val body: ConversationsResponse = response.body()
                StarXResult.Success(body.conversations)
            } else {
                StarXResult.Error("Failed to fetch conversations", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error fetching conversations", e)
        }
    }

    suspend fun getMessages(conversationId: String, limit: Int = 50): StarXResult<List<MessageDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$baseUrl/api/conversations/$conversationId/messages?limit=$limit") {
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val body: MessagesResponse = response.body()
                StarXResult.Success(body.messages)
            } else {
                StarXResult.Error("Failed to load message transcript", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading messages", e)
        }
    }

    suspend fun postMessage(
        conversationId: String,
        content: String,
        role: String = "human",
        isInternal: Boolean = false
    ): StarXResult<PostMessageResponse> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.post("$baseUrl/api/conversations/$conversationId/messages") {
                contentType(ContentType.Application.Json)
                header("Authorization", "Bearer $token")
                setBody(PostMessageRequest(content = content, role = role, isInternal = isInternal))
            }
            if (response.status.isSuccess()) {
                val body: PostMessageResponse = response.body()
                StarXResult.Success(body)
            } else {
                StarXResult.Error("Failed to dispatch message to customer", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error dispatching message", e)
        }
    }

    suspend fun updateConversation(
        conversationId: String,
        controlMode: String? = null,
        handoffReason: String? = null,
        status: String? = null
    ): StarXResult<Boolean> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.patch("$baseUrl/api/conversations/$conversationId") {
                contentType(ContentType.Application.Json)
                header("Authorization", "Bearer $token")
                setBody(PatchConversationRequest(
                    status = status,
                    controlMode = controlMode,
                    handoffReason = handoffReason
                ))
            }
            if (response.status.isSuccess()) {
                StarXResult.Success(true)
            } else {
                StarXResult.Error("Failed to update conversation controls", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error updating conversation", e)
        }
    }

    /* ─── ORDERS ─── */

    suspend fun getOrders(): StarXResult<List<OrderDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$baseUrl/api/orders") {
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val body: OrdersResponse = response.body()
                StarXResult.Success(body.orders)
            } else {
                StarXResult.Error("Failed to load workspace orders", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading orders", e)
        }
    }

    suspend fun createOrder(request: CreateOrderRequest): StarXResult<Boolean> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.post("$baseUrl/api/orders") {
                contentType(ContentType.Application.Json)
                header("Authorization", "Bearer $token")
                setBody(request)
            }
            if (response.status.isSuccess()) {
                StarXResult.Success(true)
            } else {
                StarXResult.Error("Failed to create order", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error creating order", e)
        }
    }

    /* ─── DIRECT SUPABASE POSTGREST READS / WRITES ─── */

    suspend fun getLeads(): StarXResult<List<LeadDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/leads?select=*&order=created_at.desc") {
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val leads: List<LeadDto> = response.body()
                StarXResult.Success(leads)
            } else {
                StarXResult.Error("Failed to load leads directory", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading leads", e)
        }
    }

    suspend fun getAppointments(): StarXResult<List<AppointmentDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/appointments?select=*&order=start_time.asc") {
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val list: List<AppointmentDto> = response.body()
                StarXResult.Success(list)
            } else {
                StarXResult.Error("Failed to load appointments", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading appointments", e)
        }
    }

    suspend fun getAgents(): StarXResult<List<AgentDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/agents?select=*") {
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val list: List<AgentDto> = response.body()
                StarXResult.Success(list)
            } else {
                StarXResult.Error("Failed to load AI agents", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading agents", e)
        }
    }

    suspend fun getWorkflows(): StarXResult<List<WorkflowDto>> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/workflows?select=*") {
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val list: List<WorkflowDto> = response.body()
                StarXResult.Success(list)
            } else {
                StarXResult.Error("Failed to load workflows", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading workflows", e)
        }
    }

    /* ─── SESSION REFRESH & TOKEN LIFECYCLE ─── */

    suspend fun refreshToken(): StarXResult<SupabaseTokenResponse> {
        val refreshToken = secureStorage.getString(Constants.KEY_REFRESH_TOKEN)
            ?: return StarXResult.Error("No refresh token stored", statusCode = 401)
        return try {
            val response = httpClient.post("$supabaseUrl/auth/v1/token?grant_type=refresh_token") {
                contentType(ContentType.Application.Json)
                header("apikey", supabaseAnonKey)
                setBody(mapOf("refresh_token" to refreshToken))
            }
            if (response.status.isSuccess()) {
                val body: SupabaseTokenResponse = response.body()
                body.accessToken?.let { secureStorage.putString(Constants.KEY_ACCESS_TOKEN, it) }
                body.refreshToken?.let { secureStorage.putString(Constants.KEY_REFRESH_TOKEN, it) }
                StarXResult.Success(body)
            } else {
                StarXResult.Error("Failed to refresh session token", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error during token refresh", e)
        }
    }

    /* ─── AGGREGATED DASHBOARD & ANALYTICS ─── */

    suspend fun getDashboardSummary(): StarXResult<DashboardSummaryDto> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.get("$baseUrl/api/mobile/v1/dashboard/summary") {
                header("Authorization", "Bearer $token")
            }
            if (response.status.isSuccess()) {
                val body: DashboardSummaryResponse = response.body()
                if (body.summary != null) {
                    StarXResult.Success(body.summary)
                } else {
                    StarXResult.Error(body.error ?: "Empty dashboard summary payload")
                }
            } else {
                StarXResult.Error("Failed to load dashboard summary", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error loading dashboard summary", e)
        }
    }

    /* ─── SERVER MUTATIONS (AGENTS, WORKFLOWS, BOOKINGS, CRM, NOTIFICATIONS) ─── */

    suspend fun updateAgent(agentId: String, isActive: Boolean): StarXResult<Boolean> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.patch("$supabaseUrl/rest/v1/agents?id=eq.$agentId") {
                contentType(ContentType.Application.Json)
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
                header("Prefer", "return=minimal")
                setBody(UpdateActiveRequest(isActive = isActive))
            }
            if (response.status.isSuccess()) {
                StarXResult.Success(true)
            } else {
                StarXResult.Error("Failed to update agent status on server", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error updating agent", e)
        }
    }

    suspend fun updateWorkflow(workflowId: String, isActive: Boolean): StarXResult<Boolean> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.patch("$supabaseUrl/rest/v1/workflows?id=eq.$workflowId") {
                contentType(ContentType.Application.Json)
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
                header("Prefer", "return=minimal")
                setBody(UpdateActiveRequest(isActive = isActive))
            }
            if (response.status.isSuccess()) {
                StarXResult.Success(true)
            } else {
                StarXResult.Error("Failed to update workflow status on server", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error updating workflow", e)
        }
    }

    suspend fun createAppointment(request: CreateAppointmentRequest): StarXResult<AppointmentDto> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.post("$supabaseUrl/rest/v1/appointments") {
                contentType(ContentType.Application.Json)
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
                header("Prefer", "return=representation")
                setBody(request)
            }
            if (response.status.isSuccess()) {
                val list: List<AppointmentDto> = response.body()
                if (list.isNotEmpty()) {
                    StarXResult.Success(list.first())
                } else {
                    StarXResult.Error("Appointment created but empty record returned")
                }
            } else {
                StarXResult.Error("Failed to persist appointment to server", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error creating appointment", e)
        }
    }

    suspend fun updateLeadStatus(leadId: String, status: String): StarXResult<Boolean> {
        val token = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.patch("$supabaseUrl/rest/v1/leads?id=eq.$leadId") {
                contentType(ContentType.Application.Json)
                header("apikey", supabaseAnonKey)
                header("Authorization", "Bearer $token")
                header("Prefer", "return=minimal")
                setBody(UpdateLeadStatusRequest(status = status))
            }
            if (response.status.isSuccess()) {
                StarXResult.Success(true)
            } else {
                StarXResult.Error("Failed to update lead status on server", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error updating lead status", e)
        }
    }

    suspend fun registerPushToken(token: String, platform: String): StarXResult<Boolean> {
        val authToken = getAuthToken() ?: return StarXResult.Error("Not authenticated", statusCode = 401)
        return try {
            val response = httpClient.post("$baseUrl/api/mobile/v1/notifications/register") {
                contentType(ContentType.Application.Json)
                header("Authorization", "Bearer $authToken")
                setBody(RegisterPushTokenRequest(token = token, platform = platform))
            }
            if (response.status.isSuccess()) {
                val body: RegisterPushTokenResponse = response.body()
                StarXResult.Success(body.success)
            } else {
                StarXResult.Error("Failed to register push token", statusCode = response.status.value)
            }
        } catch (e: Exception) {
            StarXResult.Error(e.message ?: "Network error registering push token", e)
        }
    }
}
