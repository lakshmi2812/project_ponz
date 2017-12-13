var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
const User = require("./models/User");
var logger = require("morgan");

const expressSession = require("express-session");

const flash = require("express-flash");

var app = express();

// Local
app.locals.appName = "Ponzi-Time";

// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require("morgan");
const morganToolkit = require("morgan-toolkit")(morgan, {
  req: ["cookies" /*, 'signedCookies' */]
});

app.use(morganToolkit());

// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require("express-handlebars");
const helpers = require("./helpers");

const hbs = expressHandlebars.create({
  helpers: helpers,
  partialsDir: "views/",
  defaultLayout: "application"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// ----------------------------------------
// Flash Messages
// ----------------------------------------
const flashMessages = require("express-flash-messages");
app.use(flashMessages());

// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ----------------------------------------
// Sessions/Cookies
// ----------------------------------------
const cookieParser = require("cookie-parser");

app.use(cookieParser());

// ----------------------------------------
// Express Session
// ----------------------------------------
app.use(flash());
app.use(
  expressSession({
    secret: process.env.secret || "keyboard cat",
    saveUninitialized: false,
    resave: false
  })
);

// ----------------------------------------
// Passport
// ----------------------------------------
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(passport.initialize());
app.use(passport.session());

// ----------------------------------------
//middleware to connect to MongoDB via mongoose in your `app.js`
// ----------------------------------------
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/assignment_ponz_scheme");
app.use((req, res, next) => {
  if (mongoose.connection.readyState) {
    next();
  } else {
    require("./mongo")().then(() => next());
  }
});

// ----------------------------------------
// Public
// ----------------------------------------
app.use(express.static(`${__dirname}/public`));

//---------------------
//**Local Strategy
//---------------------
passport.use(
  new LocalStrategy({ usernameField: "email" }, function(
    email,
    password,
    done
  ) {
    User.findOne({ email }, function(err, user) {
      if (err) return done(err);
      if (!user || !user.validPassword(password)) {
        return done(null, false, { message: "Invalid email/password" });
      }
      return done(null, user);
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// ----------------------------------------
//Routes
// ----------------------------------------
app.get("/", async (req, res) => {
  try {
    console.log(req.session.passport);
    if (req.session.passport && req.session.passport.user) {
      let currentUser = await User.findById(req.session.passport.user);
      let link = currentUser._id;
      res.render("welcome/index", { currentUser, link });
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/referredby/:id", (req, res) => {
  let referrer = req.params.id;
  res.redirect(`/register/${referrer}`);
});

app.get("/register/:id", (req, res) => {
  res.render("register");
});

app.post("/register/:id", async (req, res, next) => {
  let id = await (req.params.id).substring(3)
  console.log(id)
  console.log("$#$#$#$#$#$#$#$#$#$")
  let parent = await User.findById(id);
  const { email, password, username } = req.body;
  //let referralLink = "";
  const user = new User({ email, password, username, parent: parent._id });
  user.save(err => {
    res.redirect("/login");
    // req.login(user, function(err) {
    //   if (err) {
    //     return next(err);
    //   }
    //   return res.redirect("/");
    // });
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.post("/register", async (req, res, next) => {
  const { email, password, username } = req.body;
  //let referralLink = "";
  const user = new User({ email, password, username });
  user.save(err => {
    res.redirect("/login");
    // req.login(user, function(err) {
    //   if (err) {
    //     return next(err);
    //   }
    //   return res.redirect("/");
    // });
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("login");
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// catch 404 and forward to error handler
//app.get("/:referralid", function(req,res){
//referalid = req.params.referralid
/*User.findOne({ email }, function(err, user) {
      if (err) return done(err);
      if (!user || !user.validPassword(password)) {
        return done(null, false, { message: "Invalid email/password" });
      }
      return done(null, user);
    });*/

//})
// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT || process.argv[2] || 3000;
const host = "localhost";

let args;
process.env.NODE_ENV === "production" ? (args = [port]) : (args = [port, host]);

args.push(() => {
  console.log(`Listening: http://${host}:${port}\n`);
});

if (require.main === module) {
  app.listen.apply(app, args);
}

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  res.status(500).render("errors/500", { error: err });
});

module.exports = app;
