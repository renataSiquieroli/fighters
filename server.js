const express = require("express");
const app = express();
require("colors");
require("dotenv").config();
const { Pool } = require("pg");
const cors = require("cors");

app.use(cors());
app.use(express.json()); // for parsing application/json

const PORT = 8080;

const pool = new Pool();

app.get("/", (req, res) => {
  res.json("Welcome to my API");
});

app.get("/fighters", (req, res) => {
  pool
    .query("SELECT * FROM fighters;")
    .then((data) => res.json(data.rows))
    .catch((err) => res.sendStatus(500).send("Something went wrong"));
});

// parameterized queries - select a single fighter by id -
app.get("/fighters/:id", (req, res) => {
  const { id } = req.params; // destructuring id from req.params.id so we can use it in the query.
  pool
    // not use template literals for the query `${id}`, use $1 instead. Otherwise, it will be vulnerable. Anyone can change the url path and drop the table. Injection attacks. Security issues.
    .query("SELECT * FROM fighters WHERE id = $1;", [id])
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(500).send(e));
});

// add a new fighter

app.post("/fighters", (req, res) => {
  const { first_name, last_name, country_id, style } = req.body;
  pool
    .query(
      "INSERT INTO fighters (first_name, last_name, country_id, style) VALUES ($1, $2, $3, $4) RETURNING *;",
      [first_name, last_name, country_id, style]
    )
    .then((data) => res.json(data.rows)) // data.rows is an array
    .catch((e) => res.sendStatus(500).send(e));
});

// EDIT a fighter in the table

app.put("/fighters/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, country_id, style } = req.body;
  pool
    .query(
      "UPDATE fighters SET  first_name = $1, last_name = $2, country_id = $3, style = $4 WHERE id = $5 RETURNING *; ",
      [first_name, last_name, country_id, style, id]
    )
    .then((data) => res.status(201).json(data.rows))
    .catch((e) => res.sendStatus(404));
});

// DELETE a fighter in the table
app.delete("/fighters/:id", (req, res) => {
  const { id } = req.params;
  pool
    .query("DELETE FROM fighters WHERE id = $1;", [id]) // $1 is a placeholder for the id from req.params
    .then((data) => res.status(201).json(data.rows))
    .catch((e) => res.sendStatus(404));
});

app.get("/time", (req, res) => {
  pool.query("SELECT NOW()", (err, response) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.send(response.rows[0]);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`.rainbow);
});
