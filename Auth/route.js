const express = require("express");
const router = express.Router();

const { register, login, update, deleteUser, getUsers, getUserSelf, registerWithToken, getUserToken, execute } = require("./auth");
const { adminAuth, userAuth, userIsLoggedIn, userIsLoggedInTrueOrFalse } = require("../middleware/auth");
const { pythonSandbox } = require("../SandBox/sandbox");

router.route("/registerWithToken").post(registerWithToken);
router.route("/register").post(userIsLoggedInTrueOrFalse, register);
router.route("/login").post(login);
//router.route("/admin").post(admin)
router.route("/update").put(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);
router.route("/getUsers").get(getUsers);
router.route("/getUserSelf").get(userAuth, getUserSelf);
router.route("/getUserSelf").post(getUserSelf);
router.route("/getUserToken").post(getUserToken);
router.route("/execute").post(execute);
router.route("/pythonSandbox").post(pythonSandbox);

module.exports = router;