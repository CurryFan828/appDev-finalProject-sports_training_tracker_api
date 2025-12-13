const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { db, User, Workout, Goal } = require('./database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());


// JWT Authentication Middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}


function requireRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden: Only Coaches have permissions' });
        }
        next();
    };
}


// Test DB Connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log("Database connection successful.");
    } catch (error) {
        console.error("Unable to connect to database:", error);
    }
}

testConnection();


// ===== Health Check =====
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Sports Training Tracker API is running.' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Task Management API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            register: 'POST /api/register',
            login: 'POST /api/login',
            tasks: 'GET /api/tasks (requires auth)',
            createTask: 'POST /api/tasks (requires auth)',
            updateTask: 'PUT /api/tasks/:id (requires auth)',
            deleteTask: 'DELETE /api/tasks/:id (requires auth)'
        }
    });
});

// ROUTES


// ===== USER ROUTES =====
// Register new user
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, password, role, height, position } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required.' });
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role,
            height,
            position
        });
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                // password: newUser.password // <-- this is the hashed password
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user.', details: error.message });
    }
});

// Login user
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials.' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.', details: error.message });
    }
});

// Get all users (for coaches/admin)
app.get('/api/users', requireAuth, requireRole('coach'), async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// Get single user
app.get('/api/users/:id', requireAuth, requireRole('coach'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user.' });
    }
});

// Update user
app.put('/api/users/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Authorization check
        if (req.user.role !== 'coach' && req.user.id !== user.id) {
            return res.status(403).json({ error: 'Not allowed to update this user.' });
        }

        const { username, password, role, height, position } = req.body;

        if (password) {
            req.body.password = await bcrypt.hash(password, 10);
        }

        await user.update({
            username,
            password: req.body.password,
            role,
            height,
            position
        });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update user.',
            details: error.message
        });
    }
});


// Delete user
app.delete('/api/users/:id', requireAuth, requireRole('coach'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        await user.destroy();
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});




// ===== WORKOUT ROUTES =====

// Get all workouts
app.get('/api/workouts', requireAuth, async (req, res) => {
    try {
        let workouts;

        // If the logged-in user is a coach, return all workouts
        if (req.user.role === 'coach') {
            workouts = await Workout.findAll({ include: [{ model: User, attributes: ['username', 'role'] }] });
        } else {
            // Otherwise, return only the workouts for the logged-in user
            workouts = await Workout.findAll({ where: { userId: req.user.id } });
        }

        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workouts.' });
    }
});

// Get single workout
app.get('/api/workouts/:id', requireAuth, async (req, res) => {
    try {
        const workout = await Workout.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!workout) return res.status(404).json({ error: 'Workout not found.' });
        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workout.' });
    }
});

// Create workout
app.post('/api/workouts', requireAuth, async (req, res) => {
    try {
        const { username, type, date, duration, notes, shotsMade, reps, sets } = req.body;
        if (!type || !date || !duration) return res.status(400).json({ error: 'Type, date, and duration are required.' });

        const workout = await Workout.create({
            userId: req.user.id,
            username,
            type,
            date,
            duration,
            notes,
            shotsMade,
            reps,
            sets
        });

        res.status(201).json({ message: 'Workout created.', workout });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create workout.', details: error.message });
    }
});

// Update workout
app.put('/api/workouts/:id', requireAuth, async (req, res) => {
    try {
        const workout = await Workout.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!workout) return res.status(404).json({ error: 'Workout not found.' });

        await workout.update(req.body);
        res.json({ message: 'Workout updated.', workout });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workout.', details: error.message });
    }
});

// Delete workout
app.delete('/api/workouts/:id', requireAuth, async (req, res) => {
    try {
        const workout = await Workout.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!workout) return res.status(404).json({ error: 'Workout not found.' });

        await workout.destroy();
        res.json({ message: 'Workout deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workout.' });
    }
});




// ===== GOAL ROUTES =====

// Get all goals
app.get('/api/goals', requireAuth, async (req, res) => {
    try {
        const goals = await Goal.findAll({ where: { userId: req.user.id } });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals.' });
    }
});

// Get single goal
app.get('/api/goals/:id', requireAuth, async (req, res) => {
    try {
        const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!goal) return res.status(404).json({ error: 'Goal not found.' });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goal.' });
    }
});

// Create goal
app.post('/api/goals', requireAuth, async (req, res) => {
    try {
        const { title, targetNumber, deadline, progress } = req.body;
        if (!title || !targetNumber || !deadline) return res.status(400).json({ error: 'Title, target number, and deadline are required.' });

        const goal = await Goal.create({
            userId: req.user.id,
            title,
            targetNumber,
            deadline,
            progress: progress || 0
        });

        res.status(201).json({ message: 'Goal created.', goal });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal.', details: error.message });
    }
});

// Update goal
app.put('/api/goals/:id', requireAuth, async (req, res) => {
    try {
        const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!goal) return res.status(404).json({ error: 'Goal not found.' });

        await goal.update(req.body);
        res.json({ message: 'Goal updated.', goal });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goal.', details: error.message });
    }
});

// Delete goal
app.delete('/api/goals/:id', requireAuth, async (req, res) => {
    try {
        const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!goal) return res.status(404).json({ error: 'Goal not found.' });

        await goal.destroy();
        res.json({ message: 'Goal deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal.' });
    }
});



// ===== Error handling & 404 =====

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', message: `${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});



// Start Server
// db.sync().then(() => {
//     console.log("Database synced!");
//     app.listen(PORT, () => {
//         console.log(`Server running at http://localhost:${PORT}`);
//         console.log(`Health check: http://localhost:${PORT}/health`);
//         console.log(`Environment: ${process.env.NODE_ENV}`);
//     });
// });


// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    db.sync().then(() => {
        console.log("Database synced!");
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    });
}

module.exports = { app, db, User, Workout, Goal }; // <- export for tests