# 🌱 eWasteMart — AI-Powered Circular Economy Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-purple?style=for-the-badge)](https://openrouter.ai/)
[![Academic Project](https://img.shields.io/badge/Academic-GenAI%20%7C%20Soft%20Computing%20%7C%20CV-orange?style=for-the-badge)](#-academic-subjects--features-demonstration)

> **eWasteMart** is an intelligent, full-stack circular economy platform designed to streamline electronic waste management. Sellers (individual households, bulk IT refreshers, and enterprises) list decommissioned electronics, certified recyclers place competitive bids with counter-offers, and approved buyers complete payments and OTP-verified physical pickups.

---

## 📑 Table of Contents
1. [Core Platform Features](#-core-platform-features)
2. [Academic Subjects & Features Demonstration](#-academic-subjects--features-demonstration)
   - [1. Generative AI](#1-generative-ai-)
   - [2. Soft Computing](#2-soft-computing-)
   - [3. Computer Vision](#3-computer-vision-)
3. [Technology Stack](#-technology-stack)
4. [Prerequisites](#-prerequisites)
5. [Getting Started & Running Locally](#-getting-started--running-locally)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Demo Accounts & User Roles](#-demo-accounts--user-roles)
8. [Project Structure](#-project-structure)
9. [Academic Submission Documentation](#-academic-submission-documentation)

---

## 🚀 Core Platform Features

- **Role-Based Bidding Marketplace:** Distinct workflows for Individual Sellers, Bulk Sellers, Enterprises, and Certified Recyclers.
- **Interactive Negotiation:** Sellers can review bids, counter-offer with customized prices, and formally approve buyers.
- **Automated Scrap & Environmental Valuation:** Real-time calculation of recoverable gold, silver, copper, and prevented CO₂ emissions.
- **Secure Pickup & Tracking:** 6-digit OTP verification for logistics handlers upon handover with status tracking (`scheduled` $\to$ `picked_up` $\to$ `completed`).
- **Payment Processing:** Integrated Paytm and Razorpay with zero-config test/staging fallback modes.
- **AWS S3 Image Cloud Storage:** Device photo uploads directly stored on Amazon S3.

---

## 🎓 Academic Subjects & Features Demonstration

eWasteMart features an academic suite engineered to demonstrate concepts across **three university computer science subjects**:

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

### 1. Generative AI 🤖
- **Feature 1A: Prompt-Engineered Listing Generator** (`/marketplace`)
  - Uses **Few-Shot In-Context Learning** with domain exemplars to generate professional titles and recycler-targeted descriptions constrained strictly to JSON (`{"title": "...", "description": "..."}`).
  - *Files:* `src/app/api/ai/generate-listing/route.js`, `src/components/AIListingHelper.jsx`
- **Feature 1B: RAG Environmental Impact Certificate** (`/orders/[id]`)
  - **Retrieval-Augmented Generation (RAG)**: Retrieves verified database telemetry ($\text{CO}_2$ saved, metals recovered, toxins diverted) and real-world EPA equivalencies (trees saved, car kms eliminated) to synthesize an official, print-ready certificate without hallucination.
  - *Files:* `src/app/api/ai/impact-report/route.js`, `src/components/ImpactReport.jsx`
- **Feature 1C: Context-Aware Multi-Turn Chatbot** (Floating widget)
  - Stateful dialogue memory managing an active conversation queue with sliding context window and marketplace injection.
  - *Files:* `src/app/api/openai/route.js`, `src/components/ChatBox.js`

### 2. Soft Computing 🧠
- **Feature 2A: Fuzzy Logic Price Fairness Evaluator** (On Bid cards)
  - **Mamdani Fuzzy Inference System (FIS)** with triangular and trapezoidal membership functions evaluating Bid/Ask Ratio, Condition, and Volume.
  - Evaluates 9 rules and computes a 0–100 fairness score via **Centroid Defuzzification** (🟢 Fair, 🟡 Borderline, 🔴 Low-ball).
  - *Files:* `src/lib/fuzzy/priceEvaluator.js`, `src/components/FuzzyBadge.jsx`
- **Feature 2B: Genetic Algorithm Optimal Recycler Matching** (On Listings)
  - Multi-objective evolutionary search:
    $$\text{Fitness} = 0.50 \cdot S_{\text{price}} + 0.30 \cdot S_{\text{rating}} + 0.20 \cdot S_{\text{proximity}}$$
  - Features tournament selection ($k=3$), single-point crossover ($p_c = 0.85$), bit-flip mutation ($p_m = 0.10$), and 25-generation convergence tracking graphed in real-time.
  - *Files:* `src/lib/genetic/recyclerMatcher.js`, `src/components/BestMatchButton.jsx`
- **Feature 2C: Feedforward Neural Network (from scratch)** (`/marketplace`)
  - Pure JavaScript multi-layer perceptron ($5 \to 8 \to 6 \to 7$) classifying e-waste categories from continuous device metrics (weight, age, screen, battery, price) using ReLU hidden activations and Softmax output probabilities.
  - *Files:* `src/lib/nn/categoryClassifier.js`, `src/components/DeviceScanner.jsx`

### 3. Computer Vision 👁️
- **Feature 3A: MobileNet CNN Device Detection** (`/marketplace`)
  - In-browser transfer learning using Google's MobileNet v2 with depthwise separable convolutions. Maps 1000 ImageNet categories into 7 eWasteMart recycling classes.
  - *Files:* `src/lib/cv/deviceDetector.js`, `src/lib/cv/labelMapping.js`
- **Feature 3B: Laplacian Variance Sharpness Validator**
  - Convolves pixel luminance against a discrete $3 \times 3$ Laplacian spatial kernel ($[[0,1,0],[1,-4,1],[0,1,0]]$) to measure edge frequency variance $\sigma^2$, preventing blurry photo submissions.
  - *Files:* `src/lib/cv/imageQuality.js`
- **Feature 3C: Visual Condition Estimator (Sobel + HSV)**
  - Transforms RGB to HSV to decouple chromaticity from luminance. Detects burn marks ($V < 0.18$), rust/corrosion ($H \in [15^\circ, 45^\circ]$), and computes edge damage density via horizontal & vertical Sobel gradient filters.
  - *Files:* `src/lib/cv/conditionEstimator.js`

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 18, Tailwind CSS, NextUI, Framer Motion, Lucide Icons |
| **Backend** | Next.js Serverless Route Handlers, Node.js |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | NextAuth.js v4 (Credentials & Google OAuth) |
| **AI / LLMs** | OpenRouter / Together AI API (`meta-llama`, `mistral`, `claude`) with zero-config fallback |
| **Computer Vision** | TensorFlow.js, MobileNet v2, HTML5 Canvas 2D API |
| **Storage & Logistics** | AWS S3, MSG91 SMS OTP |
| **Payments** | Paytm & Razorpay |

---

## 📋 Prerequisites

Before running the application, ensure you have:
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm** or **yarn** or **pnpm**
- A **MongoDB Atlas** database connection string (or local MongoDB running on `mongodb://localhost:27017/ewastemart`)
- Modern web browser (Chrome, Edge, or Firefox) with WebGL enabled

---

## 💻 Getting Started & Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/eWasteMart.git
cd eWasteMart
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the environment template or create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Ensure the following minimal variables are set in `.env`:
```env
# Database
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ewastemart?retryWrites=true&w=majority"

# NextAuth Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-random-secret"

# AI Service (Optional — smart deterministic fallbacks are built-in if left blank!)
OPENROUTER_API_KEY="your-openrouter-key"
```

### 4. Start the development server
```bash
npm run dev
```

### 5. Access the application
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 Environment Variables Reference

| Variable | Description | Required? | Default / Notes |
|---|---|---|---|
| `MONGODB_URI` | MongoDB connection URI | **Yes** | Connection string to MongoDB Atlas |
| `NEXTAUTH_URL` | Canonical URL of the application | **Yes** | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for JWT session encryption | **Yes** | Generate via `openssl rand -base64 32` |
| `OPENROUTER_API_KEY` | OpenRouter LLM API key | Optional | Fallback algorithms activate if not set |
| `TOGETHER_API_KEY` | Alternative LLM API key | Optional | Used if OpenRouter key is empty |
| `S3_ACCESS_KEY` | AWS S3 Access Key ID | Optional | For permanent image hosting |
| `S3_SECRET_ACCESS_KEY` | AWS S3 Secret Access Key | Optional | For permanent image hosting |
| `S3_BUCKET_NAME` | AWS S3 Bucket Name | Optional | e.g. `ewastemart-uploads` |
| `AWS_S3_REGION` | AWS Region | Optional | e.g. `ap-south-1` |
| `PAYTM_MID` | Paytm Merchant ID | Optional | Mock mode enabled in dev |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Optional | Staging mode supported |

---

## 👥 Demo Accounts & User Roles

You can register accounts directly via the Sign Up page (`/register`), choosing from any of the four roles:

| Role | Access Level | Permissions |
|---|---|---|
| **User (Individual)** | Household Seller | Create listings, schedule pickups, view orders |
| **Bulk Seller** | IT Assets / Institutions | High-volume lots, AI estimate, negotiate counter-offers |
| **Enterprise** | Corporate Entities | Full seller and buyer privileges |
| **Recycler** | Certified Recyclers | Browse open desk, place competitive bids, schedule pickups |

> **Quick Testing Tip:** To test the full bidding and matching cycle, open one browser window (or incognito) as a **Seller** (`user`) to create a lot, and a second window as a **Recycler** (`recycler`) to place bids!

---

## 📂 Project Structure

```
eWasteMart/
├── src/
│   ├── app/                          # Next.js 16 App Router
│   │   ├── (auth)/                   # Authentication routes (login, register)
│   │   ├── (pages)/                  # Protected frontend views
│   │   │   ├── marketplace/          # E-Waste bidding desk & creation panel
│   │   │   ├── orders/               # Order tracking & Impact Certificate
│   │   │   ├── pickups/              # Logistics & OTP verification
│   │   │   └── payments/             # Transactions & receipts
│   │   └── api/                      # REST API endpoints
│   │       ├── ai/                   # GenAI routes (generate-listing, impact-report)
│   │       ├── listings/             # Marketplace CRUD, bids, & GA best-match
│   │       └── openai/               # Multi-turn chatbot route
│   ├── components/                   # React UI Components
│   │   ├── AIListingHelper.jsx       # Feature 1A: Prompt listing generator
│   │   ├── ImpactReport.jsx          # Feature 1B: RAG impact certificate
│   │   ├── FuzzyBadge.jsx            # Feature 2A: Fuzzy logic fairness badge
│   │   ├── BestMatchButton.jsx       # Feature 2B: Genetic algorithm matcher
│   │   ├── DeviceScanner.jsx         # Features 2C, 3A, 3B, 3C: ML & CV scanner
│   │   ├── Marketplace.js            # Core marketplace controller
│   │   └── ChatBox.js                # Feature 1C: Contextual chatbot
│   ├── lib/                          # Pure Algorithm Engines
│   │   ├── fuzzy/priceEvaluator.js   # Mamdani Fuzzy Inference System
│   │   ├── genetic/recyclerMatcher.js# Genetic Algorithm & fitness optimization
│   │   ├── nn/categoryClassifier.js  # 5→8→6→7 Feedforward Neural Network
│   │   └── cv/                       # Computer Vision modules
│   │       ├── deviceDetector.js     # MobileNet CNN inference
│   │       ├── labelMapping.js       # ImageNet to e-waste category mapping
│   │       ├── imageQuality.js       # Laplacian convolution kernel
│   │       └── conditionEstimator.js # Sobel operator & HSV color histograms
│   └── models/                       # Mongoose Schemas (User, Listing, Order, Pickup)
├── ACADEMIC_SUBMISSION_GUIDE.md      # Detailed academic viva guide & mathematical formulas
├── package.json
└── README.md
```

---

## 📚 Academic Submission Documentation

For professors, evaluators, and viva examination:
- Open [`ACADEMIC_SUBMISSION_GUIDE.md`](./ACADEMIC_SUBMISSION_GUIDE.md) for:
  - Exact mathematical derivations for Mamdani FIS, Genetic Algorithm, Multi-Layer Perceptrons, Laplacian Variance, and HSV Transformations.
  - Model viva questions and answers for **Generative AI**, **Soft Computing**, and **Computer Vision**.
  - A 5-minute live demonstration script.

---

## 📄 License
This project was developed for academic research and hackathon demonstration purposes.
Distributed under the MIT License.
