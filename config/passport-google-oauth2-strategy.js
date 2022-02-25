const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("../model/user");
const Student = require("../model/student");
const crypto = require("crypto");
const Organiser = require("../model/organiser");
const newUserEnterMail = require("../mailers/new_user_enter");
const env = require("./environment");
//tell passport to use a new strategy for google login
passport.use(
    new googleStrategy({
            clientID: env.google_client_id,
            clientSecret: env.google_client_secret,
            callbackURL: env.google_callback_url,
        },
        function(accessToken, refreshToken, profile, done) {
            //find a user
            User.findOne({ email: profile.emails[0].value }).exec(function(
                err,
                user
            ) {
                if (err) {
                    console.log("err in google strategy passport: ", err);
                    return;
                }
                console.log("profile is ", profile);
                //if found than set this user as req.user means sign-in the user
                if (user) {
                    return done(null, {
                        organiser: false,
                        user: user,
                    });
                }
                //create | sign-up the user
                else {
                    User.create({
                            email: profile.emails[0].value,
                            password: crypto.randomBytes(20).toString("hex"),
                            name: profile.displayName,
                        },
                        function(err, user) {
                            if (err || !user) {
                                console.log(
                                    "err in creating user google strategy passport: ",
                                    err
                                );
                                return;
                            }
                            Student.create({ info: user.id }, async function(err, m) {
                                if (err || !m) {
                                    console.log(
                                        "err in linking user google strategy passport: ",
                                        err
                                    );
                                    return;
                                }
                                user.related = m.id;
                                user.onModel = "Student";
                                await user.save();
                                Organiser.find({}, function(err, orgs) {
                                    if (err || !orgs) {
                                        console.log(
                                            "err in finding organisers or no organiser found"
                                        );
                                    }
                                    for (let org of orgs) {
                                        newUserEnterMail.newUserEnterMail({
                                            targetEmail: org.email,
                                            user: user,
                                        });
                                    }
                                });
                                return done(null, {
                                    organiser: false,
                                    user: user,
                                });
                            });
                        }
                    );
                }
            });
        }
    )
);

module.exports = passport;