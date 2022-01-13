const User = require("../model/user");
const Student = require("../model/student");
const Hostel = require("../model/hostel");
const Depart = require("../model/depart");
const Comment = require("../model/comment");
const Club = require("../model/club");
const Post = require("../model/post");
const Notice = require("../model/notice");
const path = require("path");
const fs = require("fs");
const Like = require("../model/like");
const Alert = require("../model/alert");
const TextPost = require("../model/textPost");
const FoodDetail = require("../model/foodDetail");
const DayMenuDetail = require("../model/dayMenuDetail");
const Menu = require("../model/menu");

// function newPost(req, res) {
//     if (!req.user) {
//         console.log("Login First");
//         return res.redirect("/user/sign-in");
//     }
//     const type = req.user.onModel;
//     if (type != "Club") {
//         console.log("You can not create post : ", type);
//         return res.redirect("back");
//     }
//     Post.uploadFeed(req, res, function(err) {
//         if (err) {
//             if (err.code === "LIMIT_FILE_SIZE") {
//                 console.log("file is too large max size allowed is 5mb");
//                 return res.redirect("back");
//             }
//             if (err.code === "LIMIT_UNEXPECTED_FILE") {
//                 console.log("Too many files, max 5 allowed");
//                 return res.redirect("back");
//             }
//             console.log("Err in processing data of new post with multer ", err);
//             return res.redirect("back");
//         }
//         if (req.files.length === 0) {
//             console.log("Can not be created empty post");
//             return res.redirect("back");
//         }
//         const post_array = [];
//         for (let file of req.files) {
//             post_array.push(Post.feedPath + "/" + file.filename);
//         }
//         Post.create({ caption: req.body.caption, photos: post_array, creator: req.user.id },
//             function(err, post) {
//                 if (err || !post) {
//                     console.log("Some error in creating post", err);
//                     return res.redirect("back");
//                 }
//                 console.log("new post created successfully");
//                 //    console.log("req.user is ", req.user.related);
//                 req.user.related.posts.push(post.id);
//                 req.user.related.save();
//                 return res.redirect("/");
//             }
//         );
//     });
// }

function newPost(req, res) {
    if (!req.user || !req.user.myUser) {
        console.log("Login First");
        return res.redirect("/sign-in");
    }
    const type = req.user.myUser.onModel;
    console.log("type is ", type);
    // if (type != "Club") {
    //     console.log("You can not create post : ", type);
    //     return res.redirect("back");
    // }
    Post.uploadFeed(req, res, function(err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                console.log("file is too large max size allowed is 5mb");
                return res.redirect("back");
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                console.log("Too many files, max 5 allowed");
                return res.redirect("back");
            }
            console.log("Err in processing data of new post with multer ", err);
            return res.redirect("back");
        }
        if (req.files.length === 0) {
            console.log("Can not be created empty post");
            return res.redirect("back");
        }
        const post_array = [];
        for (let file of req.files) {
            post_array.push(Post.feedPath + "/" + file.filename);
        }
        let obj = {
            caption: req.body.caption,
            photos: post_array,
            creator: req.user.myUser.id,
        };
        if (req.body.eventStartTime) {
            //handle event timing restrication and event location
            obj.eventStartTime = req.body.eventStartTime;
            obj.eventEndTime = req.body.eventEndTime;
            obj.venu = req.body.venu ? req.body.venu : "";
        }
        console.log("obj is ", obj);
        Post.create(obj, function(err, post) {
            if (err || !post) {
                console.log("Some error in creating post", err);
                return res.redirect("back");
            }
            console.log("new post created successfully");
            //    console.log("req.user is ", req.user.related);
            req.user.myUser.related.posts.push(post.id);
            req.user.myUser.related.save();
            return res.redirect("/");
        });
    });
}

