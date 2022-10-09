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
//binding middleware to an instance of the app object
app.use("/api/auth", require("./Auth/route"))
//all paths with use cookieParser
app.use(cookieParser());

app.locals.title = 'My App';


app.get("/home", (req, res) => res.render("home"))
app.get("", (req, res) => res.render("home"))
app.get("/register", (req, res) => res.render("register"))
app.get("/registerWithToken", (req, res) => res.render("registerWithToken"))
app.get("/login", (req, res) => res.render("login", {userNM : app.locals.title}))
app.get("/admin", adminAuth, (req, res) => res.render("admin"))
app.get("/basic", userAuth, (req, res) => res.render("user"))
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" })
  res.redirect("/")
})

app.use(express.static(__dirname + '/public'));
