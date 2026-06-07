const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser'); // Week 5 Add
const csrf = require('csurf'); // Week 5 Add

const app = express();

// Parsing incoming body mechanisms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Required for handling CSRF tokens

// Task 3: Security Headers Implementation
app.use(helmet());

// Task 2: CORS Configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Task 2: Rate Limiting Implementation
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
app.use('/api/', apiLimiter);

// =========================================================
// WEEK 5 NEW TASKS IMPLEMENTATION
// =========================================================

// Week 5 Task 2: SQL Injection Testing Route (Insecure Raw Concatenation)
app.get('/api/search', (req, res) => {
    const userQuery = req.query.q;
    // Simulate insecure raw query concatenation for SQLMap validation
    const sqlQuery = `SELECT * FROM items WHERE name = '${userQuery}'`;
    
    res.json({
        status: "Testing SQLi",
        executedQuery: sqlQuery,
        message: "Parameters evaluated under raw execution framework."
    });
});

// Week 5 Task 3: CSRF Protection Middleware Setup
const csrfProtection = csrf({ cookie: true });

// Endpoint to fetch valid anti-CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Protected state-changing route requiring CSRF token validation
app.post('/api/update-settings', csrfProtection, (req, res) => {
    res.json({
        status: "Success",
        message: "State-changing POST action cleared cryptographic validation!"
    });
});
// =========================================================

// Simple Secure Route for testing
app.get('/api/dashboard', (req, res) => {
    res.json({
        status: "Success",
        message: "Welcome to the secured API dashboard!"
    });
});

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Secure Server is running on port ${PORT}`));
