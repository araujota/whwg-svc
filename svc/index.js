const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/speedlesvc.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/speedlesvc.com/fullchain.pem')
}

// Database configuration
const dbConfig = {
    host: 'whwg-db.cjolcvuz7adj.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Cr1mscar!',
    database: 'whwg',
    waitForConnections: true, // Enable waiting for connections in the pool
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0 // Unlimited queueing
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Set up middleware
app.use(cors());
app.use(bodyParser.json());

// Test endpoint
app.get("/", (req, res) => {
    res.json({ message: "ok" });
});

// Endpoint to save score
app.post('/score', (req, res) => {
    const { username, score } = req.body;
    const sql = `INSERT INTO users (username, score) VALUES (?, ?)`;
    pool.query(sql, [username, score], (error, results) => {
        if (error) {
            console.error('Error saving score:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'Score saved successfully' });
        }
    });
});

// Endpoint to retrieve scores
app.get('/scores', (req, res) => {
    const sql = 'SELECT * FROM users ORDER BY score DESC';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving scores:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Keep the process alive
setInterval(() => {
    console.log('Keeping process alive');
}, 1000 * 60 * 30); // Repeat every 30 minutes

// Create an HTTPS server
https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

// Create an HTTP server to redirect to HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80, () => {
    console.log('HTTP Server running on port 80');
  });

// Export the app for testing purposes
module.exports = app;

