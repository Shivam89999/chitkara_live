const db = require("../config/mongoose");
const User = require("../model/user");
const Student = require("../model/student");
const Hostel = require("../model/hostel");
const Depart = require("../model/depart");
const Comment = require("../model/comment");
const Club = require("../model/club");
const Post = require("../model/post");
const TextPost = require("../model/textPost");
const Notices = require("../model/notice");
const path = require("path");
const fs = require("fs");
const Like = require("../model/like");
const Notice = require("../model/notice");
const Alert = require("../model/alert");
const Poll = require("../model/poll");
const FoodDetail = require("../model/foodDetail");
const DayMenuDetail = require("../model/dayMenuDetail");
const Menu = require("../model/menu");
const otpStore = require("../model/otpStore");
const verifiedEmail = require("../model/verifiedEmail");
const req = require("express/lib/request");
const res = require("express/lib/response");
const otpMail = require("../mailers/post_mailer");
// const forgotPasswordVerifiedEmail = require("../model/forgotPasswordVerifiedEmail");
const forgotPasswordVerifiedEmail = require("../model/forgotPasswordVerifiedEmail");
async function updatePasswordWithSecret(req, res) {
    try {
        let secret = req.body.secret;
        let password = req.body.password;

        let confirm_password = req.body.confirm_password;
        console.log("password ", password, " confirm password ", confirm_password);
        if (password != confirm_password) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "password and confirm_password are different",
                });
            }
            console.log("password and confirm password is different");
            return res.redirect("back");
        }
        let found = await forgotPasswordVerifiedEmail.findById(secret);
        if (!found) {
            if (req.xhr) {
                return res.status(401).json({
                    err: "its seems that your email is not verified",
                });
            }
            console.log("its seems that your email is not verified");
            return res.redirect("back");
        }
        let email = found.email;
        let user = await User.findOne({ email: email });
        if (!user) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "this email is not registered",
                });
            }
            console.log("this email is not registered");
            return res.render("sign_in", {
                title: "Sign-In Page",
                layout: "./layouts/some_layout",
                type: null,
            });
        }
        user.password = password;
        await found.remove();
        await user.save();

        if (req.xhr) {
            return res.status(200).json({
                err: "your password chaanged successfully, now sign-in with new password",
            });
        }
        return res.redirect("/sign-in");
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                err: "err in new password set  " + err,
            });
        }
        console.log("err in new password set  ", err);
        return res.redirect("back");
    }
}

async function signUpWithSecret(req, res) {
    try {
        let secret = req.body.secret;
        let password = req.body.password;
        let name = req.body.name;
        let confirm_password = req.body.confirm_password;
        if (password != confirm_password) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "password and confirm_password are different",
                });
            }
            console.log("password and confirm password is different");
            return res.redirect("back");
        }
        let found = await verifiedEmail.findById(secret);
        if (!found) {
            if (req.xhr) {
                return res.status(401).json({
                    err: "its seems that your email is not verified",
                });
            }
            console.log("its seems that your email is not verified");
            return res.redirect("back");
        }
        let email = found.email;
        let user = await User.findOne({ email: email });
        if (user) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "this email is already registered",
                });
            }
            console.log("this email is already registered");
            console.log("try using different email");
            return res.render("sign_in", {
                title: "Sign-In Page",
                layout: "./layouts/some_layout",
                type: null,
            });
        }
        user = await User.create({ email: email, password: password, name: name });
        let m = await Student.create({ info: user.id });
        if (!m) {
            if (req.xhr) {
                return res.status(500).json({
                    err: "Internal server Err, can not link the user",
                });
            }
            console.log("Err in link user to respected model");
            return res.redirect("back");
        }
        user.related = m.id;
        user.onModel = "Student";
        await user.save();
        await found.remove();
        if (req.xhr) {
            return res.status(200).json({
                message: "you sign-up successfully, now sign-in with this  email and password",
            });
        }
        return res.redirect("/sign-in");
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                message: "err in sign-up " + err,
            });
        }
        console.log("err in sign-in with intial data is ", err);
        return res.redirect("back");
    }
}

