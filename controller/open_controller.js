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
        allAlerts = [],
        allPolls = [];

    await addPost(Post);

    await addPost(TextPost);
    await FindUpcomingOrRunningEvents();
    await findAllAlerts();

    async function findAllAlerts() {
        allAlerts = await Alert.find({}).populate("creator").exec();
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
                    populate: {
                        path: "creator",
                    },
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
        return a.updatedAt - b.updatedAt;
    });
    const all_notices = await Notice.find({});
    all_polls = await Poll.find({});
    var noOfComingRequests = 0;
    if (req.user && req.user.myUser) {
        noOfComingRequests = req.user.myUser.related.comingRequest.length;
    }
    console.log("******************* ", upcomingOrRunningEvents);
    return res.render("home", {
        title: "Home ",
        posts: all_posts,
        alerts: allAlerts,
        noOfNotices: all_notices.length,
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
    return res.render("option_page", {
        title: "Search Result Page",
        options: results,
        type: "Search Result",
    });
}

function notices(req, res) {
    Notice.find({})
        .populate("creator")
        .exec(function(err, notices) {
            if (err) {
                console.log("err in finding notice");
                return res.redirect("back");
            }
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
    let results = await findResults(req, res);
    let newResults = await results.filter(function(item) {
        return item.onModel == "Student";
    });
    return res.render("select_user_page", {
        title: "Select User To add new Team Member Page",
        results: newResults,
    });
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
};