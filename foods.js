const mongoose = require("mongoose");

var foodSchema = new mongoose.Schema({
  name:String,
  img:String,
  recipe:String,
  commentList: [
                  {
                    type:mongoose.Schema.Types.ObjectId,ref:"comments"
                  }
               ],
  createdAt:{type:String, default:Date.now()}
});

foodSchema.methods.toJSON = function(){
  return {
            name:this.name,
            img:this.img,
            recipe:this.recipe
          };
}

module.exports = mongoose.model("foods",foodSchema);
