// user.js
const Mongoose = require("mongoose")
const UserWithTokenSchema = new Mongoose.Schema({
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
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
})

const User = Mongoose.model("user", UserWithTokenSchema)
module.exports = User