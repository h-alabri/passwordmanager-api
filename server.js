const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const credentialRoutes = require('./routes/credentials');
const userRoutes = require('./routes/user');

// express app
const app = express();

// middleware
app.use(express.json());
app.use(cors()); // Add this line to enable CORS for all routes

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use('/api/credentials', credentialRoutes);
app.use('/api/user', userRoutes);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
