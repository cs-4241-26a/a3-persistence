const express = require("express");
const session = require("express-session");
const { ObjectId } = require("mongodb");
const { connectDB, getDB } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));

// Helper functions
const getDayOfWeek = function(dateString) {
    const dateParts = dateString.split("/");

    if (dateParts.length !== 3) {
        return null;
    }

    const month = parseInt(dateParts[0], 10);
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    return days[date.getDay()];
};


// Return entries belonging to the logged-in user.
const getUserEntries = async function(username) {
    const db = getDB();

    return await db.collection("entries")
        .find({ user: username })
        .sort({ date: 1 })
        .toArray();
};

// GET /data
app.get("/data", async (req, res) => {
    if (!req.session.username) {
        return res.json({
            entries: []
        });
    }

    try {
        const entries = await getUserEntries(req.session.username);

        res.json({
            entries: entries
        });
    } catch (error) {
        console.error("Error loading data:", error);

        res.status(500).json({
            error: "Unable to load data."
        });
    }
});

// POST /login
app.post("/login", async (req, res) => {
    const username = req.body.user?.trim();
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required."
        });
    }

    try {
        const db = getDB();
        const users = db.collection("users");

        const user = await users.findOne({
            username: username
        });

        // User doesn't exist → create a new account
        if (!user) {
            await users.insertOne({
                username: username,
                password: password
            });
        }

        // User exists → check password
        else if (user.password !== password) {
            return res.status(401).json({
                error: "Incorrect username or password."
            });
        }

        // Authentication succeeded
        req.session.username = username;

        const entries = await getUserEntries(username);

        res.json({
            success: true,
            user: username,
            entries: entries
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            error: "Unable to log in."
        });
    }
});

// POST /logout
app.post("/logout", function(req, res) {
    req.session.destroy(function(error) {

        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                success: false,
                error: "Unable to log out."
            });
        }

        res.json({
            success: true,
            user: null,
            entries: []
        });
    });
});

// POST /submit
app.post("/submit", async function(req, res) {
    try {
        if (!req.session.username) {
            return res.status(401).json({
                success: false,
                error: "No user is logged in"
            });
        }

        const username = req.session.username;

        const {
            date,
            time,
            clockIn
        } = req.body;

        if (!date || !time || clockIn === undefined) {
            return res.status(400).json({
                success: false,
                error: "Date, time, and clock-in status are required"
            });
        }

        const day = getDayOfWeek(date);

        if (day === null) {
            return res.status(400).json({
                success: false,
                error: "Invalid date"
            });
        }

        const newEntry = {
            user: username,
            clockIn: Boolean(clockIn),
            date: date,
            day: day,
            time: time
        };

        const db = getDB();

        await db.collection("entries").insertOne(newEntry);

        console.log("New entry:", newEntry);

        const entries = await getUserEntries(username);

        res.json({
            success: true,
            user: username,
            entries: entries
        });

    } catch (error) {
        console.error("Submit error:", error);

        res.status(500).json({
            success: false,
            error: "Unable to save time entry."
        });
    }
});

// POST /edit
app.post("/edit", async function(req, res) {
    try {
        if (!req.session.username) {
            return res.status(401).json({
                success: false,
                error: "No user is logged in"
            });
        }

        const username = req.session.username;

        if (
            !req.body.id ||
            !req.body.date ||
            !req.body.time ||
            req.body.clockIn === undefined
        ) {
            return res.status(400).json({
                success: false,
                error: "ID, date, time, and clock-in status are required"
            });
        }

        const day = getDayOfWeek(req.body.date);

        if (day === null) {
            return res.status(400).json({
                success: false,
                error: "Invalid date"
            });
        }

        const db = getDB();

        const result = await db.collection("entries").updateOne(
            {
                _id: new ObjectId(req.body.id),
                user: username
            },
            {
                $set: {
                    date: req.body.date,
                    day: day,
                    time: req.body.time,
                    clockIn: Boolean(req.body.clockIn)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: "Entry not found"
            });
        }

        const entries = await getUserEntries(username);

        res.json({
            success: true,
            user: username,
            entries: entries
        });

    } catch (error) {
        console.error("Edit error:", error);

        res.status(500).json({
            success: false,
            error: "Unable to edit entry."
        });
    }
});

// DELETE /data/:id
app.delete("/data/:id", async function(req, res) {
    try {
        if (!req.session.username) {
            return res.status(401).json({
                success: false,
                error: "No user is logged in"
            });
        }

        const username = req.session.username;

        const db = getDB();

        const result = await db.collection("entries").deleteOne({
            _id: new ObjectId(req.params.id),
            user: username
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: "Entry not found"
            });
        }

        const entries = await getUserEntries(username);

        res.json({
            success: true,
            user: username,
            entries: entries
        });

    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            success: false,
            error: "Unable to delete entry."
        });
    }
});

// Start server
const startServer = async function() {
    try {
        await connectDB();

        app.listen(PORT, function() {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Unable to connect to MongoDB:", error);
        process.exit(1);
    }
};

startServer();