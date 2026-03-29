# BDViralClip - Video Streaming Platform

A simple video streaming project with a video list and a player page, built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

## Cloudinary Setup
The project now supports direct video and thumbnail uploads to Cloudinary.

### Environment Variables
Add your Cloudinary credentials to `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=doyhiacif
CLOUDINARY_API_KEY=221424586279484
CLOUDINARY_API_SECRET=7zGbqoNSC4FkgeKWPQcwBPVxTCs
```

### Uploading Videos
1. Log in as an admin at `/admin/login`.
2. In the dashboard, you can now select a local video file and a thumbnail image.
3. Click "Upload Video" to securely send the files to Cloudinary and save the reference in MongoDB.

## Features
- **Video Grid**: Responsive list of videos.
- **Dual Video Support**: Plays both Cloudinary (HTML5 video) and YouTube (Iframe) content.
- **Admin Dashboard**: Full CRUD for videos with file upload support.
- **JWT Auth**: Secure access to administrative features.

## Prerequisites
- Node.js
- MongoDB (Running locally or a URI)

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Note: You can seed the database by sending a POST request to `http://localhost:5000/api/seed` (e.g., using Postman or Curl).*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Admin Panel & Auth
The project now includes a secure admin panel to manage videos.

### Admin Features
- **Secure Login**: JWT-based authentication.
- **Video Management**: Add and delete videos directly from the dashboard.
- **Protected Routes**: Backend endpoints for adding/deleting videos require a valid token.

### Admin Setup
1. **Register Admin**: Use a tool like Postman to send a POST request to `http://localhost:5000/api/auth/register` with `username` and `password`.
2. **Access Dashboard**: Go to `http://localhost:5173/admin/login` in your browser.

## Backend Environment Variables
Add the following to `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bdviralclip
JWT_SECRET=your_super_secret_key_here
```

## Routes
- `/`: Public video list grid.
- `/video/:id`: Public video player.
- `/admin/login`: Admin login page.
- `/admin/dashboard`: Protected video management panel.
