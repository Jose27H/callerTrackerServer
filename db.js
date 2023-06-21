// In db.js
const { Pool } = require("pg");

// The secret connection string you copied earlier
const connectionString =
  "postgresql://postgres:dTW4wBJonEfs61LnQDGz@containers-us-west-190.railway.app:7409/railway";

const pool = new Pool({
  connectionString,
});

module.exports = pool;