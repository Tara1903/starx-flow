package com.starxflow.shared.core

object Constants {
    // StarX Flow production backend URL (Vercel canonical domain)
    const val DEFAULT_API_BASE_URL = "https://starx-flow.runs-on.dev"
    
    // Supabase Configuration (Anon Key only - Service Role is strictly prohibited in mobile client)
    const val SUPABASE_URL = "https://iotuxpcqewdzvqzncpad.supabase.co"
    const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHV4cGNxZXdkenZxem5jcGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjk4NjMsImV4cCI6MjA5MzkwNTg2M30.zCbvXj46AO1rbTxaWmi7wuolgdnVoHsz9Cd5UD2_PNU"

    // Storage Keys
    const val KEY_ACCESS_TOKEN = "starx_access_token"
    const val KEY_REFRESH_TOKEN = "starx_refresh_token"
    const val KEY_USER_ID = "starx_user_id"
    const val KEY_ORG_ID = "starx_org_id"
    const val KEY_USER_EMAIL = "starx_user_email"
    const val KEY_USER_NAME = "starx_user_name"
    const val KEY_BUSINESS_NAME = "starx_business_name"

    // Numeric 8-Digit OTP Rules
    const val OTP_LENGTH = 8
    const val OTP_EXPIRY_SECONDS = 600
}
