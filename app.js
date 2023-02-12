require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
app.listen(3000, function(){
    console.log("Server started on port 3000")
});
mongoose.connect('mongodb://127.0.0.1:27017/auths');
mongoose.set('strictQuery', false);
 const userSchema= new mongoose.Schema({
email:String,
password:String
 })
const User=mongoose.model("User",userSchema)
app.get("/",function(req,res){
    res.render("index.ejs")
})

app.route("/register")
.get(function(req,res){
    console.log(process.env.SECRET)
    res.render("register.ejs")

})
.post(function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        email=req.body.email
    password=hash
    console.log(email,password)
    const newuser= new User({
        email:email,
        password:password,
    })
    newuser.save(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/login")
        }
    });
    });


    
});

app.route("/login")
.get(function(req,res){
    res.render("login.ejs")

})
.post(function(req,res){
    email=req.body.email
    password=req.body.password
    console.log(email,password)
    User.findOne({
        email:email
    },function(err,user){
        if(err){
            console.log(err)
        }else{
           
            console.log(user)
            if(user){
                bcrypt.compare(password, user.password, function(err, result) {
                    // result == true
                    if(result===true){
                        res.render("home.ejs")
                    }
                    else{
                        res.redirect("/login")
                    }
                });
            }
        }
    })
  
});
