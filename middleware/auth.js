const UserWithToken = require("../model/userWithToken");
const jwt = require("jsonwebtoken");
const jwtSecret = "61803f464c7e8cac7130fcd37cc06045f90c0a6e8fc2a1f09f043d742a31cfdd168522";

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "admin") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized, token not available" });
  }
};

exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          console.log("Time: %d", Date.now());
          console.log("Token is : ");
          console.log(token);
          next();
        }
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized, token not available" });
  }
};

exports.userIsLoggedIn = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          console.log("Time: %d", Date.now());
          console.log("Token is : ");
          console.log(token);
          res.locals.title = "ayyy";
          req.title = "ayyy2";
          res.locals.user = "a";
          req.user = decodedToken.username;
          let logdetails = {
            id: "some-id",
            datetime: Date.now(),
            path: "/path-in-url",
          };
          req.logdetails = logdetails;
          //res.send({ "userNM2":"GeeksforGeeks"});
          req.userNM = "ahh";
          next();
        }
      }
    });
  } else {
    let logdetails = {
      id: "some-id",
      datetime: Date.now(),
      path: "/path-in-url",
    };
    res.logdetails = logdetails;
    //res.send({ "userNM2":"GeeksforGeeks"});
    res.userNM = "ahh";
    next();
  }
};

exports.userIsLoggedInTrueOrFalse = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        req.isLoggedIn = true;
        req.user = decodedToken.username;
        req.userToken = token;
        req.apiToken = decodedToken.apiToken;

        console.log(decodedToken.username);
        next();
      }
    });
  } else {
    req.isLoggedIn = false;
    next();
  }
};

// function that updates userwithtoken model with when this function was called
exports.updateUserWithTokenApiReq = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        await UserWithToken.findOne({ username: decodedToken.username })
          .then((userWithToken) => {
            userWithToken.lastLogin = Date.now();
            //need to create a field in the model for this plus the date of request
            userWithToken.apiRequests = userWithToken.apiRequests + 1;
            userWithToken.save((err) => {
              //Monogodb error checker
              if (err) {
                return res.status(400).json({ message: "An error occurred", error: err.message });
              }
              next();
              //res.status(200).json({ user: userWithToken });
            });
          })
          .catch((err) => res.status(401).json({ message: "Not successful", error: err.message }));
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized, token not available" });
  }
};