function create(req, res) {
    //first user email is valid and check via sending otp
    console.log("in create ^^^^^^^^^^^^^^^^^^^^^^^ ", req.body);
    //check the user
    if (!req.body.email || !req.body.password) {
        console.log("email or password can't be empty: ", req.body);
        return res.redirect("back");
    }
    if (req.body.password != req.body.confirm_password) {
        console.log("password or confirm password not matched ");
        return res.redirect("back");
    }
    if (!req.body.tick) {
        console.log("tick first");
        return res.redirect("back");
    }
    if (!req.body.name) {
        console.log("name can not be empty");
        return res.redirect("back");
    }
    let findModel =
        req.body.tick === "Student" ?
        Student :
        req.body.tick === "Hostel" ?
        Hostel :
        req.body.tick === "Club" ?
        Club :
        req.body.tick == "Depart" ?
        Depart :
        null;
    if (!findModel) {
        console.log("Tick Right Option First");
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
        User.create(req.body, async function(err, user) {
            if (err) {
                console.log("Err in creating the user ", err);
                return res.redirect("back");
            }
            console.log("user created successfully: ");
            var menuId = null;
            if (req.body.tick == "Hostel") {
                //sign up user type is hostel so add default menu for hostel
                var dayMenuArray = [];
                for (var k = 0; k < 8; k++) {
                    var timeFood = [];
                    for (let i = 0; i < 4; i++) {
                        var foodDetail = await FoodDetail.create({});
                        timeFood.push(foodDetail.id);
                    }
                    var dayMenu = await DayMenuDetail.create({
                        timeFood: timeFood,
                    });
                    // dayMenu.push(timeFood);
                    dayMenuArray.push(dayMenu.id);
                }
                var menu = await Menu.create({
                    dayWise: dayMenuArray,
                    heading: req.body.name + " Hostel chitkara university himachal pradesh",
                });
                menuId = menu.id;
            }
            console.log("menuId is ", menuId);
            findModel.create({ info: user.id, menu: menuId },
                async function(err, m) {
                    if (err) {
                        console.log("Err in link user to respected model");
                        return res.redirect("back");
                    }
                    user.related = m.id;
                    user.onModel = req.body.tick;
                    user.save();

                    console.log("user is ", user);
                }
            );
            return res.redirect("/sign-in");
        });
    });
}

function createSession(req, res) {
    console.log("req.user is ", req.user);
    return res.redirect("/");
}

function signUp(req, res) {
    if (req.user) {
        console.log("you already sign-in");
        return res.redirect("back");
    }
    return res.render("sign_up", {
        title: "Sign-Up Page",
        layout: "./layouts/some_layout",
    });
}

function signIn(req, res) {
    if (req.user) {
        console.log("you already sign-in");
        return res.redirect("back");
    }
    return res.render("sign_in", {
        title: "Sign-In Page",
        layout: "./layouts/some_layout",
        type: "sign-up-send-otp",
    });
}

function findOptions(req, res) {
    let type = req.query.type;
    let allowedType = ["Club", "Hostel", "Depart"];
    if (!allowedType.includes(type)) {
        console.log("this type is not allowed ");
        return res.redirect("back");
    }
    User.find({ onModel: type }, function(err, options) {
        if (err) {
            console.log("Type is ", type);
            console.log("err in finding all options", err);
            return res.redirect("back");
        }
        return res.render("option_page", {
            title: type + " Page",
            options: options,
            type: type,
        });
    });
}

async function homePage(req, res) {
    // console.log("req.url is ", req.url);
    // Post.find({})
    //     // .populate("comments")
    //     .populate("creator")
    //     .exec(function(err, post_list) {
    //         let posts = [];
    //         if (err) {
    //             console.log("Err in Finding the posts", err);
    //             posts = post_list;
    //         }
    //         console.log("posts are ", posts);
    //         return res.render("home", {
    //             title: "This is Home Page",
    //             posts: posts,
    //         });
    //     });
    //  console.log("req.user ", req.user);

    let all_posts = [],
        upcomingOrRunningEvents = [],
        allAlerts = [];

    await addPost(Post);

    await addPost(TextPost);
    await FindUpcomingOrRunningEvents();
    await findAllAlerts();

    async function findAllAlerts() {
        allAlerts = await Alert.find({}).exec();
    }
    async function FindUpcomingOrRunningEvents() {
        let current = new Date();
        console.log("current is ", current);
        upcomingOrRunningEvents = await Post.find({
                eventStartTime: { $exists: true },
                eventEndTime: { $exists: true },
                eventEndTime: { $gte: current },
            })
            .populate("creator")
            .sort({ updatedAt: -1 })
            .exec();
    }

    async function addPost(model) {
        let posts = await model
            .find({})
            .populate("creator")
            .populate([{
                    path: "comments",
                    populate: [{
                            path: "creator",
                        },
                        { path: "likes" },
                    ],
                },
                {
                    path: "likes",
                    populate: {
                        path: "creator",
                        options: { limit: 15 },
                    },
                },
            ])
            .sort({ updatedAt: -1 })
            .exec();
        all_posts = all_posts.concat(posts);
    }
    //sort the all post based on time of creatio
    all_posts.sort((a, b) => {
        return b.createdAt - a.createdAt;
    });
    // console.log("all ******* ", all_posts[0].comments[0].likes);
    const all_notices_length = await Notice.count();
    let all_polls = await Poll.find({});
    var noOfComingRequests = 0;
    if (req.user && req.user.myUser) {
        // noOfComingRequests = req.user.myUser.related.comingRequest.length;
        noOfComingRequests = 0;
    }
    console.log("******************* ", upcomingOrRunningEvents);
    // req.flash("success", "you are at home page");
    return res.render("home", {
        title: "Home ",
        posts: all_posts,
        alerts: allAlerts,
        noOfNotices: all_notices_length,
        noOfComingRequests: noOfComingRequests,
        upcomingOrRunningEvents: upcomingOrRunningEvents,
        polls: all_polls,
    });
}

