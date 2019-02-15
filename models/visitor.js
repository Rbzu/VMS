var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var visitorSchema = new mongoose.Schema({
  visitorName:String,
  empName:String,
  time:{type:Date, default:Date.now()},
  empID:String,
  dept:String,
  duration:String,
  purpose:String

});

visitorSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("visitors", visitorSchema);
