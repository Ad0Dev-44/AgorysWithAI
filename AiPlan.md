# AGORYS AI — 10-Day Project Plan
*Integrating an LLM-powered assistant into the AGORYS business decision support platform*

---

## Overview

This plan adds an AI layer to AGORYS in two phases across 10 working days:
- **Phase 1 (Days 1-5):** core AI integration — a dedicated AI microservice that generates natural-language dashboard explanations, business chat, executive reports, and recommendations from AGORYS's existing analytics.
- **Phase 2 (Days 6-10):** Retrieval-Augmented Generation (RAG) — extending the assistant with memory of a company's own historical AI-generated insights, so it can answer questions with continuity across time and datasets.

---

## Day 1 — Architecture and service scaffolding

**Goal:** Stand up a new, isolated `ai-service` alongside the existing `frontend`, `backend`, and `analytics-service`.

**Tasks:**
- Design the service boundary: the AI service will never access the database directly; the backend orchestrates by gathering analytics data and forwarding it.
- Scaffold `ai-service/` with a clear internal structure: `config`, `controllers`, `routes`, `services`, `prompts`, `types`.
- Select a hosted inference provider rather than self-hosting a model — this avoids GPU infrastructure requirements and keeps the timeline realistic. Hugging Face's Inference Providers router (an OpenAI-compatible endpoint) is a strong fit: it supports multiple backing providers, transparent per-token pricing, and requires no local deployment.
- Choose an initial model, verifying it has active provider support before committing (model/provider availability can shift over time, so this should be checked directly against the platform's current provider list rather than assumed from documentation).
- Set generation parameters conservatively: a generous token budget (to accommodate models with internal reasoning steps) and moderate temperature (favoring grounded, consistent output over creative variation, appropriate for business data).
- Build a minimal server with a health-check endpoint to confirm the service boots correctly before adding business logic.

**Deliverable:** `ai-service` runs standalone, responds to a health check, and is authenticated against the chosen inference provider.

---

## Day 2 — Data contracts and prompt design

**Goal:** Define exactly what data flows into the AI layer, and how it's turned into prompts.

**Tasks:**
- Review AGORYS's existing analytics engine output — KPIs, revenue trend, forecast, and flagged risk indicators — and define TypeScript types that mirror these exactly, since prompts are only as accurate as the data shapes feeding them.
- Design prompt templates as pure functions (data in, prompt string out) for each capability: dashboard explanation, report generation, and recommendation rewriting. Keeping prompt construction separate from the API-calling code makes each independently testable and reusable.
- For recommendations specifically: design the prompt so the LLM rewrites the platform's existing deterministic risk flags into clear, prioritized, natural-language advice — rather than generating new recommendations from nothing. This keeps AI output auditable and grounded in the platform's own analysis rather than free-form generation.
- Implement the single function responsible for calling the LLM, with response parsing that accounts for models that may return content in varying shapes (plain text, structured content blocks, or separate reasoning fields), so the integration is resilient to model-specific response formats.
- Test the service standalone against realistic sample data before connecting it to the real backend.

**Deliverable:** `ai-service` produces grounded, accurate natural-language output from realistic structured input, verified via direct API calls.

---

## Day 3 — Backend integration

**Goal:** Expose AI capabilities through the main AGORYS backend, authenticated and scoped correctly.

**Tasks:**
- Add a new `ai` module to the backend that: authenticates the request, resolves the requesting user's company and the relevant dataset, gathers the necessary analytics data from existing services, and forwards it to `ai-service`.
- Ensure this module contains no prompt logic of its own — its only responsibility is orchestration, preserving the separation of concerns established on Day 1.
- Mount the new routes under the existing authentication middleware, ensuring correct request lifecycle ordering (JSON body parsing must run before any route that depends on `req.body`).
- Add clear error propagation so that failures in the AI service are surfaced with actionable detail in the backend's response, rather than a generic failure message — this matters for debugging during development and for a better failure experience for end users.
- Test the full chain end-to-end: an authenticated request to the backend, referencing a real dataset, produces a real AI-generated response.

**Deliverable:** The backend exposes working, authenticated AI endpoints backed by real business data.

---

## Day 4 — Frontend integration

**Goal:** Give users a way to actually interact with the AI features.

**Tasks:**
- Review the existing frontend's data-fetching, authentication, and component conventions, so new components integrate naturally rather than introducing a new pattern.
- Build a chat interface for open-ended business questions, plus dedicated components for dashboard explanations, recommendations, and report generation — each calling its corresponding backend endpoint.
- Build a central "AI" page that lets a user select a dataset and access all AI capabilities for it in one place.
- Add clear navigation to this page from the main dashboard.
- Apply consistent visual styling, ideally reusing existing design tokens rather than introducing new ad hoc colors, so the AI features feel like a native part of the product rather than a bolted-on addition.

**Deliverable:** A user can log in, select a dataset, and use every AI capability through the actual UI.

---

## Day 5 — End-to-end testing and stabilization

**Goal:** Confirm the full system is reliable before extending it.

**Tasks:**
- Test all four AI capabilities (chat, dashboard explanation, recommendations, report) against multiple real datasets with varying characteristics (growth vs. decline, single-product vs. multi-product).
- Verify that AI-generated content stays grounded in the actual numbers provided — the platform's core value proposition is trustworthy interpretation of real data, not plausible-sounding generation.
- Address any issues found before moving to Phase 2, since RAG will build directly on this foundation.
- Use any remaining time this day as a buffer for Phase 1 stabilization, or to get ahead on Phase 2 if everything is solid.

**Deliverable:** A stable, fully working AI integration, ready to be extended with retrieval.

---

## Day 6 — RAG: data layer

**Goal:** Add the storage layer needed to make historical AI-generated content retrievable.

**Tasks:**
- Enable vector similarity search support in the existing PostgreSQL database (via the `pgvector` extension), avoiding the need for a separate vector database service.
- Design a new table to store embeddings of AI-generated content (dashboard explanations, reports, recommendations), scoped by company and dataset, with metadata about source type and creation date.
- Add the necessary database migration and a similarity search index.

**Deliverable:** The database is ready to store and query semantic embeddings of AI-generated history.

---

## Day 7 — RAG: embedding pipeline

**Goal:** Automatically capture AI-generated content as searchable embeddings.

**Tasks:**
- Add an embedding capability to `ai-service` using a lightweight, purpose-built sentence embedding model, served through the appropriate inference API for feature-extraction tasks (distinct from the chat-completion endpoint used for text generation).
- Hook this into the existing AI generation flow, so that every dashboard explanation, report, and recommendation generated going forward is automatically embedded and stored — no manual step required.

**Deliverable:** Every new AI-generated insight is automatically captured for future retrieval.

---

## Day 8 — RAG: retrieval and grounding

**Goal:** Let the assistant retrieve and reference relevant history when answering questions.

**Tasks:**
- Implement a retrieval function that embeds an incoming query and performs a similarity search against the stored history, scoped to the requesting company.
- Keep this retrieval logic in the backend, consistent with the architectural principle that the AI service itself never accesses the database directly — retrieved context is passed to `ai-service` as part of the request payload, the same way current analytics data already is.
- Extend the chat prompt template to incorporate retrieved historical context, allowing the assistant to answer continuity-style questions ("how does this compare to last quarter?") grounded in real past output.

**Deliverable:** The chat assistant can answer questions using genuinely relevant historical context, not just the current dataset in isolation.

---

## Day 9 — RAG evaluation and refinement

**Goal:** Ensure retrieval quality is actually good, not just technically functional.

**Tasks:**
- Test a range of cross-period and comparative questions, evaluating whether retrieved context is genuinely relevant.
- Tune the number of retrieved results and introduce a minimum relevance threshold, so weakly related content is excluded rather than always injected.
- Add lightweight source attribution in the UI (e.g., referencing which past report or recommendation informed an answer), improving transparency and making the retrieval mechanism visible and demonstrable.

**Deliverable:** A tuned, transparent RAG pipeline producing genuinely useful grounded answers.

---

## Day 10 — Evaluation, documentation, and demonstration

**Goal:** Validate the system rigorously and prepare final deliverables.

**Tasks:**
- Build a standalone evaluation script that tests the AI endpoints against a fixed set of known inputs, checking for factual accuracy against known KPI values, response latency, and correct grounding in retrieved context for RAG-dependent answers.
- Conduct a final full regression pass across every feature, basic and RAG-enhanced alike.
- Document the system's architecture, methodology, and design decisions.
- Record a demonstration covering the complete user journey: data upload, dashboard, and the full range of AI capabilities including a retrieval-grounded example.

**Deliverable:** A fully tested, documented, and demonstrable AI-enhanced AGORYS platform.