// database/seed.js
const bcrypt = require("bcryptjs");
const { db, User, Workout, Goal } = require("./setup");

async function seedDatabase() {
    try {
        console.log("Syncing database...");
        
        // Recreates all tables
        await db.sync({ force: true });
        console.log("✅ Database synced!");

        // SEED USERS
        const users = await User.bulkCreate([
            {
                username: "Isaac",
                password: await bcrypt.hash("password123", 10),
                role: "athlete",
                height: 74,
                position: "Guard"
            },
            {
                username: "Coach Mike",
                password: await bcrypt.hash("password123", 10),
                role: "coach"
            }
        ]);

        console.log("Users seeded!");

        // SEED WORKOUTS
        const workouts = await Workout.bulkCreate([
            {
                userId: users[0].id,
                type: "Shooting",
                date: "2025-02-01",
                duration: 60,
                shotsMade: 350,
                notes: "Focused on jump shot mechanics"
            },
            {
                userId: users[0].id,
                type: "Strength Training",
                date: "2025-02-03",
                duration: 45,
                reps: 10,
                sets: 4,
                notes: "Leg day — heavy squats"
            }
        ]);

        console.log("Workouts seeded!");

        // SEED GOALS
        await Goal.bulkCreate([
            {
                userId: users[0].id,
                title: "Make 5,000 shots",
                targetNumber: 5000,
                deadline: "2025-05-01",
                progress: 350
            },
            {
                userId: users[0].id,
                title: "Increase bench press",
                targetNumber: 225,
                deadline: "2025-04-15",
                progress: 185
            }
        ]);

        console.log("Goals seeded!");

        console.log("Seeding complete!");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
