const express = require("express");
var bodyParser = require("body-parser");
const db = require("./config/db");
const app = express();
require("dotenv").config();
const debug = require("debug")("myapp:server");

const cors = require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const nodemailer = require("nodemailer")
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const path = require("path");
const multer = require("multer");
const logger = require("morgan");
const serveIndex = require("serve-index");

const auth = require("./middleware/auth");



var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//will be using this for uplading
const upload = multer({ storage: storage });

//get the router

app.use(logger("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(express.static('public'));
app.use(
  "/ftp",
  express.static("public"),
  serveIndex("public", { icons: true })
);

app.get("/", function (req, res) {
  return res.send("hello from my app express server!");
});

app.post("/userDPUpload", upload.single("file"), function (req, res) {
  debug(req.file);
  console.log("storage location is ", req.hostname + "/" + req.file.path);
  return res.send(req.file);
});

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
      } else {
        console.log(result);
        db.query(
          `insert into PlayerStats (UserId,Points,Won, Lose, LastGame, Total, Drawn) values ('${UserId}', '100','0','0','0','0','0' );`,
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send(err.sqlMessage);
            } else {
              console.log(result);
              res.send("Succefully added to db");
            }
          }
        );
      }
    }
  );
});



app.get("/api/getUserDetails/:UserId", auth, (req, res) => {
  const UserId = req.query.UserId;

db.query(
    `SELECT UserDetails.*, PlayerStats.* from UserDetails inner join PlayerStats on PlayerStats.UserId = UserDetails.UserId where UserDetails.UserId = '${req.user.user_id}';`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        res.send(result);
      }
    }
  );
 
  
});

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

  if (Match) {
    db.query(
      `insert into Logs (UserId,Logs.Match) values ('${Player1}','${Match}'); `,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          db.query(
            `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${Player1}' and Points - ${MatchPoints} > 0;`,
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(400).send(err.sqlMessage);
              } else {
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
        } else {
          console.log(result);
          db.query(
            `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${Player2}' and Points - ${MatchPoints} > 0;`,
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(400).send(err.sqlMessage);
              } else {
                res.send("Succefully added to db");

                console.log(result);
              }
            }
          );
        }
      }
    );
  } else {
    if (Drawn) {
      db.query(
        `insert into Logs (UserId,Logs.Drawn) values ('${Player1}','${Drawn}'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${Player1}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
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
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${Player2}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  res.send("Succefully added to db");

                  console.log(result);
                }
              }
            );
          }
        }
      );
    } else {
      db.query(
        `insert into Logs (UserId,Logs.Won) values ('${Winner}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${Winner}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
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
          } else {
            console.log(result);
            res.send("Updated all stats");
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
  const TimeStamp = new Date().valueOf();

  switch (Status) {
    case "Won":
      db.query(
        `insert into Logs (UserId,Logs.Won) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${UserId}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Won");
                }
              }
            );
          }
        }
      );
      break;
    case "spinwin":
      db.query(
        `insert into Logs (UserId,Logs.SpinWin,TimeStamp) values ('${UserId}','1','${TimeStamp}'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${UserId}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Spin Win done");
                }
              }
            );
          }
        }
      );
      break;
    case "Lose":
      db.query(
        `insert into Logs (UserId,Logs.Lose) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            res.send("Match Lose");
          }
        }
      );
      break;
    case "Drawn":
      db.query(
        `insert into Logs (UserId,Logs.Drawn) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points + ${MatchPoints} where UserId = '${UserId}' and Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Drawn");
                }
              }
            );
          }
        }
      );
      break;
    case "Match":
      db.query(
        `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${UserId}' and Points - ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Started");
                }
              }
            );
          }
        }
      );
      break;
    case "Join":
      db.query(
        `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update PlayerStats set Points = Points - ${MatchPoints} where UserId = '${UserId}' and Points - ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
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
      res
        .status(400)
        .send(
          "Invalid Query, try 'Match','Join','Drawn','Lose','Won','spinwin' "
        );
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
      } else {
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
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

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
      } else {
        console.log(result);
        db.query(
          `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send(err.sqlMessage);
            } else {
              console.log(result);
              db.query(
                `update PlayerStats set Points = Points - ${T_Points} where UserId = '${UserId}' and Points - ${T_Points} > 0;`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.status(400).send(err.sqlMessage);
                  } else {
                    console.log(result);
                    res.send("Match Joined");
                  }
                }
              );
            }
          }
        );
      }
    }
  );
  
});

app.get("/api/getRoomId", (req, res) => {
  const Timestamp = new Date().valueOf();

  db.query(
    `insert into emp ( timestamp) value("${Timestamp}");`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        console.log(result);
        db.query(
          `select gno from emp where timestamp = "${Timestamp}";`,
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send(err.sqlMessage);
            } else {
              console.log(result);
              res.send(result);
            }
          }
        );
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
      } else {
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
      } else {
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
      } else {
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
      } else {
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
  const Timestamp = new Date().valueOf();
  const ReqTimeStamp = req.body.ReqTimeStamp;
  const T = req.body.T;

  switch (Status) {
    case "Won":
      db.query(
        `insert into Logs (UserId,Logs.Won) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update T_Players set T_Points = T_Points + ${MatchPoints}, inMatch = '0' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Won");
                }
              }
            );
          }
        }
      );
      break;
    case "Lose":
      db.query(
        `insert into Logs (UserId,Logs.Lose) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update T_Players set inMatch = '0' where UserId = '${UserId}' and T_Id = "${T_Id}";`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Lose");
                }
              }
            );
          }
        }
      );
      break;
    case "Drawn":
      db.query(
        `insert into Logs (UserId,Logs.Drawn) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update T_Players set T_Points = T_Points + ${MatchPoints}, inMatch = '0' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points + ${MatchPoints} > 0;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Drawn");
                }
              }
            );
          }
        }
      );
      break;
    case "Match":
      db.query(
        `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            console.log(`update T_Players set T_Points = T_Points - ${MatchPoints},T_Players.TotalMatches = T_Players.TotalMatches + 1, inMatch = '1' where UserId = '${UserId}' and T_Id = "${T_Id}" and T_Points - ${MatchPoints} > 0;`);
            db.query(
              `update T_Players set T_Players.TotalMatches = T_Players.TotalMatches + 1, inMatch = '1' where UserId = '${UserId}' and T_Id = "${T_Id}" ;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  res.send("Match Started hello");
                }
              }
            );

            db.query(
              `insert into Requests (UserId,TimeStamp, T_Id, Status) values ('${reqUserId}','${Timestamp}','${T_Id}','Join Request');`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                }
              }
            );
          }
        }
      );
      break;
    case "Join":
      db.query(
        `insert into Logs (UserId,Logs.Match) values ('${UserId}','1'); `,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            db.query(
              `update T_Players set T_Players.TotalMatches = T_Players.TotalMatches + 1, inMatch = '1' where UserId = '${UserId}' and T_Id = "${T_Id}" ;`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  if(result.affectedRows === 0){
                    res.status(400).send("No rows found");
                  }
                  else{
                       res.send("Match Joined");
                  }
                }
              }
            );
            db.query(
              `delete from Requests where UserId = "${UserId}" and T_Id = "${T_Id}";`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                }
              }
            );
          }
        }
      );
      break;
    case "Decline":
      db.query(
        `delete from Requests where UserId = "${UserId}" and T_Id = "${T_Id}" and TimeStamp = "${ReqTimeStamp}";`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            if(result.affectedRows === 0){
              res.status(400).send("No rows found");
            }
            else{
                 res.send("Match Declined");
            }
         
          }
        }
      );
      break;
    default:
      res
        .status(400)
        .send(
          "Invalid Query, try 'Match','Join','Drawn','Lose','Won','Decline' "
        );
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
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});
app.get("/api/getRequestStatus/UserId=:UserId/T_Id=:T_Id", (req, res) => {
  const T_Id = req.params.T_Id;
  const UserId = req.params.UserId;
  db.query(
    `SELECT * FROM Chess.Requests where UserId = "${UserId}" and T_Id = "${T_Id}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
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

  if (UserName && DisplayImg && Phone && UserId) {
    db.query(
      `update UserDetails set UserName = "${UserName}", DisplayImg ="${DisplayImg}", Phone = "${Phone}"  where UserId = "${UserId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
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
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/api/getTournamentRanking/:T_Id", (req, res) => {
  const T_Id = req.params.T_Id;
  db.query(
    `SELECT T_Players.*, UserDetails.*, rank() OVER ( order by T_Points desc ) AS 'dense_rank' FROM Chess.T_Players inner join UserDetails on UserDetails.UserId = T_Players.UserId where T_Players.T_Id = "${T_Id}" order by T_Points desc;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});

app.get("/api/allSync_CMS/tenentId=:tenentId", (req, res) => {
  const tenentId = req.params.tenentId;
  var DailyChallenge;
  var HomePageCMS;
  var TournamentCMS;
  var PlayOnlineCMS;
  var ProfileCMS;
  var finalRes = {};
  db.query(
    `SELECT * FROM Chess.DailyChallengesCMS where tenentId = "${tenentId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        DailyChallenge = result;
        console.log("Done");
        finalRes["DailyChallenge"] = result;
      }
    }
  );
  db.query(
    `SELECT * FROM Chess.TournamentCMS where tenentId = "${tenentId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        DailyChallenge = result;
        console.log("Done");
        finalRes["TournamentCMS"] = result;
      }
    }
  );
  db.query(
    `SELECT * FROM Chess.PlayOnlineCMS where tenentId = "${tenentId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        DailyChallenge = result;
        console.log("Done");
        finalRes["PlayOnlineCMS"] = result;
      }
    }
  );
  db.query(
    `SELECT * FROM Chess.ProfileCMS where tenentId = "${tenentId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        DailyChallenge = result;
        console.log("Done");
        finalRes["ProfileCMS"] = result;
      }
    }
  );
  db.query(
    `SELECT * FROM Chess.HomePageCMS where tenentId = "${tenentId}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        HomePageCMS = result;
        console.log("Done here too");
        finalRes["HomePageCMS"] = result;
        console.log(finalRes);
        res.send(finalRes);
      }
    }
  );
});
app.post("/api/DailyChallengeCMS", (req, res) => {
  const scoreLogo = req.body.scoreLogo;
  const textColor = req.body.textColor;
  const bgColor = req.body.bgColor;
  const backgroundImg = req.body.backgroundImg;
  const DailyChallengesCMScol = req.body.DailyChallengesCMScol;
  const tenentId = req.body.tenentId;

  if (
    scoreLogo &&
    textColor &&
    bgColor &&
    tenentId &&
    backgroundImg &&
    DailyChallengesCMScol
  ) {
    db.query(
      `update DailyChallengesCMS set scoreLogo = "${scoreLogo}", DailyChallengesCMScol = "${DailyChallengesCMScol}", backgroundImg = "${backgroundImg}", textColor ="${textColor}", bgColor = "${bgColor}"  where tenentId = "${tenentId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
    res.status(400).send("Some fields missing");
  }
});
app.post("/api/TournamentCMS", (req, res) => {
  const Title = req.body.Title;
  const subHead = req.body.subHead;
  const cardSlug = req.body.cardSlug;
  const backgroundImg = req.body.backgroundImg;
  const scoreIcon = req.body.scoreIcon;
  const prizeImg = req.body.prizeImg;
  const alertBg = req.body.alertBg;
  const tenentId = req.body.tenentId;

  if (Title && subHead && cardSlug && tenentId && backgroundImg && scoreIcon) {
    db.query(
      `update TournamentCMS set Title = "${Title}", prizeImg ="${prizeImg}", alertBg = "${alertBg}", scoreIcon = "${scoreIcon}", backgroundImg = "${backgroundImg}", subHead ="${subHead}", cardSlug = "${cardSlug}"  where tenentId = "${tenentId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
    res.status(400).send("Some fields missing");
  }
});
app.post("/api/PlayOnlineCMS", (req, res) => {
  const bgColor = req.body.bgColor;
  const textColor = req.body.textColor;
  const shareCTA = req.body.shareCTA;
  const backgroundImg = req.body.backgroundImg;
  const createCTA = req.body.createCTA;
  const alertBg = req.body.alertBg;
  const hintCTA = req.body.hintCTA;
  const tenentId = req.body.tenentId;

  if (
    bgColor &&
    textColor &&
    shareCTA &&
    tenentId &&
    backgroundImg &&
    createCTA &&
    alertBg &&
    hintCTA
  ) {
    db.query(
      `update PlayOnlineCMS set bgColor = "${bgColor}", hintCTA ="${hintCTA}", alertBg = "${alertBg}", createCTA = "${createCTA}", backgroundImg = "${backgroundImg}", textColor ="${textColor}", shareCTA = "${shareCTA}"  where tenentId = "${tenentId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
    res.status(400).send("Some fields missing");
  }
});
app.post("/api/ProfileCMS", (req, res) => {
  const bgColor = req.body.bgColor;
  const textColor = req.body.textColor;
  const subBgColor = req.body.subBgColor;
  const backgroundImg = req.body.backgroundImg;
  const logoutCTA = req.body.logoutCTA;
  const leaderBoardImg = req.body.leaderBoardImg;
  const editCTA = req.body.editCTA;
  const defaultDP = req.body.defaultDP;
  const tenentId = req.body.tenentId;

  if (
    bgColor &&
    textColor &&
    subBgColor &&
    tenentId &&
    backgroundImg &&
    logoutCTA &&
    leaderBoardImg &&
    editCTA
  ) {
    db.query(
      `update ProfileCMS set bgColor = "${bgColor}", defaultDP = "${defaultDP}", editCTA ="${editCTA}", leaderBoardImg = "${leaderBoardImg}", logoutCTA = "${logoutCTA}", backgroundImg = "${backgroundImg}", textColor ="${textColor}", subBgColor = "${subBgColor}"  where tenentId = "${tenentId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
    res.status(400).send("Some fields missing");
  }
});
app.post("/api/HomePageCMS", (req, res) => {
  const Logo = req.body.Logo;
  const bgColor = req.body.bgColor;
  const BackgroundImg = req.body.BackgroundImg;
  const bgText = req.body.bgText;
  const loginCTA = req.body.loginCTA;
  const isSync = req.body.isSync;
  const spinValues = req.body.spinValues;
  const tenentId = req.body.tenentId;

  if (
    Logo &&
    bgColor &&
    tenentId &&
    BackgroundImg &&
    bgText &&
    loginCTA &&
    isSync &&
    spinValues
  ) {
    db.query(
      `update HomePageCMS set Logo = "${Logo}", spinValues = "${spinValues}", isSync ="${isSync}", loginCTA = "${loginCTA}", bgText = "${bgText}", BackgroundImg = "${BackgroundImg}", bgColor ="${bgColor}"  where tenentId = "${tenentId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
    res.status(400).send("Some fields missing");
  }
});
app.post("/api/UpdateSpinWin", (req, res) => {
  const Timestamp = req.body.Timestamp;
  const UserId = req.body.UserId;

  if (Timestamp && UserId) {
    db.query(
      `update UserDetails set spinWin = "${Timestamp}" where UserId = "${UserId}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result);
          if (result.affectedRows === 0) {
            res.status(400).send(result.message);
          } else {
            res.send("Succefully added to db");
          }
        }
      }
    );
  } else {
    res.status(400).send("Some fields missing");
  }
});
app.get("/api/getSpinWinHistory/userId=:UserId", (req, res) => {
  const UserId = req.params.UserId;
  db.query(
    `SELECT UserId, Id, SpinWin, timestamp FROM Chess.Logs where UserId = "${UserId}" and SpinWin = 1;`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});
app.post("/api/createPuzzleGames", (req, res) => {
  const GameId = new Date().valueOf();
  const Fen = req.body.Fen;
  const Pgn = req.body.Pgn;

  db.query(
    `insert into Game_collections (GameId,Fen,Pgn) values ('${GameId}', '${Fen}', '${Pgn}');`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        console.log(result);
        res.send("Succefully added to db");
      }
    }
  );
});

async function findOne(email) {
  db.query(
    `SELECT * FROM Chess.UserDetails where Email = "${email}";`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err.sqlMessage);
      } else {
        console.log(result.length);
        if (Array.isArray(result) && result.length) {
          console.log(result);

          return "result";
        } else {
          return null;
        }
      }
    }
  );
}

app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { UserName, Email, password, DisplayImg } = req.body;
    var UserId = Email;
    const TimeStamp = new Date().valueOf();
    UserId = UserId.split('@');
    UserId = UserId[0].concat(TimeStamp)
    console.log(UserId);
   

    // Validate user input
    if (!(Email && password && UserId && UserName && DisplayImg)) {
      res.status(400).send("All input is required");
    } else {
      var encryptedPassword = await bcrypt.hash(password, 10);
      var oldUser = false;
      db.query(
        `SELECT * FROM Chess.UserDetails where Email = "${Email}";`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(Array.isArray(result) && result.length);
            if (Array.isArray(result) && result.length) {
              res.status(409).send("User Already Exist. Please Login");
            } else {
              db.query(
                `insert into UserDetails (UserId,Email,Joining,LastLogin,UserName,DisplayImg,password) values ('${UserId}', '${Email}', '', '', '${UserName}',  '${DisplayImg}',"${encryptedPassword}");`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.status(400).send(err.sqlMessage);
                  } else {
                    console.log(result);
                    db.query(
                      `insert into PlayerStats (UserId,Points,Won, Lose, LastGame, Total, Drawn) values ('${UserId}', '100','0','0','0','0','0' );`,
                      (err, result) => {
                        if (err) {
                          console.log(err);
                          res.status(400).send(err.sqlMessage);
                        } else {
                          console.log(result);
                          res.send("Succefully added to db");
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        }
      );
    }

    // check if user already exist
    // Validate if user exist in our database
    // const oldUser = await findOne( Email );

    //Encrypt user password
    // encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    // const user = await User.create({
    //   first_name,
    //   last_name,
    //   email: email.toLowerCase(), // sanitize: convert email to lowercase
    //   password: encryptedPassword,
    // });

    // Create token
    // const token = jwt.sign(
    //   { user_id: user._id, email },
    //   process.env.TOKEN_KEY,
    //   {
    //     expiresIn: "2h",
    //   }
    // );
    // save user token
    // user.token = token;

    // return new user
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});
// app.post("/googleLogin",(req,res) => {
//   try{
//     //get token from post request
//     var {token} = req.body
//     console.log(token);
//     if(token){
//       //check token
//       const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: CLIENT_ID,
//       });
//       const payload = ticket.getPayload();
//       const Email = payload['email']
//       //query sql for the mail id
//       db.query(
//         `SELECT * FROM Chess.UserDetails where Email = "${Email}";`,
//         (err, result) => {
//           if (err) {
//             console.log(err);
//             res.status(400).send(err.sqlMessage) ;
//           } else {
//             console.log(result.length);
//             if (Array.isArray(result) && result.length) {
//               res.status(200).send(result)
//             } else {
//               res.status(400).send("user not present");
//             }
//           }
//         }
//       );
      
//     }
    
//   } catch (err) {
//     console.log(err);
//   }



// })


app.post("/login", (req, res) => {
  // Our register logic starts here
  // Get user input

  const { Email, password } = req.body;
  // var encryptedPassword = await bcrypt.hash(password, 10);

  // Validate user input
  if (!(Email && password)) {
    res.status(400).send("All input is required");
  } else {
    db.query(
      `SELECT * FROM Chess.UserDetails where Email = "${Email}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage) ;
        } else {
          console.log(result.length);
          if (Array.isArray(result) && result.length) {
            console.log(bcrypt.compareSync(password, result[0]["password"]));
            if(bcrypt.compareSync(password, result[0]["password"])){
              const token = jwt.sign(
                { user_id: result[0]["UserId"], Email },
                process.env.TOKEN_KEY,
                {
                  expiresIn: "48h",
                }
              );
              result[0]["token"] = token;
              res.status(200).send(result);
            }
            else{
              res.status(400).send("incorrect password");
            }
  
            return "result";
          } else {
            res.status(400).send("user not present");
          }
        }
      }
    );
   
  }
  

  // Our register logic ends here
});

