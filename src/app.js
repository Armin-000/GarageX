require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const carsRouter = require('./routes/cars');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/cars', carsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});
