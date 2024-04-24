const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
var mysql = require('mysql2');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'Cr1mscar!',
  database : 'whwg'
})

app.use(cors())
app.use(bodyParser.json());

connection.connect((err => {
    if (err) throw err;
    console.log('MySQL Connected');
}
))

app.listen(8080, () => {
      console.log('server listening on port 8080')
})

app.get("/", (req, res) => {
    res.json({ message: "ok" });
  });

app.post('/score', (req, res) => {
    console.log('req', req.body)

    let sql = `INSERT INTO users (username, score) VALUES ('${req.body.username}', ${req.body.score})`;
    console.log(sql)
    connection.query(sql, (error, results) => {
        if (error) throw error;
        res.send(results)
      });
})

app.get('/scores', (req, res) => {
    let sql = 'SELECT * FROM users ORDER BY score DESC';
    connection.query(sql, (error, results) => {
        if (error) throw error;
        console.log('test', results)
        res.send(results)
      });
})