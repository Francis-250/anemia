# AI-Based Anemia Risk Prediction System Using Machine Learning

An intelligent, AI-powered healthcare decision-support application for preliminary anemia risk assessment and screening using machine learning principles.

---

## 🔑 Test Credentials

The system comes pre-seeded with verified test accounts for testing across all three user roles:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@anemiacheck.test` | `AnemiaCheck123!` | Full System Administration & Management |
| **Doctor** | `doctor@anemiacheck.test` | `AnemiaCheck123!` | Clinical Review, Comments & Batch CSV Prediction |
| **Patient** | `patient@anemiacheck.test` | `AnemiaCheck123!` | Risk Self-Assessment & Doctor Consultation |

> **Note**: You can re-seed these accounts at any time by running `npm run db:seed`.

---

## ✨ Key Features

- **AI Anemia Risk Prediction**: Evaluates reported symptoms, nutritional factors, and clinical indicators to generate preliminary risk classifications (**HIGH**, **MODERATE**, **LOW**) with confidence scores and clinical guidance.
- **Patient Portal**: Interactive assessment questionnaire, historical assessment tracker, doctor assignment, and profile management.
- **Doctor Portal & Decision Support**: Review assigned patient assessments, add clinical feedback and urgent alerts, and update review statuses.
- **Batch CSV Dataset Analysis**: Enables doctors to upload `.csv` patient dataset files, run machine learning predictions in bulk, filter by risk level, inspect individual records, and export predicted datasets.
- **Admin Management Console**: Manage user accounts, approve/verify doctors, assign doctor reviews, inspect audit logs, and configure AI decision model settings.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **pnpm**: v10+ (or npm/yarn)
- **PostgreSQL Database** (or Neon Serverless Postgres)

### 2. Environment Setup
Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/anemia?schema=public"
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="openai/gpt-oss-20b"
```

### 3. Database Migration & Seeding

```bash
# Push database schema
npx prisma db push

# Seed test user accounts
npm run db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚕️ Medical Disclaimer

*This tool provides preliminary AI-assisted risk estimations based on machine learning models and reported symptoms. It does **NOT** provide a medical diagnosis. Confirmed diagnosis requires evaluation by a qualified healthcare professional and appropriate laboratory testing (such as a Complete Blood Count / Hemoglobin test).*
