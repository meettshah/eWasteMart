# eWasteMart — Academic Project Submission Guide

**Project Name:** eWasteMart: AI-Powered Smart Circular Economy Marketplace  
**Submissions:** 
1. **Generative AI**
2. **Soft Computing**
3. **Computer Vision**

---

## 📑 Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Subject 1: Generative AI (GenAI)](#subject-1-generative-ai)
   - [Feature 1A: Prompt-Engineered Listing Generator](#feature-1a-prompt-engineered-listing-generator)
   - [Feature 1B: RAG Environmental Impact Certificate](#feature-1b-rag-environmental-impact-certificate)
   - [Feature 1C: Context-Aware Multi-Turn LLM Chatbot](#feature-1c-context-aware-multi-turn-llm-chatbot)
   - [Viva Questions & Answers](#genai-viva-qa)
3. [Subject 2: Soft Computing](#subject-2-soft-computing)
   - [Feature 2A: Mamdani Fuzzy Inference System (Price Evaluator)](#feature-2a-mamdani-fuzzy-inference-system)
   - [Feature 2B: Multi-Objective Genetic Algorithm (Recycler Matcher)](#feature-2b-multi-objective-genetic-algorithm)
   - [Feature 2C: Multi-Layer Perceptron (E-Waste Classifier)](#feature-2c-multi-layer-perceptron)
   - [Viva Questions & Answers](#soft-computing-viva-qa)
4. [Subject 3: Computer Vision (CV)](#subject-3-computer-vision)
   - [Feature 3A: CNN Transfer Learning via MobileNet](#feature-3a-cnn-transfer-learning)
   - [Feature 3B: Laplacian Variance Sharpness & Quality Validator](#feature-3b-laplacian-variance-quality-validator)
   - [Feature 3C: Sobel Edge Density & HSV Histogram Condition Estimator](#feature-3c-sobel-edge--hsv-condition-estimator)
   - [Viva Questions & Answers](#computer-vision-viva-qa)
5. [Live Demonstration Script for Professors](#live-demonstration-script)

---

## 1. Overview & Architecture

eWasteMart integrates three major disciplines of Artificial Intelligence into a production-grade full-stack web application (Next.js 16, MongoDB, React, Canvas API, and OpenRouter LLMs):

```
                                 ┌──────────────────────────────────────────────────────────┐
                                 │                   eWasteMart UI                          │
                                 └────────────────────────────┬─────────────────────────────┘
                                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│     Generative AI       │          │     Soft Computing      │          │     Computer Vision     │
├─────────────────────────┤          ├─────────────────────────┤          ├─────────────────────────┤
│ • Few-Shot Prompting    │          │ • Mamdani Fuzzy System  │          │ • MobileNet v2 CNN      │
│ • Structured JSON Output│          │ • Multi-Objective GA    │          │ • Laplacian Blur Kernel │
│ • RAG Narrative Grounding│         │ • 3-Layer MLP (ReLU/Smax)│         │ • Sobel Gradients       │
│ • Multi-turn History    │          │ • Centroid Defuzzifier  │          │ • HSV Color Histograms  │
└─────────────────────────┘          └─────────────────────────┘          └─────────────────────────┘
```

---

## 2. Subject 1: Generative AI

### Feature 1A: Prompt-Engineered Listing Generator
* **File:** [`src/app/api/ai/generate-listing/route.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/app/api/ai/generate-listing/route.js) | [`src/components/AIListingHelper.jsx`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/components/AIListingHelper.jsx)
* **Academic Concept:** Few-Shot In-Context Learning & Structured JSON Generation.
* **Mechanism:**
  - Employs a few-shot system prompt containing structured domain input-output exemplars.
  - Temperature set to $0.7$ for creative yet consistent commercial titles.
  - Output strictly constrained to RFC 8259 JSON schema: `{"title": "...", "description": "..."}`.

### Feature 1B: RAG Environmental Impact Certificate
* **File:** [`src/app/api/ai/impact-report/route.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/app/api/ai/impact-report/route.js) | [`src/components/ImpactReport.jsx`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/components/ImpactReport.jsx)
* **Academic Concept:** Retrieval-Augmented Generation (RAG) & Grounded Narrative Synthesis.
* **Mechanism:**
  - Retrieves deterministic physical metrics from database: $\text{CO}_2\text{ saved (kg)}$, $\text{metals recovered (kg)}$, $\text{toxins diverted (kg)}$.
  - Calculates physical equivalence models (EPA / UNEP constants: $1\text{ tree} \approx 22\text{ kg CO}_2/\text{yr}$; passenger vehicle $\approx 0.21\text{ kg CO}_2/\text{km}$).
  - Injects retrieved telemetry into prompt as an unalterable ground truth context, preventing hallucination.
  - Includes browser-printable certificate stylesheet with verification metadata.

### Feature 1C: Context-Aware Multi-Turn LLM Chatbot
* **File:** [`src/app/api/openai/route.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/app/api/openai/route.js) | [`src/components/ChatBox.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/components/ChatBox.js)
* **Academic Concept:** Stateful Dialogue Management & Sliding-Window Conversation Memory.
* **Mechanism:**
  - Maintains conversation array $H = [m_1, m_2, \dots, m_t]$.
  - Sliding context window (limits history to last 10 messages) to balance token attention budgets.
  - Prepends dynamic system prompt injecting eWasteMart marketplace state and recycling terminology.

<a id="genai-viva-qa"></a>
### GenAI Viva Questions & Answers
* **Q1: Why use Few-Shot prompting instead of Zero-Shot for listing generation?**  
  *A:* Zero-shot often yields conversational preamble ("Here is your listing:"). Few-shot demonstrates the exact JSON schema and tone without requiring model fine-tuning.
* **Q2: How does your Impact Report prevent hallucination?**  
  *A:* Through RAG grounding: the calculations for tree equivalence and emission savings are computed deterministically before reaching the LLM; the prompt restricts the LLM to only interpreting the provided numbers.
* **Q3: How do you handle token context length in multi-turn conversations?**  
  *A:* Through a sliding window queue in `ChatBox.js`, retaining the system prompt plus the $k$ most recent dialogue turns.

---

## 3. Subject 2: Soft Computing

### Feature 2A: Mamdani Fuzzy Inference System
* **File:** [`src/lib/fuzzy/priceEvaluator.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/fuzzy/priceEvaluator.js) | [`src/components/FuzzyBadge.jsx`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/components/FuzzyBadge.jsx)
* **Academic Concept:** Fuzzy Logic, Triangular/Trapezoidal Membership Functions, Mamdani Min-Max Inference, Centroid Defuzzification.
* **Mathematical Formulation:**
  - **Inputs:** 
    - Price Ratio $R = \frac{\text{Bid Amount}}{\text{Asking Price}} \in [0, 2.0]$ (Low, Fair, High)
    - Condition Quality $C \in [0, 1.0]$ (Scrap, Mixed, Good)
    - Quantity Volume $Q \in [1, 500]$ (Small, Medium, Bulk)
  - **Triangular Membership:**
    $$\mu(x; a, b, c) = \max\left(0, \min\left(\frac{x - a}{b - a}, \frac{c - x}{c - b}\right)\right)$$
  - **Rule Inference:** 9 Mamdani rules evaluated using Zadeh conjunction ($\min$):
    $$w_i = \min(\mu_{A_i}(R), \mu_{B_i}(C), \mu_{C_i}(Q))$$
  - **Defuzzification (Centroid of Area):**
    $$z^* = \frac{\sum_{i=1}^n w_i \cdot c_i}{\sum_{i=1}^n w_i} \in [0, 100]$$

### Feature 2B: Multi-Objective Genetic Algorithm
* **File:** [`src/lib/genetic/recyclerMatcher.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/genetic/recyclerMatcher.js) | [`src/components/BestMatchButton.jsx`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/components/BestMatchButton.jsx)
* **Academic Concept:** Evolutionary Computation, Chromosome Representation, Multi-Objective Fitness Optimization, Elitism.
* **Mechanism:**
  - **Fitness Function:**
    $$F(b) = 0.50 \cdot S_{\text{price}}(b) + 0.30 \cdot S_{\text{rating}}(b) + 0.20 \cdot S_{\text{proximity}}(b)$$
  - **Genetic Operators:**
    - *Selection:* Tournament Selection ($k=3$).
    - *Crossover:* Single-point crossover ($p_c = 0.85$).
    - *Mutation:* Bit-flip perturbation ($p_m = 0.10$).
    - *Elitism:* Top $10\%$ chromosomes survive unconditionally to subsequent generations.
  - Convergence trajectory recorded across 25 generations and graphed in the UI.

### Feature 2C: Multi-Layer Perceptron (MLP)
* **File:** [`src/lib/nn/categoryClassifier.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/nn/categoryClassifier.js) | [`src/lib/nn/weights.json`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/nn/weights.json)
* **Academic Concept:** Feedforward Artificial Neural Network, Non-Linear Activations, Softmax Probability Distribution.
* **Architecture:** $5 \to 8 \to 6 \to 7$
  - **Input vector $\mathbf{x} \in \mathbb{R}^5$:** $[\text{weight}, \text{age}, \text{has\_battery}, \text{has\_screen}, \text{orig\_price}]$ normalized via Min-Max scaling:
    $$x_{\text{norm}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$
  - **Hidden Layers:** $\mathbf{h}_1 = \text{ReLU}(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1)$, $\mathbf{h}_2 = \text{ReLU}(\mathbf{W}_2 \mathbf{h}_1 + \mathbf{b}_2)$
  - **Output Layer:** Multi-class Softmax:
    $$P(y = c \mid \mathbf{x}) = \frac{e^{z_c}}{\sum_{j=1}^7 e^{z_j}}$$

<a id="soft-computing-viva-qa"></a>
### Soft Computing Viva Questions & Answers
* **Q1: Why choose Mamdani inference over Sugeno for bid evaluation?**  
  *A:* Mamdani outputs fuzzy sets defuzzified into intuitive percentages, making it human-interpretable for economic negotiation transparency.
* **Q2: Why not just select the highest bidder instead of using a Genetic Algorithm?**  
  *A:* E-waste disposal is multi-objective: highest price from an unverified or distant bidder carries high default risk and transport emissions. The GA balances economic, compliance, and logistical fitness.
* **Q3: What role does Softmax play in your Neural Network classifier?**  
  *A:* Softmax transforms raw logits into a valid probability distribution ($\sum p_i = 1$), allowing the system to measure model confidence.

---

## 4. Subject 3: Computer Vision

### Feature 3A: CNN Transfer Learning via MobileNet
* **File:** [`src/lib/cv/deviceDetector.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/cv/deviceDetector.js) | [`src/lib/cv/labelMapping.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/cv/labelMapping.js)
* **Academic Concept:** Deep Convolutional Neural Networks, Depthwise Separable Convolutions, Transfer Learning.
* **Mechanism:**
  - Loads MobileNet v2 in browser via TensorFlow.js.
  - Takes 224x224 RGB image input.
  - Transfers 1000 ImageNet classification output synsets to 7 circular economy e-waste categories through semantic mapping.
  - Offline morphological fallback based on aspect-ratio geometry ensures zero demo failures.

### Feature 3B: Laplacian Variance Sharpness Validator
* **File:** [`src/lib/cv/imageQuality.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/cv/imageQuality.js)
* **Academic Concept:** Discrete Spatial Filtering, 2D Convolution, Edge Energy Variance.
* **Mathematical Formulation:**
  - Convolves luminance channel $I(x,y)$ with a discrete 3x3 Laplacian kernel:
    $$L = \begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$$
  - Computes variance of Laplacian response:
    $$\sigma^2 = \frac{1}{N} \sum_{x,y} \left( (\nabla^2 I)(x,y) - \mu_{\nabla^2} \right)^2$$
  - High variance ($\sigma^2 > 150$) denotes crisp high-frequency edges; low variance ($\sigma^2 < 50$) detects blur.

### Feature 3C: Sobel Edge Density & HSV Histogram Condition Estimator
* **File:** [`src/lib/cv/conditionEstimator.js`](file:///d:/WEB%20DEVELOPMENT/HACKATHON/spu-hackathon/eWasteMart/src/lib/cv/conditionEstimator.js)
* **Academic Concept:** Non-linear Color Space Transformations, Gradient Magnitude Computation, Damage Segmentation.
* **Mechanism:**
  - **Color Space Transform (RGB $\to$ HSV):**
    $$V = \max(R,G,B), \quad S = \frac{V - \min(R,G,B)}{V}$$
    $$H = \begin{cases} 
      60^\circ \times \frac{G-B}{\Delta} & \text{if } V = R \\
      60^\circ \times \left(\frac{B-R}{\Delta} + 2\right) & \text{if } V = G \\
      60^\circ \times \left(\frac{R-G}{\Delta} + 4\right) & \text{if } V = B 
    \end{cases}$$
  - **Sobel Kernels:**
    $$G_x = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}, \quad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}$$
    $$G = \sqrt{G_x^2 + G_y^2}$$
  - **Defect Detection:**
    - Burn Marks: $V < 0.18$ (charred black regions)
    - Rust / Oxidation: $H \in [15^\circ, 45^\circ]$ and $S > 0.40$
    - High edge density + rust $\implies$ "scrap" condition; clean low edge count $\implies$ "working".

<a id="computer-vision-viva-qa"></a>
### Computer Vision Viva Questions & Answers
* **Q1: Why convert RGB to HSV for rust and burn detection?**  
  *A:* In RGB space, illumination changes affect all three channels simultaneously. In HSV space, Hue is invariant to lighting brightness ($V$), allowing reliable rust and burn color isolation.
* **Q2: Why use the variance of the Laplacian instead of first-order derivatives for blur?**  
  *A:* The Laplacian is isotropic (rotation invariant) and acts as a high-pass filter. Blurry images lack high spatial frequencies, causing the second-derivative variance to collapse.
* **Q3: What makes MobileNet suitable for client-side edge deployment?**  
  *A:* It replaces standard convolutions with depthwise separable convolutions, reducing parameters and computation by $\approx 8\times$ to $9\times$ with minimal accuracy trade-off.

---

## 5. Live Demonstration Script for Professors

Follow this script during your college project presentation:

1. **Step 1: Open the Application**
   - Navigate to `/marketplace`.
   - Log in as a seller (e.g., individual or enterprise).

2. **Step 2: Demonstrate Generative AI (1A)**
   - Click **"AI + CV Smart Tools"**.
   - In **AI Listing Description Generator**, enter keyword: `"old broken thinkpad laptops"` and click **"✨ Generate Title & Description"**.
   - Point out the few-shot structured title and description generated.

3. **Step 3: Demonstrate Computer Vision (3A, 3B, 3C)**
   - Under **Computer Vision Scanner**, click and upload a photo of a device.
   - Click **"📷 Scan Device Photo with CV"**.
   - Show the professor:
     - **Feature 3A:** CNN object prediction (e.g., Laptop / Mobile) mapped to the e-waste category.
     - **Feature 3B:** Laplacian variance score and blur classification.
     - **Feature 3C:** Sobel edge density and HSV rust/burn pixel breakdown.

4. **Step 4: Demonstrate Soft Computing (2C)**
   - Under **Neural Network Auto-Classifier**, enter numeric values (Weight: 2.5 kg, Age: 4 yrs, Check "Has Battery").
   - Click **"🧠 Auto-classify Category"**.
   - Show the 5→8→6→7 MLP forward pass and the resulting Softmax probability distribution.

5. **Step 5: Demonstrate Soft Computing (2A & 2B)**
   - Publish a listing or view an existing listing with bids.
   - Point out **Feature 2A:** The **Fuzzy Logic Fairness Badge** (🟢 Fair / 🟡 Borderline / 🔴 Low-ball) on each bid card, derived via Mamdani inference.
   - Click **"🧬 Find Best Match (Genetic Algorithm)"** on a listing with bids.
   - Show the **GA Convergence History** bar chart displaying generation-by-generation multi-objective fitness evolution.

6. **Step 6: Demonstrate Generative AI (1B & 1C)**
   - Open a sold listing or `/orders/[id]` and click **"🌱 Generate Impact Certificate"**.
   - Show the RAG-grounded environmental calculation and click **"🖨️ Print Certificate"**.
   - Open the floating chatbot icon in the bottom right and show multi-turn memory:
     - Turn 1: *"What are the hazardous materials inside a cathode ray tube TV?"*
     - Turn 2: *"How should I safely package it for recycler pickup?"* (LLM retains context from previous question).
