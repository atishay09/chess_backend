const mysql = require('mysql')


const db = mysql.createConnection({
host: "chess-be.ctwicvo7fb5e.ap-south-1.rds.amazonaws.com",
user: "admin",
password: "ChessBE123",
database:"Chess" 
})

//UPDATE PlayerStats SET Coins = ${setCoins} WHERE Email = ${email}
//SELECT Coins FROM PlayerStats WHERE UserId = "rontinag311641793193347"
//SELECT * FROM PlayerStats WHERE UserId = "rontinag311641793193347"

db.query(
    `UPDATE PlayerStats SET Coins = 100 WHERE UserId = "rontinag311641793193347"`,
    (err, result) => {
        if(err){
            console.log(err);

        }
        else{
            console.log(result);
            // console.log(result[0]["LastSpinTime"] == null);
            // console.log(typeof(result[0]["LastSpinTime"]));
        }
    })
