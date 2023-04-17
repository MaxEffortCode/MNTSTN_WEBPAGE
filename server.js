const {NodeVM} = require('vm2');
const { PythonShell } = require("python-shell");
const express = require("express")


const app = express()
const PORT = 5000
const connectDB = require("./db");
const cookieParser = require("cookie-parser");

const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51M2mNpCyYVSsKZLoeOG3sbmhoo4n6Q1c9DBEYiMznjT7JrXS4eW2bcROZU2EBLTknFcJmhLqighHIYPMlbyNPUQa00GsQso4VK');
const { adminAuth, userAuth, userIsLoggedIn, userIsLoggedInTrueOrFalse, updateUserWithTokenApiReq, emailValidation } = require("./middleware/auth.js");
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

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json())
//binding middleware to an instance of the app object
app.use("/api/auth", require("./Auth/route"))
//all paths with use cookieParser
app.use(cookieParser());
app.use("/public", express.static("./public"));




app.locals.title = 'UserNM';


app.get("/home", userIsLoggedInTrueOrFalse, (req, res) => res.render("home", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/index", userIsLoggedInTrueOrFalse, (req, res) => res.render("index", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/about", userIsLoggedInTrueOrFalse, (req, res) => res.render("about", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))

app.get("", userIsLoggedInTrueOrFalse, (req, res) => res.render("home", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/register", userIsLoggedInTrueOrFalse, (req, res) => res.render("registerWithToken", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/login", userIsLoggedInTrueOrFalse, (req, res) => res.render("login", {"userNM" : req.title, "userFromReq": req.user, "logdetails":"", "isLoggedIn" : req.isLoggedIn}))
app.get("/admin", adminAuth, (req, res) => res.render("admin"))
app.get("/basic", userAuth, (req, res) => res.render("user"))
app.get("/payments", userAuth, userIsLoggedInTrueOrFalse, (req, res) => res.render("payments", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/paymentcomplete", userAuth, userIsLoggedInTrueOrFalse, (req, res) => res.render("paymentcomplete", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))
app.get("/tester", userIsLoggedInTrueOrFalse, (req, res) => res.render("tester", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))


app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" })
  res.redirect("/")
})
//create middleware to grab user token
app.get("/myaccount", userIsLoggedInTrueOrFalse, function (req, res) {
  if (req.isLoggedIn == true ){
    res.render("myaccount", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user, "userToken" : req.userToken, "apiToken" : req.apiToken});
  }
  else{
    res.render("login", {"userNM" : req.title, "userFromReq": req.user, "logdetails":"", "isLoggedIn" : req.isLoggedIn})
  }
})

app.get("/verify/:token", emailValidation, function (req, res) {
  res.render("verify", {"token" : req.params.token});
}
)


/* app.get("/api/v1/:year/:qrt/:companyName", userAuth, function (req, res) {
  try {
    console.log("trying to search and find with year: " + req.params['year'] 
    + " qrt: " + req.params['qrt'] + " company: " + req.params['companyName']);

    let options = {
      mode: "text",
      pythonOptions: ["-u"],
      scriptPath: "SandBox/API",
      args: ["value1", "value2", "value3"],
    };

    const pyshell = new PythonShell("search_and_find.py", options);
  }
}) */


//need to make middleware to add a time of api call to the userwithtoken model
app.get('/secfiles/:fileNum',  function (req, res) {
  //app.get('/secfiles/:fileNum', updateUserWithTokenApiReq, userIsLoggedInTrueOrFalse, function (req, res) {
  if (req.isLoggedIn == true ){
    let pathToFile = "./Sec_fiings/resources/companies/" + req.params['fileNum'];
    res.download(pathToFile + ".zip", req.params['fileNum']);
  }
  else{
    //these two lines are for testing purposes please remove them
    console.log("user requested file : " + req.params['fileNum']);
    let pathToFile = "./Sec_fiings/resources/companies/" + req.params['fileNum'];
    res.download(pathToFile + ".zip", req.params['fileNum']);
    //res.render("login", {"userNM" : req.title, "userFromReq": req.user, "logdetails":"", "isLoggedIn" : req.isLoggedIn})
  }
  console.log("user requested file : " + req.params['fileNum']);
  //Sec_fiings/resources/companies/1000032.zip
})

app.get('/file/:name', function (req, res, next) {
  let options = {
    root: path.join(__dirname, './public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  console.log("here")
  let fileName = req.params.name
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log("here")
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
})

//app.get("/home", userIsLoggedInTrueOrFalse, (req, res) => res.render("home", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user}))

app.post("/charge", userIsLoggedInTrueOrFalse, (req, res) => {
  console.log("posted to charge");
  console.log("req body : \n");
  console.log(req.body);

  try {
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken
      })
      .then(customer =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "usd",
          customer: customer.id
        })
      )
      .then(() => {
        console.log("Charge Successful");
        res.render("paymentcomplete", {"isLoggedIn" : req.isLoggedIn, "userFromReq" : req.user})
      })
      .catch(err => {
        console.log("there was an error (server.js app.post): " + err)}
        );
  } catch (err) {
    res.send(err);
  }
});



//will break css and js if this line isn't at end of file
app.use(express.static(__dirname + '/public'));

