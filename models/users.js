var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username:String,
  password:String,
  phonenumber:String,
  isadmin:Boolean,
  islocal:Boolean

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("users", userSchema);