function deletePost(req, res) {
    if (!req.user) {
        console.log("login first");
        return res.redirect("/user/sign-in");
    }
    if (!req.query || !req.query.post) {
        console.log("bad request");
        return res.redirect("back");
    }
    //check post of that user or not
    if (req.user.posts && !req.user.posts.includes(req.query.post)) {
        console.log("not authorized");
        return res.redirect("back");
    }
    Post.findById(req.query.post)
        .populate("comments")
        .exec(function(err, post) {
            if (err || !post) {
                console.log("err in finding post or may does not exist", err);
                return res.redirect("back");
            }
            //check user is authorized or not
            if (post.creator != req.user.id) {
                console.log("you are not authorized");
                return res.redirect("back");
            }
            //delete all likes from post
            Like.deleteMany({ id: { $in: post.likes } }, function(err) {
                if (err) {
                    console.log("err in deleting the likes of post", err);
                }
            });
            //delete all likes of comments of this post
            Like.deleteMany({ id: { $in: post.comments.likes } }, function(err) {
                if (err) {
                    console.log("err in deleting the likes of comments", err);
                }
            });
            //delete all comments of this post
            for (let c of post.comments) {
                c.remove();
            }
            //delete post from users posts list
            req.user.related.posts.pull(post.id);
            req.user.related.save();
            //delete all photos of post
            //delete all photos(feed) of that post
            if (post.photos) {
                for (let photo of post.photos) {
                    fs.unlinkSync(path.join(__dirname, "..", photo));
                }
            }
            //delete the post
            post.remove();
            return res.redirect("back");
        });
}

function createPostPage(req, res) {
    if (!req.user) {
        console.log("Login First");
        return res.redirect("/sign-in");
    }
    const type = req.user.myUser.onModel;
    console.log("type is ", type);
    if (type != "Club") {
        console.log("You can not create post : ", type);
        return res.redirect("back");
    }
    return res.render("new_post_page", {
        title: "new  post page",
    });
}

function newTextPost(req, res) {
    if (!req.user) {
        console.log("Login First");
        return res.redirect("/sign-in");
    }
    TextPost.create({
            content: req.body.content,
            creator: req.user.myUser.id,
            caption: req.body.caption,
        },
        function(err, textPost) {
            if (err || !textPost) {
                console.log("Some error in creating text post", err);
                return res.redirect("back");
            }
            console.log("new text post created successfully");
            //    console.log("req.user is ", req.user.related);
            req.user.myUser.related.textPosts.push(textPost.id);
            req.user.myUser.related.save();
            return res.redirect("/");
        }
    );
}

function newTexPostPage(req, res) {
    return res.render("text_post_page", {
        title: "new-text-post-page",
    });
}

function newNoticePage(req, res) {
    return res.render("new_notice_page", {
        title: "new notice page",
    });
}

function addNewNotice(req, res) {
    Notice.uploadNotice(req, res, function(err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                console.log("file is too large max size allowed is 5mb");
                return res.redirect("back");
            }
            console.log("Err in processing data of new post with multer ", err);
            return res.redirect("back");
        }
        if (!req.file) {
            console.log("Can not be created empty post");
            return res.redirect("back");
        }
        console.log("original file name ", req.file.originalname);
        let noticeFile = Notice.noticePath + "/" + req.file.filename;
        Notice.create({
                caption: req.body.caption,
                noticeFile: noticeFile,
                creator: req.user.myUser.id,
                originalFileName: req.file.originalname,
            },
            function(err, notice) {
                if (err || !notice) {
                    console.log("Some error in creating notice", err);
                    return res.redirect("back");
                }
                console.log("new notice created successfully");
                //    console.log("req.user is ", req.user.related);
                req.user.myUser.related.notices.push(notice.id);
                req.user.myUser.related.save();
                return res.redirect("/");
            }
        );
    });
}

function newEventPostPage(req, res) {
    return res.render("new_event_page", {
        title: "New Event Page",
    });
}

function newAlertPage(req, res) {
    return res.render("new_alert_page", {
        title: "new alert page",
    });
}

