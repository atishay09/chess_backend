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
            db.query(
                `insert into PlayerStats (UserId,Points,Won, Lose, LastGame, Total, Drawn) values ('${UserId}', '100','0','0','0','0','0' );`,
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
        }
        
      }
    );
    
  });

  app.get("/api/getUserDetails/:UserId", (req, res) => {
    const UserId = req.params.UserId;
    db.query(`SELECT UserDetails.*, PlayerStats.* from UserDetails inner join PlayerStats on PlayerStats.UserId = UserDetails.UserId where UserDetails.UserId = '${UserId}';`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      }
      else{
          console.log(result);
          res.send(result);
      }
    });
})

app.post("/api/createUserStats", (req, res) => {
  const Player1 = req.body.Player1;
  const Player2 = req.body.Player2;
  const UserId = req.body.UserId;
  const TimeStamp = new Date().valueOf();
  const Winner = req.body.Winner;
  const Looser = req.body.Looser;
  const Match = req.body.Match;
  const Drawn = req.body.Drawn;
  const MatchPoints = req.body.MatchPoints; 

  if(Match){
    db.query(
    `insert into Logs (UserId,Logs.Match) values ('${Player1}','${Match}'); `,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          db.query(
            `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${Player1}' and Points - ${MatchPoints} > 0;`,
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(400).send(err.sqlMessage);
        
              }
              else{
                  console.log(result);
              }
              
            }
          );
      }
      
    }
  );
    db.query(
    `insert into Logs (UserId,Logs.Match) values ('${Player2}','${Match}');`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          db.query(
            `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${Player2}' and Points - ${MatchPoints} > 0;`,
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(400).send(err.sqlMessage);
        
              }
              else{
                res.send("Succefully added to db");

                  console.log(result);
              }
              
            }
          );
      }
      
    }
  );
   
  }
  else{
    if(Drawn){
      db.query(
        `insert into Logs (UserId,Logs.Drawn) values ('${Player1}','${Drawn}'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
    
          }
          else{
              console.log(result);
              db.query(
                `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${Player1}' and Points + ${MatchPoints} > 0;`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.status(400).send(err.sqlMessage);
            
                  }
                  else{
                      console.log(result);
                  }
                  
                }
              );
          }
          
        }
      );
        db.query(
        `insert into Logs (UserId,Logs.Drawn) values ('${Player2}','${Drawn}');`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
    
          }
          else{
              console.log(result);
              db.query(
                `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${Player2}' and Points + ${MatchPoints} > 0;`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.status(400).send(err.sqlMessage);
            
                  }
                  else{
                    res.send("Succefully added to db");
    
                      console.log(result);
                  }
                  
                }
              );
          }
          
        }
      );
    }
    else{
      db.query(
      
      `insert into Logs (UserId,Logs.Won) values ('${Winner}','1'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
  
        }
        else{
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${Winner}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
          
                }
                else{
                    console.log(result);
                }
                
              }
            );
        }
        
      }
    );
      db.query(
      `insert into Logs (UserId,Logs.Lose) values ('${Looser}','1');`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
  
        }
        else{
            console.log(result);
            res.send("Updated all stats")
        }
        
      }
    );
    }
    
  }
  
  
});

app.post("/api/createStats", (req, res) => {
  const UserId = req.body.UserId;
  const Status = req.body.Status;  
  const MatchPoints = req.body.MatchPoints; 
  
switch(Status){
  case 'Won':
    db.query(
      `insert into Logs (UserId,Logs.Won) values ('${UserId}','1'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
    
        }
        else{
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${UserId}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
          
                }
                else{
                    console.log(result);
                    res.send("Match Won");
                }
                
              }
            );
        }
        
      }
    );
    break;
  case 'Lose':
    db.query(
      `insert into Logs (UserId,Logs.Lose) values ('${UserId}','1'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
    
        }
        else{
            console.log(result);
            res.send("Match Lose");
        }
        
      }
    );
    break;
  case 'Drawn':
    db.query(
      `insert into Logs (UserId,Logs.Drawn) values ('${UserId}','1'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
    
        }
        else{
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${UserId}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
          
                }
                else{
                    console.log(result);
                    res.send("Match Drawn");
                }
                
              }
            );
        }
        
      }
    );
    break;
  case 'Match':
    db.query(
      `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
    
        }
        else{
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${UserId}' and Points - ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
          
                }
                else{
                    console.log(result);
                    res.send("Match Started");
                }
                
              }
            );
        }
        
      }
    );
    break;
  case 'Join':
    db.query(
      `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
    
        }
        else{
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${UserId}' and Points - ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
          
                }
                else{
                    console.log(result);
                    res.send("Match Joined");
                }
                
              }
            );
        }
        
      }
    );
    break;
  default:
    res.status(400).send("Invalid Query, try 'Match','Join','Drawn','Lose','Won' ")
  
}
 

  
});


app.listen(process.env.PORT || 4000, () => {
    console.log(`Example app listening at http://localhost: 4000`);
  });