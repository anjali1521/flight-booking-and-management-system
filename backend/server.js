const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csvParser = require('csv-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let flightsData = [];
function loadFlightsData() {
  flightsData = [];
  fs.createReadStream('./flights_extended.csv')
  .pipe(csvParser({
    mapHeaders: ({ header }) => header.trim(),    // Trim spaces around header names
    mapValues: ({ value }) => value.trim(),       // Trim spaces around each cell value
  }))
  .on('data', row => {
    row.Price = parseInt(row.Price, 10);          // Convert Price to number
    flightsData.push(row);
  })
  .on('end', () => {
    console.log('Headers:', Object.keys(flightsData[0]));
    console.log('Sample row:', flightsData[0]);
    console.log('Flight data loaded successfully.');
  });
    // .on('end', () => console.log('Flight data loaded successfully.'));
}

loadFlightsData();

function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right].Price;
  let i = left;
  for (let j = left; j < right; j++) {
    if (arr[j].Price < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

app.get('/api/flights', (req, res) => {
  const flights = quickSort([...flightsData]);
  res.json(flights);
});

let bookings = [];
app.post('/api/book', (req, res) => {
  const { flightNumber, origin, destination, date, passengers, price } = req.body;
  if (!flightNumber || !origin || !destination || !date || !passengers || !price) {
    return res.status(400).json({ error: 'Missing booking info' });
  }
  bookings.push({ id: bookings.length + 1, flightNumber, origin, destination, date, passengers, price });
  res.json({ message: 'Booking successful!', bookingId: bookings.length });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));