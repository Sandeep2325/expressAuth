// Using Sessions
require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
// ------------------------session andf cookies requirements-----------------
const session=require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;

// --------------------end of session and cookmies requirements--------------
// const encrypt=require("mongoose-encryption");

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
// console.log(process.env.SESSIONSECRET)

// -----------------------------------------session and cookie setup----------------------------------------
app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
  }))
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://127.0.0.1:27017/auths',{useNewUrlParser:true});
mongoose.set('strictQuery', false);
// mongoose.set("useCreateIndex", true);
 const userSchema= new mongoose.Schema({
email:String,
password:String
 })
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model("User",userSchema)

passport.use(User.createStrategy());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
    done(null, user);
    console.log("uuuuuuuu",user)
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
app.get("/",function(req,res){
    res.render("index.ejs")
})

app.route("/register")
.get(function(req,res){
    console.log(process.env.SECRET)
    res.render("register.ejs")
})
.post(function(req,res){
    email=req.body.email
    password=req.body.password
//    console.log(email,password)
User.register({username:req.body.email}, req.body.password, function(err,user){
    // console.log("-----------")
if(err){
    console.log(err);
    res.redirect("/register")
} else{
    passport.authenticate("local", function (err, user, info) {
        console.log("----------",err,user,info)
        if (err) {
            res.json({ success: false, message: err });
        }
        else {
            if (!user) {
                res.json({ success: false, message: "username or password incorrect" });
            }else {
                req.redirect("/home")
                // const token = jwt.sign({ userId: user._id, username: user.username }, secretkey, { expiresIn: "24h" });
                // res.json({ success: true, message: "Authentication successful", token: token });
            }
        }
    })
    // passport.authenticate("local")(req, res, function(){
    //     console.log(req)
    //     res.redirect("/home");
    // });
//     const authenticate = User.authenticate();
//     authenticate(req.body.email, req.body.password, function(err, result) {
//     if (err) { 
//         console.log(err)
//      }else{
//         console.log("----------",result)
//         res.redirect("/home")
//      }
//   });
}
})
});

app.route("/login")
.get(function(req,res){
    res.render("login.ejs")

})
.post(function(req,res){
  const user = new User({
email:req.body.email,
password:req.body.password
  });
  req.login(user, function(err){
    if(err){
        console.log(err)
    }else{
        passport.authenticate("local")(req, res, function(){
            res.redirect("/home")
        });
    }
  })
});


app.route("/home")
.get(function(req,res){
    console.log(req.isAuthenticated())
    if(req.isAuthenticated()){
        res.render("home.ejs")
    }else{
        res.redirect("/login")
    }
});

app.listen(3001, function(){
    console.log("Server started on port 3001")
});
