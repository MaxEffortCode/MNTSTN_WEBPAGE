const express = require("express")
const app = express()
const PORT = 5000
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");
//Connecting the Database
connectDB();

//app.listen(PORT, () => console.log(`Server Connected to port! ${PORT}`))
const server = app.listen(PORT, () =>
  console.log(`Server Connected to port! ${PORT}`)
)
// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})

app.set("view engine", "ejs")

app.use(express.json())

app.use("/api/auth", require("./Auth/route"))
app.use(cookieParser());

app.get("/admin", adminAuth, (req, res) => res.send("Admin Route"));
app.get("/basic", userAuth, (req, res) => res.send("User Route"));

app.get("/home", (req, res) => res.render("homeTest"))
app.get("", (req, res) => res.render("homeTest"))
app.get("/register", (req, res) => res.render("register"))
app.get("/login", (req, res) => res.render("login"))
app.get("/admin", adminAuth, (req, res) => res.render("admin"))
app.get("/basic", userAuth, (req, res) => res.render("user"))
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" })
  res.redirect("/")
})

app.use(express.static(__dirname + '/public'));

