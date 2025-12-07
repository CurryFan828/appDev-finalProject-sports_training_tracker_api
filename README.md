🏀 Sports Training Tracker API


A RESTful API for athletes and coaches to track workouts, goals, and training progress.

Table of Contents

Project Overview

Setup Instructions

Authentication

Roles

API Endpoints

User Endpoints

Workout Endpoints

Goal Endpoints

Error Handling

Project Overview

The Sports Training Tracker API allows users to:

Register and log in

Track workouts and goals

Coaches can manage all users, workouts, and goals

Setup Instructions
# Clone the repo
git clone <repository-url>

# Install dependencies
npm install

# Create a .env file in the root directory

# Start server
npm start


Server runs at: http://localhost:3000

Authentication

Register and log in to receive a JWT token.

Include in requests requiring authentication:

Authorization: Bearer <TOKEN>

Roles

Athlete: Manage own workouts and goals.

Coach: Manage all users, workouts, and goals.

API Endpoints
<details> <summary><strong>💻 User Endpoints</strong></summary>
1. Register

POST /api/users/register

Body:

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

Body:

{
  "username": "johndoe",
  "password": "password123"
}


Response:

{
  "message": "Login successful",
  "token": "<JWT_TOKEN>"
}

3. Get All Users (Coach only)

GET /api/users

Headers: Authorization: Bearer <TOKEN>

Response: Array of users

4. Get Single User (Coach only)

GET /api/users/:id

5. Update User

PUT /api/users/:id

Body: Any user fields to update

6. Delete User (Coach only)

DELETE /api/users/:id

</details> <details> <summary><strong🏋️ Workout Endpoints</strong></summary>
1. Get All Workouts

GET /api/workouts

Coaches see all, athletes see own only.

2. Get Single Workout

GET /api/workouts/:id

3. Create Workout

POST /api/workouts

Body:

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

5. Delete Workout

DELETE /api/workouts/:id

</details> <details> <summary><strong🎯 Goal Endpoints</strong></summary>
1. Get All Goals

GET /api/goals

2. Get Single Goal

GET /api/goals/:id

3. Create Goal

POST /api/goals

Body:

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

5. Delete Goal

DELETE /api/goals/:id

</details>
Error Handling
Status Code	Meaning
400	Bad Request (missing or invalid fields)
401	Unauthorized (invalid token or no token)
403	Forbidden (insufficient role permissions)
404	Not Found (resource does not exist)
500	Internal Server Error (database or server issue)


## API Documentation

Full API documentation with example requests and responses is available in Postman:

[Sports Training Tracker API Docs](https://documenter.getpostman.com/view/38985313/2sB3dPTWfJ)
