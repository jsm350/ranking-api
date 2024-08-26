// server/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
app.use(express.json());

//routes
app.use('/auth', authRoutes);
app.use('/api',articleRoutes)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
