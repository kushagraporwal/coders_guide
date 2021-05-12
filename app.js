// requiring all packages
const express = require('express');
const expresslayouts= require('express-ejs-layouts');
const mongoose = require('mongoose');
const session= require('express-session');
const passport= require('passport');
const passportLocalMongoose= require('passport-local-mongoose');
const localstrategy= require('passport-local');
const flash= require('connect-flash');
const bcrypt= require('bcrypt');
const app = express();
const ejs = require('ejs');
const router = express.Router();
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:false}));
const path = require('path');
const port = process.env.PORT || 3000;
var lg=0;
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));
var items= [];
const Db='mongodb+srv://kushagra:kushagraiiitp@cluster0.q3rca.mongodb.net/codersGuide?retryWrites=true&w=majority';
app.use(session({
    secret: 'Our little secret',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) =>{
    res.locals.success_msg= req.flash('success_msg');
    res.locals.error_msg= req.flash('error_msg');
    res.locals.error= req.flash('error');
    next();
});

// connecting to the database
mongoose.connect(Db, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=> {
    console.log(`Connection Successful`);
}).catch((e)=>{
    console.log(`No connection`);
})
mongoose.set("useCreateIndex", true);
const User= require("./models/users");
const Blogs= require("./models/blogslist");
passport.use(
    new localstrategy({usernameField: 'email'}, (email, password, done) =>{
        User.findOne({email: email}).then(user =>{
            if(!user){
                return done(null, false, {message: 'email is not registered'});
            }
            bcrypt.compare(password, user.password, (err, isMatch) =>{
                if(err){
                    throw err;
                }
                if(isMatch){
                    return done(null, user);
                }
                else{
                    return done(null, false, {message: 'Incorrect Password'});
                }
            });
        }).catch(err => console.log(err));
    })
);
passport.serializeUser((user, done) =>{
    done(null , user.id);
});
passport.deserializeUser((id, done) =>{
    User.findById(id, (err, user) =>{
        done(err, user);
    });
});

//routes
app.get("/", function(req, res){
    res.render('home');
});
app.get("/login", function(req, res){
    res.render('login');
});
app.get("/register", function(req, res){
    res.render('register');
});
app.get("/logout", function(req, res){
    lg=0;
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});
app.get("/blogpage", function(req, res){
    if(req.isAuthenticated()){
        Blogs.find({}, function(err, founditems)
        {
        res.render("blogpage", {
            name: req.user.name,
            blogs: founditems
        });
    });
    }
    else{
        lg=1;
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/login');
    }
});
var name1= "";
app.get("/create", function(req, res){
    if(req.isAuthenticated()){
        res.render("create", {
            name: req.user.name
        });
        name1= req.user.name;
    }
    else{
        lg=2;
        req.flash('error_msg', 'Please log in to add a blog');
        res.redirect('/login');
    }
});

app.post("/create", function(req, res){
    const item= new Blogs({
        name: name1,
        blog: req.body.newblog,
        date: new Date().toLocaleDateString()
    });
    item.save();
    res.redirect("/blogpage");
});

//login and register
app.post("/register",function(req,res){
    const { name, email, password, password2 } = req.body;
    let errors= [];
    if(!name || !email || !password || !password2){
        errors.push({msg: "Please fill in all fields"});
    }
    if(password2 !==password){
        errors.push({msg: "Passwords do not match"});
    }
    if(errors.length>0){
        res.render('register', {
            errors, name, email, password, password2
        });
    }
    else{
        User.findOne({email: email}).then(user => {
            if(user){
                errors.push({msg: "Email already registered"});
                res.render('register', {
                    errors, name, email, password, password2
                });
            }
            else{
                const newuser= new User({
                    name, email, password
                });
                bcrypt.genSalt(10, (err, salt)=>
                bcrypt.hash(newuser.password, salt, (err, hash) => {
                    if(err)
                    {
                    throw err;
                    }
                    newuser.password= hash;
                    newuser.save().then(user =>{
                        req.flash('success_msg', 'Successfully registered, now log in');
                        res.redirect("/login");
                    })
                    .catch(err => console.log(err));
                }))
            }
        });
    }
});
app.post("/login",function(req,res, next){
    if(lg==0){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);}
    else if(lg==1){
        passport.authenticate('local', {
            successRedirect: '/blogpage',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);}
    else if(lg==2){
        passport.authenticate('local', {
            successRedirect: '/create',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);}
});
app.get("*", (req, res)=>{
    res.send("404 error page does not exists");
});
app.listen(port, ()=>{
    console.log(`Listening to port no. ${port}`)
});
module.exports = router;