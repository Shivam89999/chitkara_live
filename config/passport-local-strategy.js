const passport = require("passport");
const User = require("../model/user");
const LocalStrategy = require("passport-local").Strategy;

//authenticate using passport
passport.use(
    new LocalStrategy({
            usernameField: "email",
        },
        function(email, password, done) {
            //find user and extablish the identity
            User.findOne({ email: email })
                .select("+password")
                .exec(function(err, user) {
                    if (err) {
                        console.log("Err in finding user in passport");
                        return done(err);
                    }
                    if (!user || user.password != password) {
                        console.log("Invalid username / password");
                        return done(null, false);
                    }
                    // console.log("user is ---- > ", user);
                    return done(null, user);
                });
        }
    )
);

//decide which key is kept in cookie
passport.serializeUser(function(user, done) {
    //console.log("user is -------- ", user);
    return done(null, user.id);
});

//deserialize the user from cookie
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        if (err) {
            console.log("err in de-serialize the user");
            return done(err);
        }
        if (!user) {
            console.log("not found the user for that key");
            return done(null, false);
        }
        console.log("de-serialize successfully");
        return done(null, user);
    });
});

passport.checkAuthentication = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    //render it to login page
    else return res.redirect("/user/sign-in");
};

passport.setAuthenticatedUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
};