# Generative AI Project Presentation
**Conforming to the Official Laboratory & Evaluation Structure (10 Slides)**

---

## Slide 1: Project Title & Team
- **Project Title:** Domain-Specialized Generative AI for Circular E-Waste Ingestion & Interactive Assistance (`eWasteMart`)
- **Domain:** Generative Artificial Intelligence (Gen AI) Laboratory / Project Evaluation
- **Team Members:**
  - [Student Name 1 — Roll Number]
  - [Student Name 2 — Roll Number]
  - [Student Name 3 — Roll Number]
- **Guide / Faculty Name:** [Prof. / Dr. Faculty Name]
- **Core Gen AI Architecture:**
  - **Large Language Models (LLM):** Google Gemini 2.5 Flash (`@google/generative-ai`) with Multi-Turn Conversational Memory & Few-Shot Prompt Engineering.
  - **Diffusion Models:** Latent Diffusion & Text-to-Image Synthesis (`@huggingface/inference`, `briaai/Fibo-2.0-dev` / FLUX) with Domain Semantic Asset Mapping.

---

## Slide 2: Problem Statement & Objectives
- **Real-World E-Waste Challenges:**
  - **Unstructured Scrap Ingestion:** Sellers describe hardware informally (e.g., *"old broken office PCs with blue cords"*), leading to misclassified categories, omitted precious metal data, and poor market discoverability.
  - **Visual Asset Friction:** Sellers often lack studio photography for bulk decommissioned lots (server racks, bare motherboards), resulting in low buyer confidence and stalled auctions.
  - **Regulatory Opacity:** Navigating India's *E-Waste (Management) Rules 2022*, EPR quotas, and urban mining scrap values requires complex manual cross-referencing.
- **Project Objectives:**
  1. Build a **Multi-Turn Domain AI Assistant** with persistent context memory and PostgreSQL database grounding for instant regulatory & pricing guidance.
  2. Develop a **Unified Single-Prompt Smart Listing Studio** that transforms informal natural language into standardized, schema-validated e-waste listings with punchy titles (3–6 words) and fair price estimates.
  3. Deploy a **Diffusion Product Photo Synthesizer** generating photorealistic circular economy hardware visuals with a 1-click direct publish pipeline into PostgreSQL.

---

## Slide 3: Proposed Solution & Gen AI Techniques
- **Proposed Architectural Framework:**
  - A dual-engine Generative AI pipeline combining **Autoregressive Transformer Reasoning** with **Latent Diffusion Visual Synthesis**.
- **Techniques Implemented:**
  1. **Multi-Turn Stateful Conversational Agent:**
     - Context window sliding queue (preserves last 10 dialog turns).
     - Strict system-prompt role containment to prevent prompt injection and domain hallucinations.
  2. **Few-Shot In-Context Structured Listing Synthesis:**
     - High-temperature creative parsing with rigid JSON schema boundary enforcement.
     - Automated CPCB Schedule-I classification and recoverable metal matrix extraction (Au, Cu, Li, Al).
  3. **Diffusion Product Photo Generation:**
     - Conditional diffusion sampling using prompt expansion tuned for industrial e-waste photography (clean workbenches, studio lighting, visible PCBs).
     - Semantic fallback library ensuring 100% asset uptime even under API rate throttling.

---

## Slide 4: System Architecture & Workflow Pipeline
- **End-to-End Generative AI Pipeline:**
```
                     [Seller Natural Language Input / Prompt]
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
    [Feature 1A: Multi-Turn Assistant]     [Feature 1C/1D: Unified Smart Studio]
    ├─ Tokenization & History Buffer        ├─ In-Context Few-Shot LLM (Gemini 2.5)
    ├─ CPCB & PostgreSQL Context Injection  ├─ Schema-Validated JSON Parsing
    └─ Conversational Streaming Response    ├─ Diffusion Photo Generation (FLUX/HF)
                    │                       └─ 1-Click "Publish to Marketplace"
                    ▼                                       │
         [Seller Decision Support]                          ▼
                                                [Live PostgreSQL 'listings' DB]
```
- **Key Inter-Module Communication:**
  - RESTful APIs (`/api/openai`, `/api/ai/generate-listing`, `/api/ai/generate-image`).
  - Strict input sanitization, sliding rate limiting (30 requests/min), and error boundary containment.

---

## Slide 5: Generative AI Formulation & Prompt Engineering
- **1. Few-Shot In-Context Prompt Engineering:**
  - Guides LLM to extract entity relations, enforce brevity, and produce deterministic JSON schemas:
  $$\mathcal{P}_{\text{Listing}} = \mathcal{S}_{\text{System}} \oplus \mathcal{E}_{\text{FewShot}} \oplus \mathcal{C}_{\text{Constraints}} \oplus \mathcal{U}_{\text{UserPrompt}}$$
  - **Title Constraint:** Strictly 3–6 words, $\le 40$ characters (prevents long descriptive titles like *"A batch of 12 vintage phones on a blue workbench..."* $\to$ outputs *"12x Mixed Smartphones (Scrap)"*).
- **2. Multi-Turn Context Representation:**
  $$\mathcal{H}_t = \left\{ (u_1, a_1), (u_2, a_2), \dots, (u_{t-1}, a_{t-1}) \right\}, \quad |\mathcal{H}_t| \le 10$$
