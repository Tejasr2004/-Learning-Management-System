# NextLMS - Learning Management System

A full-stack, aesthetically premium Learning Management System built with **Next.js (App Router)** and **Node.js (Express)**, backed by a **MySQL** database.

## 🚀 Features
- **Frontend**: Next.js 14+, Tailwind CSS, styled interfaces, responsive design, React-YouTube Video Player.
- **Backend**: Node.js, Express.js, JWT Authentication, MySQL Connection pooling via `mysql2`.
- **Functionality**: Secure Auth, Course dashboard, Nested curriculums, Automatic Video Progress Tracking.

## 📁 System Architecture
- `/frontend` - Next.js UI Application (Runs on port `3000`)
- `/backend` - Express API Server (Runs on port `5000`)

## 🛠 Prerequisites
1. **Node.js** (v18+)
2. **MySQL Server** running locally or remotely.

## 📦 Setup & Installation

### 1. Database Setup
Ensure your MySQL server is running. Create a new database named `lms` and run the `Table.mwb` or apply the SQL setup schema to create the `users`, `subjects`, `sections`, `videos`, and `user_progress` tables.

### 2. Backend Environment Variables
Navigate to `/backend` and ensure you have an `.env` file configured:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_PORT=3306
DB_NAME=lms
JWT_SECRET=super_secret_lms_key_12345
```

### 3. Install All Dependencies
From the root of this repository, run:
```bash
npm run install:all
```
*(This automatically installs dependencies in the root, `/frontend` and `/backend` directories)*

## 🏃‍♂️ Running the Application

To start both the Next.js frontend and Express backend concurrently, simply run this from the root directory:
```bash
npm start
```
The Frontend will be available at `http://localhost:3000`
The Backend will run on `http://localhost:5000`

## 💡 Usage

Navigate to the frontend, click **Get Started** to create a user account. You can log in, view courses, watch videos! Progress will save automatically every 5 seconds, and once a video completes, the next video in the sequence acts autonomously!
