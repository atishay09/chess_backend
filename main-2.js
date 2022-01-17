var mysql = require('mysql');
const db = mysql.createConnection({
    host: "chess-be.ctwicvo7fb5e.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: process.env.PASS,
    database:"Chess" 
    })

connection.connect();

connection.query('SELECT * from Chess', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();