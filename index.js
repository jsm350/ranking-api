// server/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const imageRoutes = require('./routes/imageRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// app.use(express.raw({ type: 'multipart/form-data', limit: '10mb' }));

const cors = require('cors');
//routes
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/auth', authRoutes);
app.use('/api', articleRoutes)
app.use('/upload', imageRoutes)
app.use('/distributor', distributorRoutes)

app.get('/', (req, res) => {
    res.json({ message: 'Backend is running' });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
