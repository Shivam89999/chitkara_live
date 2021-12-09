const User = require("../model/user");

function userProfile(req, res) {
    console.log("req.url is ", req.url);
    return res.render("user_profile");
}

function create(req, res) {
    //first user email is valid and check via sending otp

    //check the user
    if (!req.body.email || !req.body.password) {
        console.log("email or password can't be empty: ", req.body);
        return res.redirect("back");
    }
    if (req.body.password != req.body.confirm_password) {
        console.log("password or confirm password not matched ");
        return res.redirect("back");
    }

    //first check email already exist or not
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            console.log("Err in finding the user for given email", err);
            return res.redirect("back");
        }
        if (user) {
            console.log("This Email is Already Exist ", user);
            return res.redirect("back");
        }
        //create user in db
        User.create(req.body, function(err, user) {
            if (err) {
                console.log("Err in creating the user ", err);
                return res.redirect("back");
            }
            console.log("user created successfully: ");
        });
        return res.redirect("back");
    });
}

function createSession(req, res) {
    console.log("req.user is ", req.user);
    return res.redirect("/");
}

function signUp(req, res) {
    return res.render("sign_up");
}

function signIn(req, res) {
    return res.render("sign_in");
}

function update(req, res) {
    User.uploadAvatar(req, res, function(err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                console.log("file is too large max size allowed is 5mb");
                return res.redirect("back");
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                console.log("Too many files, max 5 allowed");
                return res.redirect("back");
            }
            console.log("err in processing multipart-data with multer: ", err);
            return res.redirect("back");
        }
        for (let file of req.files) {
            console.log("file is save successfully ", file);
        }
        return res.redirect("back");
    });
}

module.exports = {
    userProfile,
    create,
    signUp,
    signIn,
    createSession,
    update,
};