async function findResults(req, res) {
    let results = await User.find({
        name: { $regex: req.body.name, $options: "i" },
    });
    return results;
}

async function search(req, res) {
    try {
        console.log("req.name ", req.body.name);
        let results = await findResults(req, res);
        // User.find({ name: { $regex: req.body.name, $options: "i" } },
        //     function(err, results) {
        //         if (err) {
        //             console.log("err in searching  users: ", err);
        //             return res.redirect("back");
        //         }
        //         console.log("results ", results);
        //         return res.render("option_page", {
        //             title: "Search Result Page",
        //             options: results,
        //             type: "Search Result",
        //         });
        //     }
        // );
        if (req.xhr) {
            return res.status(200).json({
                data: { results: results },
                message: "search users ",
            });
        }
        return res.render("option_page", {
            title: "Search Result Page",
            options: results,
            type: "Search Result",
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "err in finding user is " + err,
            });
        }
        console.log("err in finding user is ", err);
        return res.redirect("back");
    }
}

function notices(req, res) {
    Notice.find({})
        .sort({ createdAt: -1 })
        .populate([{
                path: "creator",
            },
            {
                path: "likes",
            },
        ])
        .exec(function(err, notices) {
            if (err) {
                console.log("err in finding notice");
                return res.redirect("back");
            }
            console.log("notices is ", notices);
            return res.render("notice", {
                title: "notice page",
                notices: notices,
            });
            // let file = notices[0];
            // return res.download(file, "some.pdf");
            // console.log("notices[0] ", notices[0]);
            // return res.download(
            //     path.join(__dirname, "..", notices[0].noticeFile),
            //     "jvjjfnvnf.pdf",
            //     (err) => {
            //         if (err) {
            //             console.log("Err in downloading the file ", err);
            //             return res.redirect("back");
            //         }
            //         console.log("profile photo downloaded successfully");
            //     }
            // );
        });
}

function homeOptionPage(req, res) {
    let allowedType = ["Club", "Hostel", "Depart"];
    if (!req.query || !req.query.type || !allowedType.includes(req.query.type)) {
        console.log("bad request ");
        return res.redirect("back");
    }
    let type = req.query.type;

    User.find({ onModel: type }, function(err, users) {
        if (err) {
            console.log("err in finding ", type);
            return res.redirect("back");
        }
        return res.render("home_option_page", {
            title: "Home Option Page",
            users: users,
            type: type,
        });
    });
}
async function searchStudents(req, res) {
    // console.log("reached ^^^^^^^^  ");
    // let results = await findResults(req, res);
    try {
        let results = await User.find({
            name: { $regex: req.body.name, $options: "i" },
            onModel: "Student",
        });
        // console.log("results are ^^^^^^^^^^^^^^^^ ", results);
        if (req.xhr) {
            return res.status(200).json({
                message: "student to add new Team Member",
                data: { results: results },
            });
        }
        return res.render("select_user_page", {
            title: "Select User To add new Team Member Page",
            results: results,
        });
    } catch (err) {
        console.log("err in finding students");
        if (req.xhr) {
            return res.status(500).json({
                err: "err in finding searched student : " + err,
            });
        }
        console.log("err in finding searched student");
        return res.redirect("back");
    }
}

