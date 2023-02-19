const {NodeVM} = require('vm2');
const User = require("../model/user");
const UserWithToken = require("../model/userWithToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = "61803f464c7e8cac7130fcd37cc06045f90c0a6e8fc2a1f09f043d742a31cfdd168522";
const Mailjet = require('node-mailjet');
const MJ_APIKEY_PUBLIC='19ad40069c73f1881c99383c2381785b';
const MJ_APIKEY_PRIVATE='e36595c0b8a551c4690d222d80c09b40';
//need to fix plain text passwords in jwt secret and email validation
//need to make email validation async works for now but not error resistant

function sendEmailValidation(email, username, emailToken) {
  //send email

  HTMLPart = `<h3>Thank you for registering with EZ Sec API. click below to finish verification<br /> <a href="http://localhost:5000/verify/${emailToken}">Verify</a>!</h3><br />or copy and paste this link into your browser: http://localhost:5000/verify/${emailToken}<br />If you did not register with EZ Sec API please ignore this email.`;

  const mailjet = Mailjet.apiConnect(
    MJ_APIKEY_PUBLIC,
    MJ_APIKEY_PRIVATE,
    {
      config: {},
      options: {}
    } 
  );
  const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "ceo@bandbcustomsolutions.com",
                Name: "EZ Sec API"
              },
              To: [
                {
                  Email: email,
                  Name: username
                }
              ],
              Subject: "EZ Sec API - Your Email Validation Code",
              TextPart: "Thank you for registering with EZ Sec API.",
              HTMLPart: HTMLPart,
            }
          ]
        })

  request
      .then((result) => {
          console.log("email sent good: \n" + result.body)
          return true;  
      })
      .catch((err) => {
          console.log("email sent bad: \n" + err.statusCode)
          return false;
      })


  //return true if email was sent
  
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
  emailToken = generateToken();
  console.log("registering user: \n" + JSON.stringify(req.body) + "\n");
  if (!username || !password || !email || !confirmpassword) {
    return res.status(400).json({
      message: "Please fill out all fields",
    });
  }
  if (username.length < 3) {
    return res.status(400).json({
      message: "Username must be at least 3 characters",
    });
  }


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
      emailToken,
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
        console.log("Send email confirmation here: \n" + userWithToken);
        emailSent = sendEmailValidation(userWithToken.email, username, emailToken);
        //emailSent = true;
        if (emailSent == true) {
          console.log("Email Sent Successfully");
        }
        else {
          console.log("Email Failed to Send");
        }
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



exports.execute = async (req, res, next) => {
  const code = req.body.message;
  const vm = new NodeVM({
    require: {
      external: true,
      root: './',
      mock: {
        fs: {
            readFileSync: () => 'Nice try!'
        }
      }
    }
  });
  //check sandbox.js for more info
  try {
    //const code = 'result = 1 + 2;';
    console.log("this is code" + JSON.stringify(code));
    const result = vm.run(`module.exports = function() { ${code}; }`, 'vm.js')();
    console.log("this is result: " + JSON.stringify(result));
    //res.send(result);
    console.log("--------------------");

    res.status(200).json({ userCodeReturn : result });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
