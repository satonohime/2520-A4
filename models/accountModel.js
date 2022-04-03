const mongoose = require("mongoose");

const {Schema} = mongoose;

const accountModel = new Schema({
  username: {type: String},
  followers: {type: String},
  creationMonth: {type: String},
  verified: {type: Boolean, default: false},
});

module.exports = mongoose.model("Account", accountModel);
