const express = require("express");
const router = express.Router();

const { register, login, update, deleteUser, getUsers, getUserSelf, registerWithToken } = require("./auth");
const { adminAuth, userAuth, userIsLoggedIn } = require("../middleware/auth");

router.route("/registerWithToken").post(registerWithToken);
router.route("/register").post(register);
router.route("/login").post(userIsLoggedIn, login);
//router.route("/admin").post(admin)
router.route("/update").put(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);
router.route("/getUsers").get(getUsers);
router.route("/getUserSelf").get(userAuth, getUserSelf);

module.exports = router;