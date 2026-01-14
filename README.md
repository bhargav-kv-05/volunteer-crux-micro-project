# 🤝 Volunteer Crux

**Connecting Volunteers with NGOs to create real impact.**
A full-stack platform designed for the Indian context (Hyderabad, Bengaluru, Mumbai) to streamline volunteer recruitment and event management.

## 🚀 Key Features

* **🔐 Secure Authentication:** Full Sign Up/Login system using **NextAuth.js** (Credentials + bcrypt).
* **🌏 Localized Events:** tailored for Indian cities with real-time database fetching.
* **⚡ Real-Time Data:** Events and user data powered by **MongoDB Atlas**.
* **🎨 Modern UI:** Built with **Tailwind CSS** and **shadcn/ui** for a clean, responsive experience.

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
* **Backend:** Next.js API Routes (Serverless)
* **Database:** MongoDB (via Mongoose)
* **Auth:** NextAuth.js

---

## 🏃‍♂️ Quick Start

**1. Clone the repository**
bash
git clone [https://github.com/bhargav-kv-05/volunteer-crux-micro-project.git](https://github.com/bhargav-kv-05/volunteer-crux-micro-project.git)
cd volunteer-crux-micro-project

## Install dependencies

```bash
npm install
```

## Set up Environment Variables Create a .env file in the root folder and add the following:

```Code snippet
# Database Connection
MONGODB_URI=your_mongodb_connection_string
# Authentication Secrets
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Run the App

```Bash
npm run dev
```

Open http://localhost:3000 to see the app live!

## 📂 Project Structure
* /app - Main pages (Dashboard, Login, Register).
* /components - Reusable UI components (Event Cards, Headers).
* /lib - Database connection logic.
* /models - MongoDB Schemas (User, Event).
* /api - Backend routes (Auth, Event fetching).

Built with ❤️ by Bhargav KV