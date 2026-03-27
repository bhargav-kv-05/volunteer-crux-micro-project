# 🤝 Volunteer Crux

**Connecting Volunteers with NGOs to create real impact.**
A full-stack platform designed for the Indian context (Hyderabad, Bengaluru, Mumbai) to streamline volunteer recruitment and event management.

## 🚀 Key Features

* **🔐 Advanced Authentication:** Multi-provider system supporting **NextAuth.js** Credentials & Google OAuth, with explicit Nodemailer SMTP password recovery.
* **🧠 Intelligent Matchmaking:** Custom-built algorithm that dynamically maps volunteer skills to exact NGO event requirements.
* **💬 Real-Time WebSockets:** Integrated custom Socket.io architecture providing instantaneous, database-persistent chat rooms.
* **🏆 Gamification Engine:** Global Leaderboard tracking "Impact Points" awarded via verified NGO attendance.
* **📜 Certificate Generation:** Javascript DOM-cloning algorithm exporting pixel-perfect structural PDF certificates.
* **⚡ Real-Time Data:** Events and user data strictly powered by **MongoDB Atlas**.
* **🎨 Modern UI:** Built with **Tailwind CSS** and **shadcn/ui** for a breathtaking responsive layout.

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
* **Backend:** Next.js API Routes (Serverless)
* **Real-Time Engine:** Custom Express + Socket.IO Server
* **Database:** MongoDB (via Mongoose)
* **Auth & Security:** NextAuth.js, Bcrypt, Google OAuth
* **Communication:** Nodemailer (SMTP)

## 📂 Project Structure

* /app - Main pages (Dashboard, Login, Register).
* /components - Reusable UI components (Event Cards, Headers).
* /lib - Database connection logic.
* /models - MongoDB Schemas (User, Event).
* /api - Backend routes (Auth, Event fetching).