app.post("/api/updatePassword",async (req, res) => {
  const otp = req.body.otp;
  const password = req.body.password;
  const Email = req.body.Email;

  if (otp && Email && password) {
    var encryptedPassword = await bcrypt.hash(password, 10);
    db.query(
      `SELECT * FROM Chess.UserDetails where Email="${Email}";`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send(err.sqlMessage);
        } else {
          console.log(result[0]["otp"]);
          if(result[0]["otp"] == otp){
             db.query(
              `update UserDetails set password = "${encryptedPassword}" where Email = "${Email}";`,
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.status(400).send(err.sqlMessage);
                } else {
                  console.log(result);
                  if (result.affectedRows === 0) {
                    res.status(400).send(result.message);
                  } else {
                    db.query(
                      `update UserDetails set otp = null where Email = "${Email}";`,
                      (err, result) => {
                        if (err) {
                          console.log(err);
                          res.status(400).send(err.sqlMessage);
                        } else {
                          console.log(result);
                          if (result.affectedRows === 0) {
                            res.status(400).send(result.message);
                          } else {
                            res.send("Password updated");
                          }
                        }
                      }
                    );
                  }
                }
              }
            );
             
          }
          else{
            res.status(400).send("Otp incorrect");
          }
          
        }
      }
    );
   
  } else {
    res.status(400).send("Some fields missing");
  }
});
async function  compare (givenpass, accpass){
    return await bcrypt.compare(givenpass, accpass);
  }

  function getPin() {
    let pin = Math.round(Math.random() * 10000);
    let pinStr = pin + '';

    // make sure that number is 4 digit
    if (pinStr.length == 4) {
        return pinStr;
       } else {
        return getPin();
       }
    }
  app.post("/api/requestFpOtp", (req, res) => {
    const Email = req.body.Email;
   let pin = getPin();
    if (Email) {
      db.query(
        `update UserDetails set otp = '${pin}' where Email = "${Email}";`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            if (result.affectedRows === 0) {
              res.status(400).send("No users found please sign up!");
            } else {
             
                const transport = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "sociophin.services@gmail.com",
                    pass: process.env.EMAILPASS
                  }
                })

                 transport.sendMail({
                  from: "Chess Services<anish2000.ad@gmail.com>",
                  to: Email,
                  subject: "Forget Password",
                  html: `<div className="email" style="
                      border: 1px solid black;
                      padding: 20px;
                      font-family: sans-serif;
                      line-height: 2;
                      font-size: 20px; 
                      ">
                      <h2>Here is your OTP!</h2>
                      <p>${pin}</p>
                  
                      <p>Chess Game</p>
                      </div>
                  `
                },(err2, res2)=>{
                  if(err2){
                    res.status(400).send(err2);

                  }
                  else{
                     res.send( res2);
                  }
                })

               
            }
          }
        }
      );
    } else {
      res.status(400).send("Some fields missing");
    }
  });

  app.post("/api/deleteTournament", (req, res) => {
    const T_Id = req.body.T_Id;
  
    if (T_Id) {
      db.query(
        `delete from Tournaments where T_Id = "${T_Id}"`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            if (result.affectedRows === 0) {
              res.status(400).send(result.message);
            } else {
              res.send("Succefully deleted");
            }
          }
        }
      );
    } else {
      res.status(400).send("Some fields missing");
    }
  });
  app.get("/api/getTRoomId/T_Id=:T_Id", (req, res) => {
    const T_Id = req.params.T_Id;
    const TimeStamp = new Date().valueOf();
  
    if (T_Id) {
      db.query(
        `SELECT * FROM Chess.T_Rooms where T_Id = ${T_Id} and  Status="Waiting" and Count<2;`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(400).send(err.sqlMessage);
          } else {
            console.log(result);
            if(result && result.length > 0){
              res.send(result);
              db.query(
                `update T_Rooms set Status="Full" , Count=Count+1 where T_Id="${T_Id}" and  Status="Waiting"`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(result);                    
                  }
                }
              );
              
            }
            else{
              db.query(
                `insert into T_Rooms (T_Id, TimeStamp, Status, Count) values("${T_Id}", "${TimeStamp}", "Waiting", 1)`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.status(400).send(err.sqlMessage);
                  } else {
                    console.log(result);
                    if (result.affectedRows === 0) {
                      res.status(400).send(result.message);
                    } else {
                      db.query(
                        `SELECT * FROM Chess.T_Rooms where T_Id="${T_Id}" and Status="Waiting";`,
                        (err, result) => {
                          if (err) {
                            console.log(err);
                            res.status(400).send(err.sqlMessage);
                          } else {
                            
                              res.send(result);
                            
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
            
              
            
          }
        }
      );
    } else {
      res.status(400).send("Some fields missing");
    }
  });
  app.post("/api/deleteTRoomId", (req, res) => {
    const T_Id = req.body.T_Id;
  
    if (T_Id) {
      db.query(
        `update T_Rooms set Status="Full" , Count=Count+1 where T_Id="${T_Id}" and  Status="Waiting"`,
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            if(result.affectedRows === 0){
              res.status(400).send("No rows found");
            }
            else{
                 res.send("Deleted Room");
            }                  
          }
        }
      );
    } else {
      res.status(400).send("Some fields missing");
    }
  });

  //-------------
  //Spin API part
  //-------------
  app.post("/api/getLastSpin", (req, res) => {
    const userid = req.body.userid;
    console.log(userid);
    if (userid) {
      db.query(
        `SELECT LastSpinTime from PlayerStats WHERE UserId = "${userid}"`,
        (err, result) => {
          if (err) {
            res.status(400).send(err.sqlMessage);
          } 
          else {
            var timez = result[0]["LastSpinTime"]
            if(timez == null){
              res.status(200).send("Success")
            }
            else{
              var LastSpin = new Date(timez)
              var today = new Date();
              today.setHours(0,0,0,0)

              if(today > LastSpin){
                res.status(200).send("Success")
              }
              else{
                res.status(400).send("Failure")
              }
            }
          }
        }
      );
    } else {
      res.status(400).send("Some fields missing");
    }
  });


  app.post("/api/addCoins",(req,res) => {
    const userid = req.body.userid;
    const coins = req.body.coins;
    db.query(`SELECT Coins FROM PlayerStats WHERE UserId = "rontinag311641793193347"`,
    (err,result) => {
        var currentCoins = result[0]["Coins"]
        console.log(userid,coins,result[0]["Coins"]);
        if(userid && coins){
          var setCoins = Number(currentCoins) + Number(coins);
          db.query(
            `UPDATE PlayerStats SET Coins = "${setCoins}" WHERE UserId = "${userid}"`,
            (err,result) => {
              if(err){
                res.status(400).send(err.sqlMessage)
              }
              else{
                var today = new Date();
                today.setHours(0,0,0,0)
                db.query(`UPDATE PlayerStats SET LastSpinTime = "${today}" WHERE UserId = "${userid}"`)
                console.log(setCoins)
                res.status(200).send(setCoins.toString())
              }
            }
          )
        }
        else{
          res.status(400).send("POST error")
        }
      }
    )
    
    
    
  })

  //test apis//
  app.get("/api/testAlter",(req,res) => {
    db.query(`SELECT * FROM PlayerStats`,(err,result) => {
      if(err){
        return res.send(err)
        //ALTER TABLE PlayerStats ADD Coins INTEGER
      }
      else{
        return res.send(result)
      }
    })
  })


app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening at http://localhost: 4000`);
});




