const express = require("express");
const app = express();
const User = require("./models");

// Templates
const expressHandlebars = require("express-handlebars");
const hbs = expressHandlebars.create({ defualtLayout: "applicatoin"});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Post data
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Session
const expressSession = require("express-session");
const MongoStore = require("connect-mongo")(expressSession);
app.use(
  expressSession({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SEC || "You must generate a random session secret",
    store: new MongoStore({url:'mongodb://localhost:27017/passport'})
  })
);

// Flash
const flash = require("express-flash-messages");
app.use(flash());

// Connect to mongoose
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
app.use((req, res, next)=>{
  if (mongoose.connection.readyState) next();
  else {
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/passport";
    mongoose
      .connect(mongoUrl, { useMongoClient: true})
      .then(()=>next())
      .cache(err => console.error('Mongoose Error: ${err.stack}'));
  }
});

// Passport
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(userId, done) {
  User.findById(userId, (err, user) => done(err, user));
});

// Passport local
const LocalStrategy = require("passport-local").Strategy;
const local = new LocalStrategy((username, password, done)=>{
  User.findOne({ username })
    .then(user=>{
      if(!user||!user.validPassword(password)) {
        done(null, false, { message: "Invalid username/password" });
      } else {
        done(null, user);
      }
    })
    .cache(e=>done(e));
});
passport.use("local", local);

//Routes
app.use("/", require("./routes")(passport));

// Start Server
app.listen(3000, "localhost", ()=>console.log("Up and Running"));
