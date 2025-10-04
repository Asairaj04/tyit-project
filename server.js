// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // your MySQL user
  password: '',         // your MySQL password (if any)
  database: 'aggrigator' // database name
});

// Test connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
  } else {
    console.log('Connected to database aggrigator');
  }
});



// Register Patient
app.post('/register_patient', async (req, res) => {
  const { name, address, email, password } = req.body;

  if (!name || !address || !email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds = 10

    const sql = `
      INSERT INTO users (name, address, email, password, rid)
      VALUES (?, ?, ?, ?, ?)
    `;

    // rid = 3 → patient role
    db.query(sql, [name, address, email, hashedPassword, 3], (err, result) => {
      if (err) {
        console.error('Error inserting patient:', err.message);
        return res.status(500).json({ error: 'Failed to register patient' });
      }
      res.json({ message: 'Patient registered successfully!', id: result.insertId });
    });
  } catch (error) {
    console.error("Hashing error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});



//doctor registration


app.post('/register-doctor', async (req, res) => {
  const { name, specialization, email, password } = req.body;

  if (!name || !specialization || !email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    const sql = `
      INSERT INTO users (name, specialization, email, password, rid)
      VALUES (?, ?, ?, ?, ?)
    `;

    // rid = 1 (doctor)
    db.query(sql, [name, specialization, email, hashedPassword, 1], (err, result) => {
      if (err) {
        console.error('Error inserting doctor:', err.message);
        return res.status(500).json({ error: 'Failed to register doctor' });
      }
      res.json({ message: 'Doctor registered successfully!', id: result.insertId });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error hashing password' });
  }
});


//register receptionist


app.post('/register-receptionist', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, rid)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, hashedPassword, 2], (err, result) => {
      if (err) {
        console.error('Error inserting receptionist:', err.message);
        return res.status(500).json({ error: 'Failed to register receptionist' });
      }
      res.json({ message: 'Receptionist registered successfully!', id: result.insertId });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error hashing password' });
  }
});



//login 

// Login route
// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.send('Email and password are required');

//   db.query('SELECT * FROM users WHERE email=? AND password=?',
//     [email, password],
//     (err, results) => {
//       if (err) return res.send('Database error');
//       if (results.length === 0) return res.send('Invalid email or password');

//       res.send({
//         message: 'Login successful',
//         user: { id: results[0].id, name: results[0].name, rid: results[0].rid }
//       });
//     });
// });


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.send('Database error');
    if (results.length === 0) return res.send('Invalid email or password');

    const user = results[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (match) {
        res.send({ message: 'Login successful', user });
      } else {
        res.send('Invalid email or password');
      }
    });
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