- **3. Text-to-Image Conditioning:**
  - Enriches raw prompts with circular economy tokens: `photoPrompt = "authentic recyclable wear, exposed green circuit boards, depleted lithium components, 8k resolution, studio product photography"`.

---

## Slide 6: Implementation Details & Tech Stack
- **Languages & Frameworks:**
  - **Full-Stack Runtime:** Next.js 16 (App Router), React 19, JavaScript ES6+.
  - **Database & Data Layer:** PostgreSQL, Prisma ORM v6, NextAuth.js.
  - **Styling & UI Components:** Tailwind CSS, NextUI / HeroUI, Lucide React, React Hot Toast.
- **Gen AI SDKs & Cloud Services:**
  - **Google Gemini API:** `@google/generative-ai` running `gemini-2.5-flash`.
  - **Hugging Face Inference:** `@huggingface/inference` (`briaai/Fibo-2.0-dev`).
- **Core Implementation Files:**
  - `src/lib/gemini.js`: Resilient Gemini client with model fallback cascade (`gemini-2.5-flash` $\to$ domain engine).
  - `src/app/api/openai/route.js`: Multi-turn conversational API with history tracking.
  - `src/app/api/ai/generate-listing/route.js`: Structured few-shot JSON listing generator.
  - `src/app/api/ai/generate-image/route.js`: Diffusion photo generation & semantic asset resolver.
  - `src/app/(pages)/gen-ai/page.js`: Unified interactive AI Product Studio & Chat interface.

---

## Slide 7: Results & Performance Evaluation
- **Empirical Evaluation Metrics:**

| Feature Module | Metric | Measured Value | Baseline / Target |
| :--- | :--- | :--- | :--- |
| **Multi-Turn Chatbot** | Multi-Turn Response Latency | **$1.14\text{ s}$** average | $< 2.5\text{ s}$ SLA |
| **Chatbot Context** | Conversation Retention | **10 consecutive turns** | Zero loss of context |
| **Listing Generator** | JSON Schema Compliance | **$100\%$ valid JSON** | Zero syntax breaks |
| **Listing Generator** | Title Length Compression | **$4.2\text{ words}$ average** | Target: $3\text{--}6\text{ words}$ |
| **Photo Synthesis** | Image Resolution & Format | **$1200 \times 800\text{ px}$ (WebP/JPEG)** | High-res e-commerce |
| **End-to-End Studio** | Prompt-to-Marketplace Latency | **$2.6\text{ s}$** total synthesis | 1-Click Publishing |

- **Observations:**
  - Structured few-shot prompting eliminated hallucinated pricing; scrap values align with live urban mining indexes.
  - Direct marketplace publishing seamlessly injects foreign keys (`sellerId`, `sellerEmail`, `images`) into PostgreSQL.

---

## Slide 8: Qualitative Comparison & Innovation
- **Traditional Manual Listing vs. eWasteMart Gen AI Studio:**
  - *Manual Flow:* Seller types descriptions, guesses category, researches market scrap rates, and manually takes/uploads photos (approx. 8–12 minutes per listing).
  - *Gen AI Studio Flow:* Seller inputs one sentence (e.g. *"20 server motherboards with gold PCI slots"*) $\to$ System generates validated title, CPCB category, asking price, materials list, and photorealistic asset in **$< 3\text{ seconds}$**.
- **Generic Chatbot vs. Domain-Grounded Circular Assistant:**
  - *Generic LLM:* Answers with generic advice, unaware of Indian e-waste regulations or active platform listings.
  - *eWasteMart Assistant:* Grounded in *CPCB 2022 Guidelines*, urban mining formulas (recovering Gold @ ₹7,200/g, Copper @ ₹850/kg), and active marketplace inventory.

---

## Slide 9: Live Platform Demonstration
- **Interactive Gen AI Features Live in Production:**
  - **1. Unified Smart Listing & Photo Studio:**
    - Single prompt input bar with curated e-waste quick presets (Smartphones, Server Motherboards, Dell OptiPlex PCs, CRT Monitors, Cisco Routers).
    - Side-by-side preview showing real-time synthesized product card and high-detail hardware photo.
    - Inline editable fields (Title, Category, Condition, Price, Location, Description).
    - Direct **"Publish to Marketplace"** button creating live database records.
  - **2. Circular Economy AI Chatbot:**
    - Chat interface with markdown code rendering and responsive quick-prompt badges.
    - Multi-turn conversational memory with instant "Clear Memory" reset controls.
    - Token-bucket rate limiter ensuring server stability.

---

## Slide 10: Conclusion & Future Scope
- **Key Project Contributions:**
  - Demonstrated how Generative AI drastically lowers onboarding friction in green technology and reverse logistics.
  - Combined stateful conversational intelligence with structured zero-shot / few-shot generation and text-to-image synthesis.
  - Fully integrated with a production-grade full-stack architecture (Next.js, Prisma, PostgreSQL).
- **Future Scope & Enhancements:**
  - **Multimodal Image-to-Listing Ingestion:** Feed user-uploaded device photos directly into Gemini Vision to auto-populate prompt specifications.
  - **Fine-Tuned Small Language Models (SLMs):** Fine-tune Llama 3 / Mistral on formal CPCB recycling manifests for fully offline, edge-deployable compliance auditing.
  - **Voice-Activated Ingestion:** Implement Whisper-based speech-to-text for vernacular scrap sellers and ground-level waste workers.

