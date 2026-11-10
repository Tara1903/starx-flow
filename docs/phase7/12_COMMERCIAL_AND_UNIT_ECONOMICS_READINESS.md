# STARX-FLOW — PHASE 7: COMMERCIAL ARCHITECTURE & UNIT ECONOMICS

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage L  
**Author:** SaaS Growth Architect & Chief Financial / Operations Lead  
**Billing Provider:** Polar (Merchant of Record)  

---

## 1. Commercial Pricing & Packaging Structure

StarX-Flow's existing pricing is structured to maximize initial small-business conversion while capturing expansion revenue as conversation volume scales:

| Plan Tier | Price / Month | AI Conversation Quota | Active Contacts | Team Seats | Target Segment |
|---|:---:|:---:|:---:|:---:|---|
| **Starter** | **$29.00** | 500 / month | 1,000 | 3 seats | Single-practitioner salons, independent studios |
| **Pro** | **$59.00** | 5,000 / month | 10,000 | 10 seats | Multi-practitioner clinics, busy salons |
| **Enterprise** | **$99.00** | Unlimited | Unlimited | Unlimited | Multi-location clinics, custom SLA |

*Note: In accordance with execution rules, commercial pricing remains strictly unchanged.*

---

## 2. Infrastructure & Marginal Unit Cost Model

To evaluate commercial viability and gross margin per customer, StarX-Flow's marginal unit costs per active subscriber are modeled using actual vendor pricing:

### 2.1 Variable Cost per 1,000 AI Conversations
1. **AI Inference (NVIDIA NIM DeepSeek-v4.1-flash / OpenAI API):**
   - Average conversation length: 4 turns (approx. 1,200 tokens input, 400 tokens output).
   - DeepSeek/Flash inference rate: ~$0.0002 per 1k input tokens, ~$0.0006 per 1k output tokens.
   - Total inference cost per conversation: ~$0.00048.
   - **Cost per 1,000 conversations:** **$0.48**.
2. **Database & Serverless Compute (Supabase & Vercel):**
   - Vercel Serverless Function invocations: ~$0.20 per million invocations.
   - Supabase Database compute & egress: ~$0.10 per active tenant / month.
   - **Cost per 1,000 conversations:** **$0.15**.
3. **Transactional Notifications (Resend Email):**
   - Booking confirmations & staff alerts: $0.001 per email (first 3,000/mo free).
   - **Cost per 1,000 conversations:** **$0.25**.
4. **Merchant of Record & Processing Fees (Polar):**
   - Polar fee: 5% + $0.40 per successful transaction.
   - For Starter ($29/mo): $1.45 + $0.40 = **$1.85**.
   - For Pro ($59/mo): $2.95 + $0.40 = **$3.35**.

---

## 3. Contribution Margin Analysis per Customer

### 3.1 Starter Plan ($29.00 / month)
- **Monthly Revenue:** $29.00
- **Polar MoR & Processing Fee:** -$1.85
- **Net Revenue:** **$27.15**
- **Variable Infrastructure & AI Cost (500 conversations):** -$0.45
- **Gross Profit per Customer:** **$26.70**
- **Contribution Margin:** **92.0%**

### 3.2 Pro Plan ($59.00 / month)
- **Monthly Revenue:** $59.00
- **Polar MoR & Processing Fee:** -$3.35
- **Net Revenue:** **$55.65**
- **Variable Infrastructure & AI Cost (2,500 typical conversations):** -$2.20
- **Gross Profit per Customer:** **$53.45**
- **Contribution Margin:** **90.6%**

---

## 4. Breakeven & First 10 Customer Revenue Projections

| Milestone | Active Paying Customers | Monthly Recurring Revenue (MRR) | Annual Run-Rate (ARR) | Estimated Net Monthly Profit |
|---|:---:|:---:|:---:|:---:|
| **First 3 Pilots Converted** | 3 (Starter) | **$87.00** | $1,044.00 | ~$75.00 |
| **Cohort 2 Expansion** | 5 (3 Starter, 2 Pro) | **$205.00** | $2,460.00 | ~$180.00 |
| **Target 10 Paying Customers** | 10 (6 Starter, 4 Pro) | **$410.00** | $4,920.00 | **~$370.00** |

*Takeaway: Because StarX-Flow uses high-efficiency modern serverless architecture and open inference APIs, gross margins exceed 90%. Acquiring just 10 paying customers covers the platform's baseline server and database hosting costs, achieving immediate operational sustainability.*
