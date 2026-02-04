# 🚀 Event Management & Web Scraping Platform

A full-stack, production-ready web application that **automatically scrapes event data from multiple sources**, stores it in a centralized database, and provides a **secure, responsive admin dashboard** for managing events and ticket-related information.

This project demonstrates real-world concepts such as **web scraping, secure authentication, RESTful APIs, session handling, and cloud deployment**.

---

## 📌 Table of Contents

- Overview
- Features
- Tech Stack
- System Architecture
- Authentication Flow
- Web Scraping Workflow
- Project Structure
- Environment Variables
- Local Setup & Installation
- Deployment
- Screenshots / Demo
- Future Improvements
- License

---

## 🧠 Overview

The platform is designed to solve the problem of **manually tracking and managing event listings** from multiple sources.

It:
- Scrapes event data automatically
- Stores and organizes events in MongoDB
- Allows only **authorized admins** to manage events
- Supports ticket-related redirection and event publishing
- Is fully responsive and production-deployed

---

## ✨ Features

### 🔐 Authentication & Security
- Google OAuth 2.0 authentication using Passport.js
- Admin-only access control
- Secure session handling with cookies
- Protected admin routes

### 🕷️ Web Scraping
- Automatically scrapes events from multiple sources
- Stores raw scraped data for review
- Supports manual re-scraping from the admin dashboard

### 🧑‍💼 Admin Dashboard
- Review newly scraped events
- Import events into live listings
- Archive or deactivate events
- Manage event metadata and ticket URLs
- Trigger scraping jobs manually

### 🔎 Data Management
- Search events by title or source
- Pagination for large datasets
- Real-time UI updates after actions

### 📱 Responsive UI
- Mobile-first design
- Slide-in sidebar for small screens
- Optimized UX for desktop and mobile admins

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- Framer Motion
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js (Google OAuth)
- Express Session
- CORS

### Deployment
- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

---

## 🏗️ System Architecture

Frontend (React + Vite)
|
| REST APIs (Axios)
|
Backend (Node + Express)
|
| Mongoose ODM
|
MongoDB Atlas 

- Frontend and backend are **fully decoupled**
- Backend exposes secure REST APIs
- Frontend communicates using authenticated requests with cookies

---

## 🔐 Authentication Flow

1. Admin clicks **Sign in with Google**
2. Redirects to backend `/auth/google`
3. Google OAuth authentication
4. Callback handled by backend
5. Session created and stored
6. User redirected to `/admin/dashboard`
7. Frontend fetches user via `/auth/me`

---

## 🕷️ Web Scraping Workflow

1. Scraper fetches data from external event sources
2. Raw event data stored with `status: "new"`
3. Admin reviews scraped events
4. Events can be:
   - Imported (published)
   - Archived (ignored)
5. Imported events become live and ticket-ready

---

## 📁 Project Structure

event-scraping-platform/
│
├── server/ # Backend
│ ├── routes/
│ ├── models/
│ ├── config/
│ ├── cron/
│ ├── index.js
│
├── client/
│ └── eventScraping/
│ ├── public/
│ │ └── _redirects
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ └── App.jsx
│ ├── index.html
│ └── vite.config.js
│
└── README.md

---

## 🔑 Environment Variables

### Backend (Render)

```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
CLIENT_URL=https://your-frontend-domain.netlify.app
PORT=5000
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2️⃣ Backend setup
cd server
npm install
npm run dev
3️⃣ Frontend setup
cd client/eventScraping
npm install
npm run dev
🚀 Deployment
Frontend (Netlify)

Build command: npm run build

Publish directory: dist

SPA routing handled via public/_redirects

Backend (Render)

Node.js service

Environment variables configured in Render dashboard

Auto-deploy on GitHub push
🔮 Future Improvements

Role-based access control (multiple admin roles)

Event analytics dashboard

Scheduled scraping with monitoring

Email notifications for new events

Public-facing event listing page

📄 License

This project is licensed under the MIT License.
Feel free to use, modify, and learn from it.

👨‍💻 Author

Built with ❤️ by Raj Sarkar
B.Tech | Full-Stack Development | MERN Stack