function postForLocation(req, res) {
    if (!req.query.post) {
        console.log("invalid request");
        return res.redirect("back");
    }
    let postId = req.query.post;
    Post.findById(postId)
        .populate("creator")
        .exec(function(err, post) {
            if (err || !post) {
                console.log("err in finding post or may not exist");
                return res.redirect("back");
            }
            return res.render("event_location", {
                title: "Location Of Event ",
                post: post,
            });
        });
}
async function generateOtpAndStoreinOtpStore(email) {
    //generate a random 6-digit otp and save otp  temparary
    try {
        let otp = Math.floor(1000000 + Math.random() * 900000);
        let validTill = "" + new Date(new Date().getTime() + 10 * 60000).valueOf();
        let tmpStore = await otpStore.findOne({ email: email });
        if (tmpStore) {
            tmpStore.otp = otp;
            tmpStore.validTill = validTill;
            await tmpStore.save();
            //send otp to email
            console.log("otp send successfully   ");
        } else {
            let newTmpStore = await otpStore.create({
                email: email,
                otp: otp,
                validTill: validTill,
            });
        }

        return otp;
    } catch (err) {
        console.log("err in send otp-sign-up ", err);
    }
}
async function signUpOtp(req, res) {
    try {
        let email = req.body.email;
        let user = await User.findOne({ email: email });
        if (user) {
            console.log("this email is already registered");
            if (req.xhr) {
                return res.status(400).json({
                    err: "this email is already registered",
                });
            }
            console.log("this email is already registered");
            return res.redirect("back");
        }
        //generate a random 6-digit otp and save otp  temparary
        let otp = await generateOtpAndStoreinOtpStore(email);
        console.log("otp send ", otp);
        //send otp to email
        otpMail.otpLogin(otp, email);
        if (req.xhr) {
            return res.status(200).json({
                data: { email: email, type: "signUp" },
                message: "otp send successfully to your email",
            });
        }

        console.log("otp send successfully **  ", otp);
        // return res.redirect("back");
        return res.render("sign_in", {
            title: "Sign-In Page",
            layout: "./layouts/some_layout",
            type: "sign-up-verify-email",
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                err: "err in getting sign-up-otp: " + err,
            });
        }
        console.log("err in get sign-up-otp ", err);
        return res.redirect("back");
    }
}

async function forgotPasswordOtp(req, res) {
    try {
        let email = req.body.email;
        let user = await User.findOne({ email: email });
        if (!user) {
            console.log("this email is not registered found");
            if (req.xhr) {
                return res.status(404).json({
                    err: "this email is not  registered",
                });
            }
            console.log("this email is not registered");
            return res.redirect("back");
        }
        //generate a random 6-digit otp and save otp  temparary
        let otp = await generateOtpAndStoreinOtpStore(email);
        console.log("otp send ", otp);
        //send otp to email
        otpMail.otpLogin(otp, email);
        if (req.xhr) {
            return res.status(200).json({
                data: { email: email, type: "forgotPassword" },
                message: "otp send successfully to your email",
            });
        }

        console.log("otp send successfully **  ", otp);
        // return res.redirect("back");
        return res.render("sign_in", {
            title: "Sign-In Page",
            layout: "./layouts/some_layout",
            type: "sign-in-verify-email",
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                err: "err in getting forgot-password-otp: " + err,
            });
        }
        console.log("err in get forgot-password-otp ", err);
        return res.redirect("back");
    }
}

