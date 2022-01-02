const passport = require("passport");

const Organiser = require("../model/organiser");
const User = require("../model/user");
// const Student = require("../model/student");
// const Club = require("../model/club");
// const Staff = require("../model/staff");

const LocalStrategy = require("passport-local").Strategy;

//authenticate using passport
passport.use(
    new LocalStrategy({
            usernameField: "email", //it is passed at second argument if passReq is true otherwise as first arg
            passwordField: "password", //it will pass at next of usernameField
            passReqToCallback: true,
        },
        function(req, email, password, done) {
            //  console.log("come    tttttttttttttttttttttttttttttttttttt");
            //find user and extablish the identity
            if (req.body && req.body.isOrganiser === "organiser") {
                //   console.log("email is ", email);
                Organiser.findOne({ email: email })
                    .select("+password")
                    .exec(function(err, organiser) {
                        if (err) {
                            console.log("err in finding organiser");
                            return done(err);
                        }
                        if (organiser && organiser.password === password) {
                            console.log("user authenticated successfully");
                            return done(null, {
                                organiser: true,
                                user: organiser,
                            });
                        }
                        console.log("Invalid username | password");
                        return done(null, false);
                    });
            }
            //else if (req.user) {
            // console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG");
            // User.findById(req.user.related.head)
            //     .populate("related")
            //     .exec(function(err, user) {
            //         console.log("found &&&&&&&&&&&&", user);
            //         if (err) return done(err);

            //         return done(null, {
            //             organiser: false,
            //             user: user,
            //         });
            //     });
            //}
            else {
                //console.log("in");
                User.findOne({ email: email })
                    .select("+password")
                    .populate("related")
                    .exec(function(err, user) {
                        if (err) {
                            console.log("Err in finding user in passport");
                            return done(err);
                        }
                        if (!user || user.password != password) {
                            console.log("Invalid username / password");
                            return done(null, false);
                        }
                        // console.log("tick is ", req.body.tick);
                        if (!req.body.tick) {
                            console.log("Tick First");
                            return done(null, false);
                        }
                        if (req.body.tick != user.onModel) {
                            console.log("Model not match");
                            return done(null, false);
                        }
                        console.log("user authenticate successfully");
                        // console.log("user is ---- > ", user);
                        return done(null, {
                            organiser: false,
                            user: user,
                        });
                    });
            }
        }
    )
);

//decide which key is kept in cookie
passport.serializeUser(function({ organiser, user }, done) {
    //console.log("user is -------- ", user);
    return done(null, {
        organiser: organiser,
        id: user.id,
    });
});

//deserialize the user from cookie
passport.deserializeUser(function({ organiser, id }, done) {
    //deserialize a organiser
    if (organiser) {
        Organiser.findById(id, function(err, user) {
            if (err) {
                console.log("err in deserialize the organiser", err);
                return done(err);
            }
            if (!user) {
                console.log("organiser not found for that key ---> deserializer");
                return done(null, false);
            }
            console.log("deserialize the organiser successfully");
            return done(null, user);
        });
    }
    //deserialize a user
    else {
        User.findById(id)
            .populate("related")
            .exec(function(err, user) {
                if (err) {
                    console.log("err in de-serialize the user");
                    return done(err);
                }
                if (!user) {
                    console.log("not found the user for that key");
                    return done(null, false);
                }
                console.log("de-serialize successfully");
                return done(null, {
                    user: user,
                    myUser: user,
                });
            });
    }
});

passport.checkAuthentication = function(req, res, next) {
    console.log("in ****** ", req.isAuthenticated());
    if (req.isAuthenticated()) {
        next();
    }
    //render it to login page
    else return res.redirect("/sign-in");
};

passport.checkCreator = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect("/sign-in");
    }
    let findType = req.user.myUser.onModel;
    let allowedCreatorType = ["Club", "Hostel", "Depart"];
    if (allowedCreatorType.includes(findType)) {
        next();
    } else {
        console.log("you are not authorized to create");
        return res.redirect("back");
    }
};

passport.checkOrganiser = function(req, res, next) {
    // console.log("#### in right");
    if (!req.isAuthenticated()) {
        console.log("not authorized");
        return res.redirect("/organiser/sign-in");
    }
    Organiser.findById(req.user.id, function(err, user) {
        if (err) {
            console.log("err in check organiser ", err);
            return res.redirect("back");
        }
        if (!user) {
            console.log("you are not organiser");
            return res.redirect("back");
        }
        console.log("organiser req is authenticated");
        next();
    });
};

passport.notOrganiser = function(req, res, next) {
    if (!req.isAuthenticated()) {
        console.log("not authorized");
        return res.redirect("/sign-in");
    }
    Organiser.findById(req.user.id, function(err, user) {
        if (!user) {
            next();
        } else {
            console.log("you are organiser you can't access this ");
            return res.redirect("/organiser");
        }
    });
};

passport.setAuthenticatedUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user.myUser;
    }
    next();
};