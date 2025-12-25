const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db');

// helper za sigurno sortiranje
const ALLOWED_SORT = new Set(['created_at', 'price', 'year', 'mileage']);

router.get('/', async (req, res) => {
  const { q, status, sortBy, sortDir } = req.query;

  let sql = 'SELECT * FROM cars';
  const params = [];
  const where = [];

  if (q) {
    where.push('(make LIKE ? OR model LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like);
  }

  if (status && ['available', 'reserved', 'sold'].includes(status)) {
    where.push('status = ?');
    params.push(status);
  }

  if (where.length > 0) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  let orderCol = 'created_at';
  if (sortBy && ALLOWED_SORT.has(sortBy)) {
    orderCol = sortBy;
  }

  let dir = 'DESC';
  if (sortDir && (sortDir.toUpperCase() === 'ASC' || sortDir.toUpperCase() === 'DESC')) {
    dir = sortDir.toUpperCase();
  }

  sql += ` ORDER BY ${orderCol} ${dir}`;

  try {
    const rows = await all(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ message: 'Error fetching cars' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const car = await get('SELECT * FROM cars WHERE id = ?', [id]);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    console.error('Error fetching car:', err);
    res.status(500).json({ message: 'Error fetching car' });
  }
});

router.post('/', async (req, res) => {
  const {
    make,
    model,
    year,
    price,
    mileage,
    fuel_type,
    transmission,
    status
  } = req.body;

  if (!make || !model || !year || !price) {
    return res
      .status(400)
      .json({ message: 'make, model, year i price su obavezni' });
  }

  const safeStatus = ['available', 'reserved', 'sold'].includes(status)
    ? status
    : 'available';

  try {
    const result = await run(
      `INSERT INTO cars
        (make, model, year, price, mileage, fuel_type, transmission, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        make,
        model,
        year,
        price,
        mileage || null,
        fuel_type || null,
        transmission || null,
        safeStatus
      ]
    );

    const newCar = await get('SELECT * FROM cars WHERE id = ?', [
      result.lastID
    ]);

    res.status(201).json(newCar);
  } catch (err) {
    console.error('Error creating car:', err);
    res.status(500).json({ message: 'Error creating car' });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const {
    make,
    model,
    year,
    price,
    mileage,
    fuel_type,
    transmission,
    status
  } = req.body;

  try {
    const existing = await get('SELECT * FROM cars WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const newMake = make || existing.make;
    const newModel = model || existing.model;
    const newYear = year || existing.year;
    const newPrice = price || existing.price;
    const newMileage =
      typeof mileage === 'number' ? mileage : existing.mileage;
    const newFuel = fuel_type || existing.fuel_type;
    const newTrans = transmission || existing.transmission;
    const newStatus = ['available', 'reserved', 'sold'].includes(status)
      ? status
      : existing.status;

    await run(
      `UPDATE cars
       SET make = ?, model = ?, year = ?, price = ?, mileage = ?,
           fuel_type = ?, transmission = ?, status = ?
       WHERE id = ?`,
      [
        newMake,
        newModel,
        newYear,
        newPrice,
        newMileage,
        newFuel,
        newTrans,
        newStatus,
        id
      ]
    );

    const updated = await get('SELECT * FROM cars WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating car:', err);
    res.status(500).json({ message: 'Error updating car' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const existing = await get('SELECT * FROM cars WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await run('DELETE FROM cars WHERE id = ?', [id]);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).json({ message: 'Error deleting car' });
  }
});

module.exports = router;
