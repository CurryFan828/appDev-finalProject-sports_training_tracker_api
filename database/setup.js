const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create a new SQLite database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/${process.env.DB_NAME}` || 'training.db',
    logging: false, // turn off logs to keep terminal clean
});


// USER MODEL
const User = db.define("User", {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,       // no duplicate usernames
        validate: {
            len: [3, 30]     // simple validation
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [["athlete", "coach"]]   // only these two allowed
        }
    },
    height: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    position: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// WORKOUT MODEL
const Workout = db.define("Workout", {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,  // minutes
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shotsMade: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reps: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sets: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

// GOAL MODEL
const Goal = db.define("Goal", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// MODEL RELATIONSHIPS

// A User has many workouts
User.hasMany(Workout, { foreignKey: "userId" });
Workout.belongsTo(User, { foreignKey: "userId" });

// A User has many goals
User.hasMany(Goal, { foreignKey: "userId" });
Goal.belongsTo(User, { foreignKey: "userId" });

// SYNC DATABASE (build tables)
async function initializeDatabase() {
    try {
        await db.sync({ force: true }); // drops and recreates tables
        console.log("Database synced successfully.");
    } catch (error) {
        console.error("Error syncing the database:", error);
    }
}

// Only run setup if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

// Export for use in server.js and seed.js
module.exports = {
    db,
    User,
    Workout,
    Goal
};