function newAlert(req, res) {
    if (!req.body.content) {
        console.log("alert can not be empty");
        return res.redirect("back");
    }
    if (req.body.content.length > 80) {
        console.log("alert max length is 80 allowed");
        return res.redirect("back");
    }
    let expireDate = req.body.endDate ?
        new Date(req.body.endDate) :
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
    console.log("Expire Date ", expireDate);
    if (expireDate.getTime() <= new Date().getTime()) {
        console.log(
            "you can not created this alert select correct time of deleting "
        );
        return res.redirect("back");
    }
    Alert.create({
            content: req.body.content,
            creator: req.user.myUser.id,
            expireAt: expireDate,
        },
        function(err, alert) {
            if (err || !alert) {
                console.log("err in creating alert ", err);
                return res.redirect("back");
            }
            req.user.myUser.related.alerts.push(alert.id);
            req.user.myUser.related.save();
            req.user.myUser.save();
            console.log("alert created successfully");
            return res.redirect("/");
        }
    );
}

async function updateMenu(req, res) {
    if (req.user.myUser.onModel != "Hostel") {
        console.log("you are not authorized user");
        return res.redirect("back");
    }
    if (!req.query || !req.query.day || !req.query.time) {
        console.log("bad request dont't try to change the client side code ");
        return res.redirect("back");
    }
    let day = req.query.day;
    let time = req.query.time;
    let hostel = req.user.myUser;
    console.log("day is ", day, " and time is ", time);
    User.populate(hostel, {
        path: "related",
        populate: {
            path: "menu",
            populate: {
                path: "dayWise",
                populate: {
                    path: "timeFood",
                },
            },
        },
    }).then((hostel) => {
        console.log("hostel is ", hostel.related.menu.dayWise[0].timeFood);
        return res.render("menu_update", {
            title: "menu-update-page",
            hostel: hostel,
            day: day,
            time: time,
        });
    });
}
async function updateDayTimeMenuContent(req, res) {
    //update day time menu content fn
    if (req.user.myUser.onModel != "Hostel") {
        console.log("you are not authorized user");
        return res.redirect("back");
    }
    FoodDetail.uploadFoodImage(req, res, function(err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                console.log("file is too large max size allowed is 5mb");
                return res.redirect("back");
            }

            console.log("err in processing multipart-data with multer: ", err);
            return res.redirect("back");
        }
        if (!req.body || !req.body.day || !req.body.time || !req.body.newItems) {
            console.log("bad request dont't try to change the client side code ");
            return res.redirect("back");
        }

        let day = req.body.day;
        let time = req.body.time;
        let hostel = req.user.myUser;
        let newItems = req.body.newItems;
        if (newItems.length == 0) {
            console.log("new item can not be empty");
            return res.redirect("back");
        }
        console.log("day is ", day, " and time is ", time);
        User.populate(hostel, {
            path: "related",
            populate: {
                path: "menu",
                populate: {
                    path: "dayWise",
                    populate: {
                        path: "timeFood",
                    },
                },
            },
        }).then((hostel) => {
            console.log(
                "prev items are is ",
                hostel.related.menu.dayWise[day].timeFood[time]
            );
            hostel.related.menu.dayWise[day].timeFood[time].items = newItems;
            if (req.file) {
                //if already food image exist than remove it
                if (
                    hostel.related.menu.dayWise[day].timeFood[time].image &&
                    hostel.related.menu.dayWise[day].timeFood[time].image !=
                    FoodDetail.defaultFoodImage
                ) {
                    fs.unlinkSync(
                        path.join(
                            __dirname,
                            "..",
                            hostel.related.menu.dayWise[day].timeFood[time].image
                        )
                    );
                }
                //add new image
                hostel.related.menu.dayWise[day].timeFood[time].image =
                    FoodDetail.foodPath + "/" + req.file.filename;
            }
            hostel.related.menu.dayWise[day].timeFood[time].save();
            hostel.save();
            console.log(
                "new food items updated successfully ",
                hostel.related.menu.dayWise[day].timeFood[time]
            );
            return res.redirect("/");
        });
    });
}
module.exports = {
    newPost,
    deletePost,
    createPostPage,
    newTextPost,
    newTexPostPage,
    addNewNotice,
    newNoticePage,
    newEventPostPage,
    newAlertPage,
    newAlert,
    updateMenu,
    updateDayTimeMenuContent,
};