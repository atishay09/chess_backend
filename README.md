# Project : Chess

- Database: RDS MySql and Firebase
- Backend server: Node.js
- Deployment: Heroku and EC2
- API's : https://www.postman.com/dark-satellite-529936/workspace/chess-be/overview
- Server URL: https://chessgame-backend.herokuapp.com/ & http://ec2-13-126-112-250.ap-south-1.compute.amazonaws.com:4000/

### Modules:

- Authentication:
  - Email/Social auth through email and password
  - Password encryption using bcrypt
  - Tokenization using JWT
  - Created a middleware for token verification
  - Forget password otp using nodemailer

- Gameplay for multiplayer and tournament: Firebase firestore database

- Player Stats: Switch cases for following queries -
  - Join
  - Match
  - Won
  - Loss
  - Drawn
  - spinWin

- Ranking / authorization  : mySql Queries
- Room Id creation for tournament: Using Node and Mysql

### CMS:
- Five tables, each for one screen with columns named after their required contents.
- All the tables are fetched and send to one allSync API mapped into an object.
- TenentId defines the ID of each column which is also defined in the userDetails table.

### DB Structure
<img src="https://i.ibb.co/353HFhz/download.png" alt="download" border="0">
note: this structure is just for understanding purpose since some column were changed or added as per changing requirements.
