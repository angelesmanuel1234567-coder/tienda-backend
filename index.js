// index.js
const express = require("express");
const cors = require("cors");
const db = require("./db");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/productos", (req, res) => {
  const sql = `
    SELECT p.*, c.descripcion AS categoria
    FROM producto p
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/venta", (req, res) => {
  const { carrito, id_cliente } = req.body;

  db.query(
    "INSERT INTO ventas (id_cliente) VALUES (?)",
    [id_cliente],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const idVenta = result.insertId;

      carrito.forEach(item => {
        db.query(
          "INSERT INTO detalle_venta (cantidad, id_producto, id_venta) VALUES (?, ?, ?)",
          [item.qty, item.id_producto, idVenta]
        );
      });

      res.json({ message: "Venta registrada" });
    }
  );
});


app.get("/qr/:monto", async (req, res) => {
  const monto = req.params.monto;

  const texto = `PAGO YAPE\nMONTO: S/${monto}`;

  const qr = await QRCode.toDataURL(texto);

  res.json({ qr });
});

app.post("/confirmar-pago", (req, res) => {
  const { carrito, id_cliente } = req.body;

  if (!carrito || carrito.length === 0) {
    return res.status(400).json({ error: "Carrito vacío" });
  }

  // 1. Crear venta
  db.query(
    "INSERT INTO ventas (id_cliente) VALUES (?)",
    [id_cliente || null],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const idVenta = result.insertId;

      // 2. Insertar detalle
      const detalles = carrito.map(item => [
        item.qty,
        item.id_producto,
        idVenta
      ]);

      const sqlDetalle = `
        INSERT INTO detalle_venta (cantidad, id_producto, id_venta)
        VALUES ?
      `;

      db.query(sqlDetalle, [detalles], (err2) => {
        if (err2) return res.status(500).json(err2);

        res.json({
          message: "Pago confirmado y venta registrada",
          idVenta
        });
      });
    }
  );
});

// generar QR
app.get("/qr/:monto", async (req, res) => {
  const monto = req.params.monto;

const texto = `YAPE\nNumero: 940512050\nMonto: S/${monto}`;
  try {
    const qr = await QRCode.toDataURL(texto);
    res.json({ qr });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});