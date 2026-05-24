# AI Provider Audit

## Overview
This audit evaluates the codebase to ensure there are no unintended dependencies or assumptions on OpenAI. The target architecture strictly utilizes the NVIDIA API for LLM inference.

## Search Results & Classification

### 1. API Endpoints & Routes
**Found:** `https://integrate.api.nvidia.com/v1/chat/completions`
**Location:** `supabase/functions/ai-processor/index.ts` (Line 90)
**Classification:** **SAFE**
**Reasoning:** Although the path ends in `/chat/completions` (an OpenAI standard), this is specifically an NVIDIA endpoint that implements the OpenAI-compatible schema for seamless integration.

### 2. Code Comments & Assumptions
**Found:** `// OpenAI format returns { choices: [...] }, error is usually { error: { message: ... } }`
**Location:** `supabase/functions/ai-processor/index.ts` (Line 70)
**Classification:** **REPLACE**
**Reasoning:** The comment assumes the developer is using OpenAI. This will be reworded to: `// Nvidia API utilizes an OpenAI-compatible schema: returns { choices: [...] }`.

### 3. Documentation
**Found:** `- GEMINI_API_KEY (or OpenAI equivalent)`
**Location:** `BACKEND_EXTRACTION.md` (Line 68)
**Classification:** **REMOVE**
**Reasoning:** We will strictly reference `NVIDIA_API_KEY`. The OpenAI documentation reference should be deleted to prevent developer confusion.

### 4. Environment Variables
**Found:** `NVIDIA_API_KEY`
**Location:** `ENVIRONMENT_SETUP.md` & `.env.supabase.example` & `ai-processor`
**Classification:** **SAFE**
**Reasoning:** The NVIDIA key is correctly documented and fetched in the processor.

**Found:** `GEMINI_API_KEY`
**Location:** Multiple environment files and `ai-processor`.
**Classification:** **LEGACY**
**Reasoning:** If StarX uses NVIDIA exclusively, the Gemini API key injections in `vite.config.ts`, `.env.example`, and the `ai-processor` can be scheduled for removal or explicitly marked as an inactive fallback provider.

---

## Action Plan (Pending Implementation)

1. **Replace Abstractions:** Update the `fetchWithRetry` logic in `ai-processor/index.ts` to explicitly type and document the response as an `NvidiaChatCompletionResponse`, dropping the informal OpenAI nomenclature.
2. **Server Runtime Validation:** The Deno/Edge runtime successfully handles standard `fetch()` to `api.nvidia.com`. No native Node.js SDKs (like the `openai` npm package) are installed, confirming our runtime is perfectly lightweight and serverless.
3. **Update Environment Variables:** Remove OpenAI references from documentation and standardise the environment files strictly around `NVIDIA_API_KEY`.
