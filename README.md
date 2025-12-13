# 🏀 Sports Training Tracker API

A RESTful API for athletes and coaches to manage training progress. It allows users to register, log in, and perform CRUD operations on workouts and goals. Coaches have additional permissions to view and manage all users. The API uses JWT authentication and role-based authorization.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Setup Instructions](#setup-instructions)
- [Authentication](#authentication)
- [Roles](#roles)
- [API Endpoints](#api-endpoints)
  - [Root Endpoint](#root-endpoint)
  - [User Endpoints](#user-endpoints)
  - [Workout Endpoints](#workout-endpoints)
  - [Goal Endpoints](#goal-endpoints)
- [Error Handling](#error-handling)
- [Notes](#notes)

---

## Setup Instructions

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies:
   npm install

3. Create a .env file in the root directory with the following:

PORT=3000
JWT_SECRET=your_jwt_secret
DB_NAME=training.db

4. Seed the database:

node database/seed.js

5. Start the server:

npm start

6. Access the API at: http://localhost:3000

---

## Authentication

All endpoints that modify or retrieve user-specific data require JWT authentication.

1. Register a user to create an account.
2. Login to receive a JWT token.
3. Include the token in requests requiring authentication:
   Authorization: Bearer <TOKEN>

Roles

- Athlete: Can manage their own workouts and goals.
- Coach: Can view and manage all users, workouts, and goals.

## API Endpoints

1. Root Endpoint

GET /
Returns a welcome message and API overview.
{
"message": "Welcome to Sports Training Tracker API",
"version": "1.0.0",
"endpoints": {
"health": "/health",
"register": "POST /api/users/register",
"login": "POST /api/users/login",
"users": "GET /api/users (coach only)",
"workouts": "GET /api/workouts (requires auth)",
"createWorkout": "POST /api/workouts (requires auth)",
"updateWorkout": "PUT /api/workouts/:id (requires auth)",
"deleteWorkout": "DELETE /api/workouts/:id (requires auth)",
"goals": "GET /api/goals (requires auth)",
"createGoal": "POST /api/goals (requires auth)",
"updateGoal": "PUT /api/goals/:id (requires auth)",
"deleteGoal": "DELETE /api/goals/:id (requires auth)"
}
}

2. Health Check

GET /health
{
"status": "OK",
"message": "Sports Training Tracker API is running."
}

---

User Endpoints

<details> <summary>Click to expand</summary>
1. Register a User

POST /api/users/register
{
"username": "johndoe",
"password": "password123",
"role": "athlete",
"height": 72,
"position": "guard"
}

Response:
{
"message": "User registered successfully",
"user": {
"id": 1,
"username": "johndoe",
"role": "athlete",
"password": "<hashed_password>"
}
}

2. Login
   POST /api/users/login
   {
   "username": "johndoe",
   "password": "password123"
   }

Response:
{
"message": "Login successful",
"token": "<JWT_TOKEN>"
}

3. Get All Users (Coach Only)
   GET /api/users
   Headers: Authorization: Bearer <TOKEN>
   Response:
   [
   {
   "id": 1,
   "username": "johndoe",
   "role": "athlete",
   "height": 72,
   "position": "guard"
   }
   ]

4. Get Single User (Coach Only)
   GET /api/users/:id
   Response: same as above

5. Update User
   PUT /api/users/:id
   Headers: Authorization: Bearer <TOKEN>
   Body: Any fields to update
   {
   "username": "newname",
   "password": "newpassword",
   "height": 74,
   "position": "forward"
   }

Response:
{
"message": "User updated successfully",
"user": { ...updated user object... }
}

6. Delete User (Coach Only)
DELETE /api/users/:id
Response:
{
"message": "User deleted successfully."
}
</details>

---

Workout Endpoints

<details> <summary>Click to expand</summary>

1. Get All Workouts
   GET /api/workouts

- Coaches: all workouts
- Athletes: own workouts only

2. Get Single Workout
   GET /api/workouts/:id
   Response: single workout object

3. Create Workout
   POST /api/workouts
   {
   "type": "shooting",
   "date": "2025-12-06",
   "duration": 60,
   "notes": "Focused on free throws",
   "shotsMade": 50,
   "reps": 10,
   "sets": 5
   }

Response:
{
"message": "Workout created.",
"workout": { ...workout object... }
}

4. Update Workout
   PUT /api/workouts/:id
   Body: any fields to update
   Response:
   {
   "message": "Workout updated.",
   "workout": { ...workout object... }
   }

5. Delete Workout
DELETE /api/workouts/:id
Response:
{
"message": "Workout deleted."
}
</details>

---

Goal Endpoints

<details> <summary>Click to expand</summary>

1. Get All Goals
   GET /api/goals
   Response: array of goals for the logged-in user

2. Get Single Goal
   GET /api/goals/:id
   Response: single goal object

3. Create Goal
   POST /api/goals
   {
   "title": "Improve free throw",
   "targetNumber": 100,
   "deadline": "2025-12-31",
   "progress": 20
   }

Response:
{
"message": "Goal created.",
"goal": { ...goal object... }
}

4. Update Goal
   PUT /api/goals/:id
   Body: any fields to update
   Response:
   {
   "message": "Goal updated.",
   "goal": { ...goal object... }
   }

5. Delete Goal
DELETE /api/goals/:id
Response:
{
"message": "Goal deleted."
}
</details>

---

## Error Handling

Status Code Meaning:

- 400 Bad Request (missing or invalid fields)
- 401 Unauthorized (invalid token or no token)
- 403 Forbidden (insufficient role permissions)
- 404 Not Found (resource does not exist)
- 500 Internal Server Error (database or server issue)


## Postman Documentation Link:
- https://documenter.getpostman.com/view/38985313/2sB3dPTWfJ

## Render Link:
- https://appdev-finalproject-sports-training.onrender.com
