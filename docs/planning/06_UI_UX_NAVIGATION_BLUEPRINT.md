# StarX-Flow — Phase 4B.1 Blueprint
# Document 06: UI/UX & Navigation Blueprint

**Document ID:** `SXF-UI-06`  
**Classification:** Frontend Design System & Navigation Architecture  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Staff Full-Stack Engineer & UI/UX Systems Architect  

---

## 1. Design System Foundation & Brand Aesthetic

StarX-Flow adheres to a high-contrast, cyberpunk-minimalist European aesthetic termed **"Zenith Glass"**:
- **Backgrounds:** Pure OLED Black (`#000000`, `#050505`, `#0a0a0a`).
- **Surfaces:** Translucent Glassmorphic panels (`bg-white/[0.02]`, `border-white/5`, backdrop blur `backdrop-blur-xl`).
- **Accent Palette:**
  - Primary Active: Neon Emerald (`#10b981`, `rgb(16, 185, 129)`) for live status, AI actions, and positive revenue.
  - Secondary Accents: Sky Blue (`#38bdf8`) for appointments, Violet (`#a855f7`) for AI workflows, Amber (`#f59e0b`) for pending states, Rose (`#f43f5e`) for human escalation alerts.
- **Typography:** Modern Swiss Neo-Grotesque (`font-sans`, Inter / Geist) with high-legibility tabular monospace (`font-mono`) for numerical amounts, timestamps, and order identifiers.

---

## 2. Navigation Hierarchy & Layout Architecture

### Responsive Layout Strategy
1. **Desktop (> 640px):**
   - Persistent collapsible sidebar (`w-[260px]` expanded, `w-[72px]` collapsed) anchored to viewport left.
   - Fixed top bar containing active section title, live channel counter, workflow wizard button, and user profile avatar.
   - Main content viewport with internal smooth console scroll (`overflow-y-auto console-scroll`).
2. **Mobile (< 640px):**
   - Persistent bottom glassmorphic navigation bar housing primary tabs: Overview, Inbox, CRM, Calendar, More.
   - "More" opens a slide-up GlassSheet drawer exposing secondary sections (Orders, Tasks, AI Agents, Voice, Knowledge, Settings).

---

## 3. Complete Screen & Component Navigation Mapping

| Sidebar ID | Display Label | Target Screen Component | Icon | Primary User Actions | Empty State Message |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `overview` | Overview | [`OverviewSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/OverviewSection.tsx) | `Home` | Review daily revenue, live triage feed, quick channel links | "No incoming messages yet today." |
| `conversations` | Inbox | [`ConversationsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/ConversationsSection.tsx) | `MessageSquare` | Search threads, filter channels, send manual messages, human takeover | "No conversations found. Inbound messages from WhatsApp or Web Chat will appear here." |
| `crm` | Customers | [`CrmSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/CrmSection.tsx) | `Users` | Search leads, create lead, filter status/source, CSV import, CSV export | "No customer contacts yet. Import a CSV or let AI capture leads automatically." |
| `calendar` | Calendar | [`CalendarSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/CalendarSection.tsx) | `Calendar` | Book appointment, update status, change working hours, detect conflicts | "No upcoming appointments scheduled for this week." |
| `orders` | Orders | [`OrdersSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/OrdersSection.tsx) | `ShoppingBag` | Create customer order, calculate line items, update fulfillment and payment status | "No customer orders recorded yet. Process an order via the AI Order Agent or create one manually." |
| `knowledge` | Knowledge | [`KnowledgeSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/KnowledgeSection.tsx) | `BookOpen` | Ingest FAQ, body text, or website URL; test RAG semantic vector similarity | "No knowledge documents indexed. Feed your AI agents with FAQs and pricing policies." |
| `tasks` | Tasks | [`TasksSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/TasksSection.tsx) | `CheckSquare` | Drag-and-drop tasks across To Do, In Progress, Completed; set priorities | "All tasks complete! Great work keeping operations clear." |
| `team` | Team | [`TeamSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/TeamSection.tsx) | `Contact` | Invite team members, change roles (`owner`, `admin`, `member`), remove access | "No team members invited yet. Add staff to collaborate on customer inboxes." |
| `workflows` | Workflows | [`WorkflowsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/WorkflowsSection.tsx) | `Layers` | Toggle active workflows, search flows, open visual editor, view execution console | "No active automation flows configured." |
| `workflow_editor` | Workflow Editor | [`WorkflowEditor.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/WorkflowEditor.tsx) | `Sliders` | Add trigger, condition, and action steps; test flow; save automation | N/A (Editor workspace) |
| `playground` | AI Playground | [`AIPlaygroundSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/AIPlaygroundSection.tsx) | `Brain` | Tune system instructions, select tone (Friendly, Professional), live test sandbox | N/A (Interactive tester) |
| `agents` | AI Agents | [`AgentsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/AgentsSection.tsx) | `Bot` | Inspect 8 workforce agents, tune permissions, test multi-agent delegation | "All 8 autonomous workforce agents active." |
| `voice` | Voice Assistant | [`VoiceSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/VoiceSection.tsx) | `Phone` | Inspect call logs, review transcripts, sentiment breakdown, simulate voice calls | "No telephone call records detected." |
| `os` | Business OS | [`BusinessOSSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/BusinessOSSection.tsx) | `Cpu` | Executive Cockpit, business memories board, goal engine, autonomous run loop | "No business goals configured." |
| `analytics` | Analytics | [`AnalyticsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/AnalyticsSection.tsx) | `BarChart3` | 7-day execution chart, channel volume distribution, revenue telemetry | "Analytics data will populate as conversations trigger." |
| `channels` | Channels | [`ChannelsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/ChannelsSection.tsx) | `Radio` | Connect WhatsApp Business, Instagram, Twilio SMS, Google Reviews, Web Widget | N/A (Integration grid) |
| `settings` | Settings | [`SettingsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/SettingsSection.tsx) | `Settings` | Edit business profile, download GDPR Art. 20 JSON, trigger Art. 17 data erasure, logout | N/A (Configuration form) |

---

## 4. UI States & Experience Patterns

### 1. Loading Skeletons
Every dashboard module employs animated pulse skeletons rather than jarring full-screen spinners:
```tsx
<div className="space-y-3 animate-pulse">
  <div className="h-4 bg-white/5 rounded w-1/4" />
  <div className="h-10 bg-white/5 rounded-xl w-full" />
  <div className="h-32 bg-white/5 rounded-xl w-full" />
</div>
```

### 2. Error States & Fail-Safe Fallbacks
- Every screen is bounded by an error fallback that isolates crashes to the specific module without crashing the global navigation or sidebar.
- Toast notifications appear in the bottom-right corner with 4-second auto-dismiss:
  - Success: `bg-emerald-500/10 border-emerald-500/20 text-emerald-400`
  - Error: `bg-red-500/10 border-red-500/20 text-red-400`
  - Warning: `bg-amber-500/10 border-amber-500/20 text-amber-400`

### 3. Role-Based Access Control (RBAC) UI Gating
- **Member Role:** Can read/reply in Inbox, view Calendar, create Orders, update assigned Tasks. Cannot delete organization, access billing settings, or modify Stripe subscriptions.
- **Admin Role:** Full operational access to CRM, Settings, Campaigns, Workflows, and Team invitations.
- **Owner Role:** Full access including transfer of ownership, Danger Zone organization deletion, and subscription cancellation.
- **Super Admin (`profile.role === 'admin'`):** Unlocks the `/admin` navigation link in user profile popover to access the Super Admin Dashboard.
