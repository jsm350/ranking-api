// server/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
app.use(express.json());

const cors = require('cors');
//routes
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/auth', authRoutes);
app.use('/api',articleRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'Backend is running' });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
