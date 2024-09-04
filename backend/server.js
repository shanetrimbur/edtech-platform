// server.js
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Test Database Connection and Start Server
sequelize.sync({ force: true }).then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});
