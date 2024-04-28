require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const credentialRoutes = require('./routes/credentials');
const userRoutes = require('./routes/user');

// Express app
const app = express();

// CORS Configuration: Adjust the origin to match your frontend's URL.
const corsOptions = {
    origin: process.env.FRONTEND_URL,  // Ensure this is set in your environment variables on Render
    optionsSuccessStatus: 200
};

// Enable CORS with options
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Routes
app.use('/api/credentials', credentialRoutes);
app.use('/api/user', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // Listen for requests only after the database connection is successful
        app.listen(process.env.PORT || 4000, () => {
            console.log(`Connected to db & listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

// Default error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
