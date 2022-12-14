// user.js
const Mongoose = require("mongoose")
const UserSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  apiToken: {
    type: String,
    unique: false,
    required: true,
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  apiRequests: {
    type: Number,
    default: 0,
  },
})

const UserWithToken = Mongoose.model("userwithtoken", UserSchema)
module.exports = UserWithToken