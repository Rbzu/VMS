var express = require('express');
var app = express();
var ejs = require("ejs");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
var expressSession = require("express-session");
var objectid = require("mongodb").ObjectID();


const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

var Visitors = require("./models/visitor.js");
var Users = require("./models/users.js");
// var Foods = require("./models/foods.js");
var Comments = require("./models/comments.js");

app.use(expressSession({
  secret:"My name is Khan",
  resave:false,
  saveUninitialized:false
}));

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());
passport.use(new LocalStrategy(Users.authenticate()));

mongoose.connect("mongodb://localhost:27017/demoDB",{useNewUrlParser: true,  useCreateIndex: true });
// set PORT=3000
var port = process.env.PORT || 3000;

app.use(express.static('public')) //serves the static html file
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req,res,next){
  res.locals.loggedInUser = req.user;
  next();
})

// DASHBOARD
app.get("/", (req,res) => {
  res.redirect("/foods");
});

app.get("/secret/vlogs", (req,res) => {
  Visitors.find({}).then((allUsers) => {

      res.render("./visitorlogs.ejs", {allUsers:allUsers})
    }).catch((error)=> {
      res.send(error);
    });
  });

app.get("/secret/logs", (req,res) => {
  Users.find({}).then((allUsers) => {

      res.render("./logs.ejs", {allUsers:allUsers})
    }).catch((error)=> {
      res.send(error);
    });
  });

app.get("/secret", isLoggedIn, (req,res) => {
  res.render("./secret.ejs");
});
// VIEW ALL FOODS

app.get("/aboutus",  (req,res) => {
  res.render("./aboutus.ejs");
});


app.post('/visitorentry', (req, res) => {
  console.log(req.body);
  Visitors.create({
    visitorName:req.body.visitorName,
    empName:req.body.empName,
    empID:req.body.empID,
    dept:req.body.dept,
    duration:req.body.duration,
    purpose:req.body.purpose
}).then((createdVisitor)=>{
      res.send(createdVisitor);
  }).catch((error)=>{
    res.send(error);
  });
});


app.post('/foods/personal', (req, res) => {
    Users.find({}).then((foundFoodList) => {
        res.send("This is your personal page !", {foundFoodList:foundFoodList})
    }).catch((error) => {
      res.send(error);
    });
});

app.get('/foods', isLoggedIn, (req, res) => {
    Users.find({}).then((foundFoodList) => {
        res.render("./masterpage.ejs", {foundFoodList:foundFoodList})
    }).catch((error) => {
      res.send(error);
    });
});


app.get('/login', isNotLoggedIn, (req, res) => {
    res.render("./loginpage.ejs");
});

app.get('/current', isLoggedIn, (req, res) => {
    res.render("./secret.ejs");
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.delete("/secret/logs/:userID", (req, res) =>{
  Users.findByIdAndRemove(req.params.userID).then((result) => {
    res.redirect("/");
  }).catch((error) => {
    res.send(error);
  });
});

// new comment
app.post('/foods/:foodID/comments', (req, res) => {
  Comments.create({
    text:req.body.text,
    // author:req.body.author
  }).then((createdComment)=>{
    Foods.findById(req.params.foodID).then((foundFood)=>{
      foundFood.commentList.push(createdComment);
      res.send(e);
      foundFood.save().then().catch((e)=>{
      })
    })
  res.redirect('/foods');
   // res.render("./comment/new.ejs", {createdComment:createdComment});
  }).catch((error)=>{
  res.send(error);
  })
});

// POST /login gets urlencoded bodies
app.post('/foods/new', urlencodedParser, (req, res) => {
  Users.create({
    username:req.body.username,
    password:req.body.password,
  phonenumber:req.body.phonenumber
  }).then((createdFood)=>{
      res.redirect("/");
  }).catch((error)=>{
    res.send(error);
  })
});

app.get("/logout", isLoggedIn, function(req, res){
     req.logout();
     res.redirect("/");
});


// UPDATE
app.put("/foods/:foodID", (req,res,next) => {
  console.log(req.body.name);
  Foods.findOneAndUpdate({_id: req.params.foodID},
      {
        name:req.body.name,
        img:req.body.img,
        recipe:req.body.recipe
      },
      {
        new:true,
        useFindAndModify: false
      }
  ).then((updatedFood) => {
    // res.redirect("/foods/"+updatedFood._id)
      res.render("./food/show.ejs", {foundFood:updatedFood});
  }).catch((error) => {
      res.send(error);
  });
})

app.get("/foods/:foodID/comments", (req,res) => {
  Foods.findById(req.params.foodID).then((currentFood) => {
  res.render("./comment/new.ejs", {currentFood:currentFood})
}).catch((error)=> {
  res.send(error);
});
});


app.get("/register", (req,res) => {
  res.render("./user/registration.ejs");
})

app.get("/foods/:foodID/edit", (req, res) => {
  var num = req.params.foodID;
    Foods.findById(num).then((editfoundFood) => {
      res.render("./food/edit.ejs", {editfoundFood:editfoundFood})
    }).catch((error) => {
      res.send(error);
    });
})

app.get('/foods/:foodID', (req, res) => {
  var num = req.params.foodID;
    Foods.findById(num).populate("commentList").then((foundFood) => {
      console.log(foundFood);
      res.render("./food/show.ejs", {foundFood:foundFood})
    }).catch((error) => {
      res.send(error);
    });
});

app.delete("/foods/:foodID/comments/:commentID", (req, res) =>{
  Comments.findByIdAndRemove(req.params.commentID).then((result) => {
    res.redirect("/");
  }).catch((error) => {
    res.send(error);
  });
});


app.delete("/foods/:foodID", (req, res) =>{
  Foods.findByIdAndRemove(req.params.foodID).then((result) => {
    res.redirect("/");
  }).catch((error) => {
    res.send(error);
  });
})


app.get("/demo", (req,res) => {
  res.send({description:"This is the demo route", date:"15-Jan-2019"});
})

app.post("/registerlocal", function(req, res){
Users.register(new Users({
     username : req.body.username,
     phonenumber: req.body.phonenumber,
     isadmin:false,
     islocal:true
}),
    req.body.password, function(err, user){
       if(err){
            console.log(err);
            return res.render('register');
}
    res.redirect("/login");
  });
});


app.post("/register", function(req, res){
Users.register(new Users({
     username : req.body.username,
     phonenumber: req.body.phonenumber,
     isadmin:false,
     islocal:false
}),
    req.body.password, function(err, user){
       if(err){
            console.log(err);
            return res.render('register');
}
    res.redirect("/login");
  });
});

app.post("/login", passport.authenticate(("local"), {
      failureRedirect: "/login"
   }), function(req, res) {
     res.redirect("/");
});


app.listen(port, () =>{
console.log("server is listening on port " + port);
});


function isLoggedIn(req, res, next){
  if(!req.user){
    return res.redirect("/login");
  }else{
    next();
  }
}

function isNotLoggedIn(req, res, next){
  if(req.user){
    res.redirect("/");
  }else{
    next()
  }
}
