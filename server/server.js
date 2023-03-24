const express = require('express');
const mySql = require('mysql');
const myConn = require('express-myconnection');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(
  myConn(mySql, {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'images',
  })
);
app.use(cors());
app.use(express.static(path.join(__dirname, 'dbImage')));

app.use(require('./routes/routes'));

app.listen(9000, () => {
  console.log('server running', 'http://localhost:' + 9000);
});
