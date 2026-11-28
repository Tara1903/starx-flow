-- ============================================================================
-- StarX Flow Flagship AI Intelligence Engine v2 Schema Upgrade
-- 1. Organization-scoped Knowledge Chunks & Hybrid Full-Text / Embedding Index
-- 2. Organization-scoped Memories (business_memories, agent_memories, business_goals)
-- 3. AI Intelligence Traces for observability, context debugging & latency audit
-- ============================================================================

-- 1. Extend knowledge_chunks with organization_id and fast FTS index
ALTER TABLE IF EXISTS public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

UPDATE public.knowledge_chunks kc
SET organization_id = kd.organization_id
FROM public.knowledge_documents kd
WHERE kc.document_id = kd.id
  AND kc.organization_id IS NULL
  AND kd.organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_org_doc
  ON public.knowledge_chunks(organization_id, document_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_fts
  ON public.knowledge_chunks USING GIN (to_tsvector('simple', coalesce(chunk_content, '')));

DROP POLICY IF EXISTS "Users can manage own knowledge chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "Team members can manage org knowledge chunks" ON public.knowledge_chunks;
CREATE POLICY "Team members can manage org knowledge chunks" ON public.knowledge_chunks
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

-- Align knowledge_documents org policy cleanly so teammates share documents
DROP POLICY IF EXISTS "Users can view org knowledge documents" ON public.knowledge_documents;
CREATE POLICY "Users can view org knowledge documents" ON public.knowledge_documents
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

-- 2. Extend business_memories, agent_memories, business_goals with organization_id
ALTER TABLE IF EXISTS public.business_memories
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_business_memories_org_id
  ON public.business_memories(organization_id);

DROP POLICY IF EXISTS "Users can view own business memories" ON public.business_memories;
DROP POLICY IF EXISTS "Users can insert own business memories" ON public.business_memories;
DROP POLICY IF EXISTS "Users can update own business memories" ON public.business_memories;
DROP POLICY IF EXISTS "Users can delete own business memories" ON public.business_memories;
DROP POLICY IF EXISTS "Org members manage business memories" ON public.business_memories;

CREATE POLICY "Org members manage business memories" ON public.business_memories
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

ALTER TABLE IF EXISTS public.agent_memories
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_agent_memories_org_lead
  ON public.agent_memories(organization_id, lead_id);

DROP POLICY IF EXISTS "Users can view own agent memories" ON public.agent_memories;
DROP POLICY IF EXISTS "Users can insert own agent memories" ON public.agent_memories;
DROP POLICY IF EXISTS "Users can update own agent memories" ON public.agent_memories;
DROP POLICY IF EXISTS "Users can delete own agent memories" ON public.agent_memories;
DROP POLICY IF EXISTS "Org members manage agent memories" ON public.agent_memories;

CREATE POLICY "Org members manage agent memories" ON public.agent_memories
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

ALTER TABLE IF EXISTS public.business_goals
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_business_goals_org_id
  ON public.business_goals(organization_id);

DROP POLICY IF EXISTS "Users can view own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can insert own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can update own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can delete own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Org members manage business goals" ON public.business_goals;

CREATE POLICY "Org members manage business goals" ON public.business_goals
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

-- 3. AI Intelligence Execution & Context Traceability Table
CREATE TABLE IF NOT EXISTS public.ai_intelligence_traces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id uuid NULL,
  lead_id uuid NULL REFERENCES public.leads(id) ON DELETE SET NULL,
  channel text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  intent text NOT NULL DEFAULT 'general',
  rag_chunks_count integer NOT NULL DEFAULT 0,
  memories_count integer NOT NULL DEFAULT 0,
  crm_linked boolean NOT NULL DEFAULT false,
  tool_names_used text[] NOT NULL DEFAULT ARRAY[]::text[],
  requires_handoff boolean NOT NULL DEFAULT false,
  latency_ms integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_traces_org_created
  ON public.ai_intelligence_traces(organization_id, created_at DESC);

ALTER TABLE public.ai_intelligence_traces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read AI traces" ON public.ai_intelligence_traces;
CREATE POLICY "Org members read AI traces" ON public.ai_intelligence_traces
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages AI traces" ON public.ai_intelligence_traces;
CREATE POLICY "Service role manages AI traces" ON public.ai_intelligence_traces
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
