const express = require("express");
var bodyParser = require("body-parser");
const db = require("./config/db");
const app = express();
require("dotenv").config();
const debug = require('debug')('myapp:server');

const cors = require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.get('/', function(req,res) {
    return res.send("hello from my app express server!")
})

app.post("/api/createUser", (req, res) => {
    const UserId = req.body.UserId;
    const Email = req.body.Email;
    const Joining = req.body.Joining;
    const LastLogin = req.body.LastLogin;
    const UserName = req.body.UserName;
    const DisplayImg = req.body.DisplayImg;
    
  
  
    db.query(
      `insert into UserDetails (UserId,Email,Joining,LastLogin,UserName,DisplayImg) values ('${UserId}', '${Email}', '${Joining}', '${LastLogin}', '${UserName}',  '${DisplayImg}');`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);

        }
        else{
            console.log(result);
            res.send("Succefully added to db");
        }
        
      }
    );
    
  });

app.listen(process.env.PORT || 4000, () => {
    console.log(`Example app listening at http://localhost: 4000`);
  });