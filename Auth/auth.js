const User = require("../model/user");
const UserWithToken = require("../model/userWithToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = "61803f464c7e8cac7130fcd37cc06045f90c0a6e8fc2a1f09f043d742a31cfdd168522";



function sendEmailValidation(email) {
  //send email
  
  
  //return true if email was sent
  return true;
}

function generateToken() {
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 40; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function validatePassword(password) {
  //need to return error array and check if it's empty
  var p = password;
  errors = [];
  if (p.length < 8) {
    errors.push("Your password must be at least 8 characters");
  }
  if (p.search(/[a-z]/i) < 0) {
    errors.push("Your password must contain at least one letter.");
  }
  if (p.search(/[0-9]/) < 0) {
    errors.push("Your password must contain at least one digit.");
  }
  if (errors.length > 0) {
    return errors;
  }
  return true;
}

exports.registerWithToken = async (req, res, next) => {
  const { username, password, email, confirmpassword, agreement } = req.body;
  console.log("registering user: \n" + JSON.stringify(req.body) + "\n");

  if (agreement == false) {
    return res.status(400).json({
      message: "You must agree to the terms and conditions to register",
    });
  }

  let passwordValid = validatePassword(password);
  if (passwordValid.length > 0) {
    return res.status(400).json({
      message: "There was an error " + passwordValid,
    });
  }
  if (password !== confirmpassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  let token = generateToken();

  bcrypt.hash(password, 10).then(async (hash) => {
    await UserWithToken.create({
      username,
      password: hash,
      apiToken: token,
      email,
    })
      .then((userWithToken) => {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
          { id: userWithToken._id, username, role: userWithToken.role },
          jwtSecret,
          {
            expiresIn: maxAge, // 3hrs
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        res.status(201).json({
          message: "UserWithToken successfully created",
          user: userWithToken._id,
          role: userWithToken.role,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "Username Already Taken" + error.message,
        })
      );
  });
};

exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
    })
      .then((user) => {
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign({ id: user._id, username, role: user.role }, jwtSecret, {
          expiresIn: maxAge, // 3hrs
        });
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        res.status(201).json({
          message: "User successfully created",
          user: user._id,
          role: user.role,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message,
        })
      );
  });
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  console.log("logging in user: \n" + JSON.stringify(req.body) + "\n");

  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    });
  }

  try {
    const user = await UserWithToken.findOne({ username });
    console.log("user: " + user);

    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign({ id: user._id, username, role: user.role }, jwtSecret, {
            expiresIn: maxAge, // 3hrs in sec
          });
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
          });
          res.status(201).json({
            message: "User successfully Logged in",
            user: user._id,
            role: user.role,
          });
        } else {
          res.status(400).json({ message: "Login not succesful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  // Verifying if role and id is presnt
  if (role && id) {
    // Verifying if the value of role is admin
    if (role === "admin") {
      // Finds the user with the id
      await User.findById(id)
        .then((user) => {
          // Verifies the user is not an admin
          if (user.role !== "admin") {
            user.role = role;
            user.save((err) => {
              //Monogodb error checker
              if (err) {
                return res.status("400").json({ message: "An error occurred", error: err.message });
                process.exit(1);
              }
              res.status("201").json({ message: "Update successful", user });
            });
          } else {
            res.status(400).json({ message: "User is already an Admin" });
          }
        })
        .catch((error) => {
          res.status(400).json({ message: "An error occurred", error: error.message });
        });
    } else {
      res.status(400).json({
        message: "Role is not admin",
      });
    }
  } else {
    res.status(400).json({ message: "Role or Id not present" });
  }
};

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await User.findById(id)
    .then((user) => user.remove())
    .then((user) => res.status(201).json({ message: "User successfully deleted", user }))
    .catch((error) => res.status(400).json({ message: "An error occurred", error: error.message }));
};

exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then((users) => {
      const userFunction = users.map((user) => {
        const container = {};
        container.username = user.username;
        container.role = user.role;
        container.id = user._id;

        return container;
      });
      res.status(200).json({ user: userFunction });
    })
    .catch((err) => res.status(401).json({ message: "Not successful", error: err.message }));
};

//need to find way of getting objecrt id from username
//also this should use the cache token not a sent username
//we should add object Id to the array element
exports.getUserSelf = async (req, res, next) => {
  const { user } = req.body;
  const { token } = req.body;
  console.log("id : " + user + " token : " + token);
  await UserWithToken.findOne({ username: user })
    .then((userWithToken) => {
      userWithToken.apiToken = token;
      userWithToken.save((err) => {
        //Monogodb error checker
        if (err) {
          return res.status(400).json({ message: "An error occurred", error: err.message });
          process.exit(1);
        }
        res.status(200).json({ user: userWithToken });
      });
    })
    .catch((err) => res.status(401).json({ message: "Not successful", error: err.message }));
};

exports.getUserToken = async (req, res, next) => {
  const { user } = req.body;

  console.log("id : " + user);
  await UserWithToken.findOne({ username: user })
    .then((userWithToken) => {
      res.status(200).json({ user: userWithToken });
    })
    .catch((err) => res.status(401).json({ message: "Not successful", error: err.message }));
};
