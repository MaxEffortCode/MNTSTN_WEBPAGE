const express = require("express")
const app = express()
const PORT = 5000
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth, userIsLoggedIn, userIsLoggedInTrueOrFalse } = require("./middleware/auth.js");
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



app.locals.title = 'UserNM';


app.get("/home", userIsLoggedInTrueOrFalse, (req, res) => res.render("home", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("", userIsLoggedInTrueOrFalse, (req, res) => res.render("home", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/register", userIsLoggedInTrueOrFalse, (req, res) => res.render("register", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/registerWithToken", userIsLoggedInTrueOrFalse, (req, res) => res.render("registerWithToken", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/login", userIsLoggedInTrueOrFalse, (req, res) => res.render("login", {"userNM" : req.title, "userFromReq": req.user, "logdetails":"", "isLoggedIn" : req.isLoggedIn}))
app.get("/admin", adminAuth, (req, res) => res.render("admin"))
app.get("/basic", userAuth, (req, res) => res.render("user"))
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" })
  res.redirect("/")
})

app.use(express.static(__dirname + '/public'));

