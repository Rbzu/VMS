var mongoose = require("mongoose");
// console.log(mongoose.Schema.Types);
var commentSchema = new mongoose.Schema({
  text: String,
  author:{
            type:mongoose.Schema.Types.ObjectId,                
            ref:"users"
         },
  created:{type:Date, default:Date.now()}
});

module.exports = mongoose.model("comments", commentSchema);
