const mysql = require('mysql')
require("dotenv").config()


const db = mysql.createConnection({
host: "chess-be.ctwicvo7fb5e.ap-south-1.rds.amazonaws.com",
user: "admin",
password: "ChessBE123",
database:"Chess" 
})

module.exports = db;