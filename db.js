const mysql = require("mysql2");

const connection = mysql.createConnection(process.env.MYSQL_URL);

connection.connect(err => {
  if (err) {
    console.error("Error de conexión:", err);
    return;
  }
  console.log("Conectado a Railway MySQL");
});

module.exports = connection;
