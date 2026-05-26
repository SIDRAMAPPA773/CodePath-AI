# CodePath-AI (PrepTracker)

CodePath-AI (PrepTracker) is a full-stack, AI-powered platform designed to help software engineers track their DSA (Data Structures and Algorithms) progress, optimize resumes, master company-specific question sheets, and practice with AI-driven mock interviews.

## 🚀 Performance & Security Highlights

This application has been strictly benchmarked and secured to enterprise standards:

- **Frontend Performance (Lighthouse)**
  - 🟢 **99** Performance
  - 🟢 **96** Best Practices
  - 🟢 **93** Accessibility
  - 🟢 **90** SEO

- **API Scalability (Load Tested via Artillery)**
  - Successfully handled **200 rapid concurrent database requests** over 15 seconds.
  - **0% Error Rate** (`vusers.failed: 0`) under heavy backend load.
  - Median API response time: `~500ms` on a free-tier MongoDB cluster.

- **Web Security (Mozilla HTTP Observatory)**
  - 🏆 **A+ (110/100)** Security Grade
  - 10/10 strict security headers passed (including perfectly tuned Content-Security-Policy, X-Frame-Options DENY, and Strict Referrer-Policy).

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router, Chart.js, Custom Responsive CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** Express Sessions, Cookie-based cross-origin secure auth
- **AI Integration:** Google Gemini AI (for Resume parsing, Mock Interviews, and Weakness Analysis)
- **Deployment:** Render (Static Site Frontend + Web Service Backend)

## 🌟 Key Features

- **Dashboard & Analytics:** Visual pie charts tracking DSA problem-solving streaks and topic breakdowns.
- **AI Weakness Tracking:** Automated AI insights to help you focus on your weakest algorithms.
- **Company Question Sheets:** Curated lists of problems asked by top tech companies.
- **AI Mock Interviewer:** Practice coding rounds with an AI assistant.
- **Resume Improver:** Paste your resume for automated ATS optimization.
- **Fully Responsive:** Sleek mobile-first design with fluid layouts and a dynamic mobile dropdown menu.

## 💻 Local Development

1. Clone the repository.
2. Inside `/backend`, run `npm install` and `npm start`. Ensure you have a `.env` file with your `MONGO_URI` and `GEMINI_API_KEY`.
3. Inside `/frontend`, run `npm install` and `npm run dev`. Ensure you have a `.env` file with your `VITE_API_URL` set to `http://localhost:5000/api`.
