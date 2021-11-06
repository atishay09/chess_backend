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

const path = require('path');
const multer = require('multer');
const logger = require('morgan');
const serveIndex = require('serve-index')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

//will be using this for uplading
const upload = multer({ storage: storage });

//get the router

app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(express.static('public'));
app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));

app.get('/', function(req,res) {
    return res.send("hello from my app express server!")
})

app.post('/userDPUpload', upload.single('file'), function(req,res) {
    debug(req.file);
    console.log('storage location is ', req.hostname +'/' + req.file.path);
    return res.send(req.file);
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

app.post("/api/createTournament", (req, res) => {
  const T_Id = req.body.T_Id;
  const T_Name = req.body.T_Name;
  const TotalPoints = req.body.TotalPoints;
  const TotalGames = req.body.TotalGames;
  const Description = req.body.Description;
  const T_img = req.body.T_img;
  const Status = req.body.Status;
  const T_Fee = req.body.T_Fee;
  const Max_Players = req.body.Max_Players;

  


  db.query(
    `insert into Tournaments (T_Id,T_Name,TotalPoints,TotalGames,Description,T_img,Status,T_Fee,Max_Players) values ('${T_Id}', '${T_Name}', '${TotalPoints}', '${TotalGames}', '${Description}',  '${T_img}','${Status}', '${T_Fee}', ${Max_Players});`,
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

app.get("/api/getAllTournament", (req, res) => {
  
  db.query(`SELECT * FROM Chess.Tournaments;`, (err, result) => {
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

app.post("/api/createTournamentPlayers", (req, res) => {
  const UserId = req.body.UserId;
  const T_id = req.body.T_id;
  const Timestamp = req.body.Timestamp;
  const T_Points = req.body.T_Points;
  const MatchesWon = req.body.MatchesWon;
  const MatchesLoss = req.body.MatchesLoss;
  const MatchesDrawn = req.body.MatchesDrawn;
  const TotalMatches = req.body.TotalMatches;

  


  db.query(
    `insert into T_Players (UserId,T_id,Timestamp,T_Points,MatchesWon,MatchesLoss,MatchesDrawn,TotalMatches) values ('${UserId}', '${T_id}', '${Timestamp}', '${T_Points}', '${MatchesWon}',  '${MatchesLoss}','${MatchesDrawn}', '${TotalMatches}');`,
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

app.get("/api/getRoomId", (req, res) => {
  const Timestamp =new Date().valueOf();

  


  db.query(
    `insert into emp ( timestamp) value("${Timestamp}");`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          db.query(`select gno from emp where timestamp = "${Timestamp}";`, (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send(err.sqlMessage);
            }
            else{
                console.log(result);
                res.send(result);
            }
          });
      }
      
    }
  );
  
});
app.get("/api/getTournamentByAuth/:UserId", (req, res) => {
  const UserId = req.params.UserId;
  db.query(
    `SELECT * , case when exists( SELECT * FROM T_Players WHERE UserId = '${UserId}' and T_Id = Tournaments.T_Id ) then 'True' else 'False' end as isPresent, (select count(*) from T_Players where T_Players.T_Id = Tournaments.T_Id) as count, case when (select count(*) from T_Players where T_Players.T_Id = Tournaments.T_Id) >= Max_Players then "true" else "false" end as Max_Reached FROM Chess.Tournaments;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          res.send(result);
      }
      
    }
  );
  
});
app.post("/api/DeleteTPlayers", (req, res) => {
  const T_Id = req.body.T_Id;
  const UserId = req.body.UserId;

  


  db.query(
    `delete from T_Players where T_Id = "${T_Id}" and UserId = "${UserId}";`,
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
app.get("/api/getUserTournament/:UserId", (req, res) => {
  const UserId = req.params.UserId;
  db.query(
    `SELECT T_Players.*, Tournaments.* FROM Chess.T_Players inner join Tournaments on Tournaments.T_Id = T_Players.T_Id where UserId="${UserId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          res.send(result);
      }
      
    }
  );
  
});
app.get("/api/getTournamentPlayers/:T_Id", (req, res) => {
  const T_Id = req.params.T_Id;
  db.query(
    `SELECT * FROM Chess.T_Players where T_Id = "${T_Id}" and inMatch = "0";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          res.send(result);
      }
      
    }
  );
  
});
app.post("/api/createTournamentStats", (req, res) => {
  const UserId = req.body.UserId;
  const T_Id = req.body.T_Id;
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
              `update T_Players set T_Points = T_Points + ${MatchPoints}, inMatch = '0' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points + ${MatchPoints} > 0;`,
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
            db.query(
              `update T_Players set inMatch = '0' where UserId = '${UserId}' and T_Id = "${T_Id}";`,
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
              `update T_Players set T_Points = T_Points + ${MatchPoints}, inMatch = '0' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points + ${MatchPoints} > 0;`,
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
              `update T_Players set T_Points = T_Points - ${MatchPoints},T_Players.TotalMatches = T_Players.TotalMatches + 1, inMatch = '1' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points - ${MatchPoints} > 0;`,
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
              `update T_Players set T_Points = T_Points - ${MatchPoints},T_Players.TotalMatches = T_Players.TotalMatches + 1, inMatch = '1' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points - ${MatchPoints} > 0;`,
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
app.get("/api/getPlayersRank", (req, res) => {
  const T_Id = req.params.T_Id;
  db.query(
    `SELECT PlayerStats.*, UserDetails.*, rank() OVER ( order by Points desc ) AS 'dense_rank' FROM Chess.PlayerStats inner join UserDetails on UserDetails.UserId = PlayerStats.UserId;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          res.send(result);
      }
      
    }
  );
  
});
app.post("/api/UpdateUserDetails", (req, res) => {
  const UserName = req.body.UserName;
  const DisplayImg = req.body.DisplayImg;
  const Phone = req.body.Phone;
  const UserId = req.body.UserId;

  

if(UserName && DisplayImg && Phone && UserId){
  db.query(
    `update UserDetails set UserName = "${UserName}", DisplayImg ="${DisplayImg}", Phone = "${Phone}"  where UserId = "${UserId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      }
      else{
          console.log(result);
          if(result.affectedRows === 0){
            res.status(400).send(result.message);
          }
          else{
            res.send("Succefully added to db");
          }
          
      }
      
    }
  );
}
else{
  res.status(400).send("Some fields missing");
}
  
  
});
app.get("/api/getUserDetailsWithRank/:UserId", (req, res) => {
  const UserId = req.params.UserId;
  db.query(
    `SELECT UserDetails.*, RankTable.* FROM Chess.UserDetails inner join (SELECT UserId, rank() OVER ( order by Points desc ) AS 'rank' FROM Chess.PlayerStats) as RankTable on RankTable.UserId = UserDetails.UserId where UserDetails.UserId = '${UserId}';`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          res.send(result);
      }
      
    }
  );
  
});
app.get("/api/getTournamentRanking/:T_Id", (req, res) => {
  const T_Id = req.params.T_Id;
  db.query(
    `SELECT T_Players.*, UserDetails.*  FROM Chess.T_Players inner join UserDetails on UserDetails.UserId = T_Players.UserId where T_Players.T_Id = "${T_Id}" order by T_Points desc;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          console.log(result);
          res.send(result);
      }
      
    }
  );
  
});

app.get("/api/allSync_CMS", (req, res) => {
  const T_Id = req.params.T_Id;
  var DailyChallenge;
  var HomePageCMS;
  var TournamentCMS;
  var PlayOnlineCMS;
  var ProfileCMS;
  var finalRes = {};
  db.query(
    `SELECT * FROM Chess.DailyChallengesCMS;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          DailyChallenge = result;
          console.log("Done");
          finalRes['DailyChallenge'] = result;

      }
      
    }
  );
  db.query(
    `SELECT * FROM Chess.TournamentCMS;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          DailyChallenge = result;
          console.log("Done");
          finalRes['TournamentCMS'] = result;

      }
      
    }
  );
  db.query(
    `SELECT * FROM Chess.PlayOnlineCMS;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          DailyChallenge = result;
          console.log("Done");
          finalRes['PlayOnlineCMS'] = result;

      }
      
    }
  );
  db.query(
    `SELECT * FROM Chess.ProfileCMS;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          DailyChallenge = result;
          console.log("Done");
          finalRes['ProfileCMS'] = result;

      }
      
    }
  );
  db.query(
    `SELECT * FROM Chess.HomePageCMS;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);

      }
      else{
          HomePageCMS = result;
          console.log("Done here too");
          finalRes['HomePageCMS'] = result;
          console.log(finalRes);
          res.send(finalRes);

      }
      
    }
  );
  
  
  
});

app.listen(process.env.PORT || 4000, () => {
    console.log(`Example app listening at http://localhost: 4000`);
  });