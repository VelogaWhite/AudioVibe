# 🎵 AudioVibe: Intelligent Music Playlist Generator

> **AudioVibe** คือ Web Application แนะนำและสร้างเพลย์ลิสต์เพลงตามอารมณ์ด้วยคำสั่งภาษาธรรมชาติ (Natural Language Prompt) วิเคราะห์คุณลักษณะเสียงเชิงลึก (7 Audio Features) ด้วย Machine Learning และเชื่อมต่อการส่งออกเพลย์ลิสต์ไปยัง **Spotify** ได้จริงผ่าน OAuth 2.0

---

## 🛠️ Tech Stack & Architecture

โครงการนี้พัฒนาด้วยสถาปัตยกรรม **Microservices Architecture**:

| Component | Technology Stack | Responsible Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React), TypeScript, Tailwind CSS, Shadcn/ui, Recharts | Frontend Developer |
| **Backend Core** | NestJS / Express.js, PostgreSQL (Prisma ORM), Redis Cache | Backend Developer |
| **Data & ML Service** | Python, FastAPI, Scikit-learn, Gemini API (OpenRouter) | Data/ML Engineer |
| **Testing & CI/CD** | Jest, Pytest, Playwright, GitHub Actions | QA & Project Manager |

---

## 🧪 Quality Control & Testing Policy

ตามมาตรฐานวิชา Software Engineering โครงการนี้กำหนดเกณฑ์ทดสอบดังนี้:
* **Code Coverage Goal**: ไม่ต่ำกว่า **70% - 80%** ในส่วน Core Business Logic
* **Automated Unit & Integration Testing**:
  * Backend Core: `Jest`
  * Data/ML Service: `Pytest`
* **End-to-End (E2E) Testing**: `Playwright`

---

## 👥 Team Members & Roles

* **Frontend Developer**: UI/UX, State Management, Spotify Export UI, Radar Chart
* **Backend Core Developer**: Authentication (OAuth 2.0), NestJS Core API, PostgreSQL, Redis
* **Data/ML Engineer**: NLP Prompt Analysis (Gemini), Cosine Similarity/KNN Algorithm, FastAPI
* **QA Engineer & Project Manager**: Test Automation, CI/CD Pipeline, Quality Assurance & Monitoring