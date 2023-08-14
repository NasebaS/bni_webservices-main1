const mysql = require("mysql");

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fees_collection",
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (!err) {
    console.log("connected");
  } else {
    console.log("connection failed" + err.message);
  }
});

module.exports = mysqlConnection;
