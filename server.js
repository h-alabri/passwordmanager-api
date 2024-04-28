require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const credentialRoutes = require('./routes/credentials');
const userRoutes = require('./routes/user');

// Express app
const app = express();

// CORS Configuration
// Ensure the origin matches the URL of your deployed frontend or is open for development.
const corsOptions = {
    origin: process.env.FRONTEND_URL,  // Use environment variable to configure CORS dynamically
    optionsSuccessStatus: 200
};

// Enable CORS with options
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Simple logger to show the methods and paths of requests
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// API routes
app.use('/api/credentials', credentialRoutes);
app.use('/api/user', userRoutes);

// Root route for basic API health check
app.get('/', (req, res) => {
    res.send('Password Manager API is running');
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // Listen for requests on the port provided by the environment
        app.listen(process.env.PORT, () => {
            console.log(`Connected to db & listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

// Default error handler to catch any unhandled errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
