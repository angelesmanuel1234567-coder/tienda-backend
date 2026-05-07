const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "turntable.proxy.rlwy.net",
  user: "root",
  password: "IuzwsbcAtiTttevSKlnkmizyBkbYGrdc",
  database: "railway",
  port: 47399
});

connection.connect(err => {
  if (err) {
    console.error("Error de conexión:", err);
    return;
  }
  console.log("Conectado a Railway MySQL");
});

module.exports = connection;
