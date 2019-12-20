var express = require("express");
var exphbs = require("express-handlebars");
var mysql = require("mysql");

var app = express();

var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "quotes_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

// Serve index.handlebars to the root route, populated with all quote data.
app.get("/", function(req, res) {
  connection.query("SELECT * FROM quotes", (err, results) => {
    if (err) {
      return res.status(500).end();
    }
    console.log("results = ", results);
    res.render("index", {quotes: results});
  });
});

// Serve single-quote.handlebars, populated with data that corresponds to the ID in the route URL.
app.get("/:id", function(req, res) {
  let id = req.params.id;
  console.log("id = ", id);
  connection.query("SELECT * FROM quotes WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).end();
    } else {
      res.render("single-quote", results[0]);
    }
  })
});

// Create a new quote using the data posted from the front-end.
app.post("/api/quotes", function(req, res) {
  let quote = req.body.quote;
  let author = req.body.author;
  connection.query(
    "INSERT INTO quotes (quote, author) VALUES(?, ?)", 
    [quote, author],
    (err, results) => {
      if (err) {
        res.status(500).end();
      } else {
        res.json({id: results.insertId});
      }
    })
});

// Delete a quote based off of the ID in the route URL.
app.delete("/api/quotes/:id", function(req, res) {
  connection.query(
    "DELETE FROM quotes WHERE id = ?", 
    [req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).end();
      } else if (results.affectedRows === 0) {
        return res.status(404).end();
      }
      res.status(200).end();
    }
  );
});

// Update a quote.
app.put("/api/quotes/:id", function(req, res) {
  connection.query(
    "UPDATE quotes SET author = ?, quote = ? WHERE id = ?",
    [req.body.author, req.body.quote, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).end();
      } else if (results.affectedRows === 0) {
        return res.status(404).end();
      }
      return res.status(200).end()
    });
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
