const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');




const app = express();
const port =process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
  res.send('hw')
})
// Create a new SQLite database connection
const db = new sqlite3.Database('database.db');
db.run("DROP TABLE IF EXISTS forms");

// Create a table for storing patient data
db.run(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phoneNumber TEXT,
    email TEXT,
    dob TEXT,
    message TEXT
  )
`);


// Endpoint for handling form submissions
app.post('/api/form', (req, res) => {
  const { name, email, phoneNumber, month, day, year, message } = req.body;
  const dob = `${month}-${day}-${year}`;

  db.run(
    'INSERT INTO patients (name, phoneNumber, email, dob, message) VALUES (?, ?, ?, ?, ?)',
    [name, phoneNumber, email, dob, message],
    (err) => {
      if (err) {
        console.error(err);
        res.status(200).json({ error: 'Failed to submit form' });
      } else {
        res.status(200).json({ message: 'Form submitted successfully' });
        console.log(name, email, phoneNumber, dob, message);
      }
    }
  );
});


// Endpoint for handling phone check
app.post('/api/formnumber', (req, res) => {
  const { number } = req.body;

  db.get('SELECT COUNT(*) as count, id FROM patients WHERE phoneNumber = ?', [number], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to check phone number' });
    } else {
      if (row.count > 0) {
        res.status(200).json({ info: 'yes', pnumber: row.id });
        
      } else {
        res.status(200).json({ info: 'Failed to submit form' });
      }
    }
  });
});




// Define a route to fetch patient data based on name
app.get("/api/patientData", (req, res) => {
  const patientName = req.query.name;

  // Query the database based on the patient name
  db.get(
    "SELECT * FROM patients WHERE phoneNumber = ?",
    [patientName],
    (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else if (row) {
        // Return the patient data if found
        res.json({
          name: row.name,
          phoneNumber: row.phoneNumber,
          email: row.email,
          message: row.message,
        });
      } else {
        // Return an error if the patient is not found
        res.status(404).json({ error: "Patient not found" });
      }
    }
  );
});

// Define a route to update observations for a patient
app.put("/api/updateObservations", (req, res) => {
  const observations = req.body.message;

  // Update the observations in the database for the patient
  db.run(
    "UPDATE patients SET message = ?",
    [observations],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        // Return success response
        res.json({ success: true });
      }
    }
  );
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
