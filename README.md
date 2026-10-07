# Starleaks

Streaming platform with user authentication and admin panel.

## Features
- User registration and login
- Protected movies for authenticated users only
- Admin panel to manage movies
- MongoDB backend
- JWT authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create .env file (copy from .env.example):
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open in browser:
   - http://localhost:3000 (main page, requires login)
   - http://localhost:3000/login (user login)
   - http://localhost:3000/register (user registration)
   - http://localhost:3000/admin (admin panel)

## Admin Credentials
- Email: admin@starleaks.local
- Password: admin123

## Notes
- MongoDB connection is configured in .env
- Admin account is created automatically on first run
- Users can register freely
- Only authenticated users can view movies
- Only admin can add/remove movies