async function signupEmailVerification(req, res) {
    try {
        let email = req.body.email;
        let otp = parseInt(req.body.otp);
        let exist = await otpStore.findOne({ email: email });
        if (!exist) {
            if (req.xhr) {
                return res.status(401).json({
                    err: "we did not recorgnise u",
                });
            }
            console.log("we did not recorgnise u");
            return res.redirect("back");
        }

        let valid = await otpValidation(exist, otp);

        if (!valid) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "your otp did not match | expires",
                });
            }
            console.log("your otp did not match | expires");
            return res.redirect("back");
        }
        console.log("email is varified successfully");
        //now add this email in verified email db
        //steps
        //check this email is already verified or not
        //if already verified and than delete that instance
        await verifiedEmail.deleteMany({ email: email });

        // create new document
        let doc = await verifiedEmail.create({ email: email });
        if (!doc) {
            if (req.xhr) {
                return res.status(500).json({
                    err: "internal server, can not verified your email, start process from begining",
                });
            }
            console.log(
                "internal server, can not verified your email, start process from begining"
            );
            return res.redirect("back");
        }
        console.log("email verified ^^ successfully");
        //delete otpStore document
        await exist.remove();
        //send doc.id back
        if (req.xhr) {
            return res.status(200).json({
                message: "email verified successfully",
                data: { secret: "" + doc.id, type: "signUp" },
            });
        }
        // return res.redirect("back");
        return res.render("sign_in", {
            type: "sign-up-after-email-verified",
            title: "Sign-In Page",
            layout: "./layouts/some_layout",
            secret: doc.id + "",
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                err: "sign-up email verification err: " + err,
            });
        }
        console.log("err in sign-up email verification err : ", err);
        return res.redirect("back");
    }
}
async function otpValidation(exist, otp) {
    let currenTime = parseInt(new Date().valueOf());
    let validTime = parseInt(new Date(exist.validTill).valueOf());
    if (validTime < currenTime || otp != parseInt(exist.otp)) {
        return false;
    }
    return true;
}
async function forgotPasswordEmailVerification(req, res) {
    try {
        let email = req.body.email;
        let otp = parseInt(req.body.otp);
        let exist = await otpStore.findOne({ email: email });
        if (!exist) {
            if (req.xhr) {
                return res.status(401).json({
                    err: "we did not recorgnise u",
                });
            }
            console.log("we did not recorgnise u");
            return res.redirect("back");
        }
        let valid = await otpValidation(exist, otp);

        if (!valid) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "your otp did not match | expires",
                });
            }
            console.log("your otp did not match | expires");
            return res.redirect("back");
        }
        console.log("email is varified successfully");
        //now add this email in verified email db
        //steps
        //check this email is already verified or not
        //if already verified and than delete that instance
        await forgotPasswordVerifiedEmail.deleteMany({ email: email });

        // create new document
        let doc = await forgotPasswordVerifiedEmail.create({ email: email });
        if (!doc) {
            if (req.xhr) {
                return res.status(500).json({
                    err: "internal server, can not verified your email, start process from begining",
                });
            }
            console.log(
                "internal server, can not verified your email, start process from begining"
            );
            return res.redirect("back");
        }
        console.log("email verified ^^ successfully");
        //delete otpStore document
        await exist.remove();
        //send doc.id back
        if (req.xhr) {
            return res.status(200).json({
                message: "email verified successfully",
                data: { secret: "" + doc.id, type: "forgotPassword" },
            });
        }
        // return res.redirect("back");
        return res.render("sign_in", {
            type: "sign-up-after-email-verified",
            title: "Sign-In Page",
            layout: "./layouts/some_layout",
            secret: doc.id + "",
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                err: "forgot password email verification err: " + err,
            });
        }
        console.log("err in forgot password email verification err : ", err);
        return res.redirect("back");
    }
}
async function resenOtpdMail(req, res, email) {
    try {
        let prevExist = await otpStore.findOne({ email: email });
        if (!prevExist) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "bad request",
                });
            }
            console.log("bad request");
            return res.redirect("back");
        }
        let otp = await generateOtpAndStoreinOtpStore(email);
        //send otp to email
        otpMail.otpLogin(otp, email);
        console.log("otp send successfully **  ", otp);
        if (req.xhr) {
            return res.status(200).json({
                message: "otp re-send successfully",
            });
        }
        return res.render("sign_in", {
            title: "Sign-In Page",
            layout: "./layouts/some_layout",
            type: "sign-up-verify-email",
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                err: "err in resend email otp  : " + err,
            });
        }
        console.log("err in resend email otp  : ", err);
        return res.redirect("back");
    }
}
async function resendOtpMailForSignUp(req, res) {
    try {
        let email = req.query.email;
        console.log("email is ", email);
        let user = await User.findOne({ email: email });
        if (user) {
            if (req.xhr) {
                return res.status(404).json({
                    err: "this email is already registered",
                });
            }
            console.log("this email is already registered");
            return res.redirect("back");
        }
        await resenOtpdMail(req, res, email);
        return;
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                err: "err in resend email otp for sign up : " + err,
            });
        }
        console.log("err in resend email otp for sign up : ", err);
        return res.redirect("back");
    }
}
async function resendOtpMailForForgotPassword(req, res) {
    try {
        let email = req.query.email;
        console.log("email is ", email);
        let user = await User.findOne({ email: email });
        if (!user) {
            if (req.xhr) {
                return res.status(404).json({
                    err: "this email is not registered",
                });
            }
            console.log("this email is not  registered");
            return res.redirect("back");
        }
        await resenOtpdMail(req, res, email);
        return;
    } catch (err) {
        if (req.xhr) {
            return res.status(401).json({
                err: "err in resend email otp for forgot password:  " + err,
            });
        }
        console.log("err in resend email otp for forgot password:", err);
        return res.redirect("back");
    }
}
module.exports = {
    homePage,
    signIn,
    signUp,
    createSession,
    create,
    findOptions,
    search,
    notices,
    searchStudents,
    homeOptionPage,
    postForLocation,
    signUpOtp,
    signupEmailVerification,
    resendOtpMailForSignUp,
    signUpWithSecret,
    forgotPasswordOtp,
    forgotPasswordEmailVerification,
    resendOtpMailForForgotPassword,
    updatePasswordWithSecret,
};