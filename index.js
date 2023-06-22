const express = require('express');
const db = require('./db'); // Assuming db.js exports the pool object
const cors = require('cors');
const util = require('util');
const dbQuery = util.promisify(db.query).bind(db);

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send('hw');
  console.log('hscreen')
});


db.query(`
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT,
    phoneNumber TEXT,
    email TEXT,
    dob TEXT,
    message TEXT
  )
`, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Table created successfully');
  }
});

db.query(`CREATE TABLE IF NOT EXISTS golfers (
  phonenumber text NOT NULL,
  golname text NOT NULL,
  pin text NOT NULL,
  PRIMARY KEY (phonenumber)
  )
  `, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Table created successfully');
    }
  });


// Endpoint for handling form submissions
app.post('/api/form', (req, res) => {
  const { name, email, phoneNumber, month, day, year, message } = req.body;
  const dob = `${month}-${day}-${year}`;

  db.query(
    'INSERT INTO patients (name, phoneNumber, email, dob, message) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, phoneNumber, email, dob, message],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit form' });
      } else {
        const patientId = result.rows[0].id;
        res.status(200).json({ message: 'Form submitted successfully', patientId });
        console.log(name, email, phoneNumber, dob, message);
      }
    }
  );
});

// Endpoint for handling phone check
app.post('/api/formnumber', (req, res) => {
  const { number } = req.body;

  db.query('SELECT COUNT(*) as count, id FROM patients WHERE phoneNumber = $1', [number], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to check phone number' });
    } else {
      const row = result.rows[0];
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
  db.query(
    "SELECT * FROM patients WHERE phoneNumber = $1",
    [patientName],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else if (result.rows.length > 0) {
        const row = result.rows[0];
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
  const phoneNumber = req.body.phoneNumber;
  const observations = req.body.message;

  // Update the observations in the database for the specific patient
  db.query(
    "UPDATE patients SET message = $1 WHERE phoneNumber = $2",
    [observations, phoneNumber],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        // Return success response
        res.json({ success: true });
      }
    }
  );
  console.log("Update request received: ", phoneNumber, observations);
});

//this section will deal with golf login


app.post('/api/GolfLoginForm',(req,res)=>{

})

app.post('/api/GolfRegisterForm', (req, res) => {
  const golferName = req.body.golferName;
  const golferNumber = req.body.phoneNumber;
  const golferPin = req.body.pin;

  const insertQuery = `INSERT INTO golfers (phonenumber, golname, pin) VALUES ($1, $2, $3)`;
  const values = [golferNumber, golferName, golferPin];

  db.query(insertQuery, values, (error, result) => {
    if (error) {
      console.error("Error inserting values into table:", error);
      res.sendStatus(500);
    } else {
      console.log(golferName + " " + golferNumber + " " + golferPin);
      res.sendStatus(200);
    }
  });
});




app.get('/api/GolferInfo', async (req, res) => {
  const golferNumber = req.query.golferNumber;
  console.log(golferNumber);

  try {
    // Query the golfers table to fetch golfer data
    const { rows } = await pool.query(
      'SELECT golname FROM golfers WHERE phonenumber = $1',
      [golferNumber]
    );

    if (rows.length === 0) {
      // No golfer found with the provided golferNumber
      res.status(404).json({ error: 'Golfer not found' });
    } else {
      // Golfer data found
      const golferData = rows[0];
      res.json(golferData);
    }
  } catch (error) {
    console.error('Error fetching golfer data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
