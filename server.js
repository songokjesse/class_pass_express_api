const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});

module.exports = app;