const mysql = require('mysql2');
require('dotenv').config({path: '../.env'});


console.log("db access", process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;