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
const Member = require("../model/Member");
const login_restrict = require("./login_restrict_controller");
const queue = require("../config/kue");
const postEmailWorker = require("../workers/post_email_worker");
const postMailer = require("../mailers/post_mailer");
const upcomingEvent = require("../model/upcomingEvents");

async function newPost(req, res) {
    // if (!req.user || !req.user.myUser) {
    //     console.log("Login First");
    //     return res.redirect("/sign-in");
    // }
    try {
        const type = req.user.myUser.onModel;
        console.log("type is ", type);

        Post.uploadFeed(req, res, async function(err) {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    console.log("file is too large max size allowed is 5mb");
                    if (req.xhr) {
                        return res.status(405).json({
                            err: "file is too large max size allowed is 5mb",
                        });
                    }
                    return res.redirect("back");
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    console.log("Too many files, max 5 allowed");
                    if (req.xhr) {
                        return res.status(405).json({
                            err: "Too many files, max 5 allowed",
                        });
                    }
                    return res.redirect("back");
                }
                console.log("Err in processing data of new post with multer ", err);
                if (req.xhr) {
                    return res.status(405).json({
                        err: "Err in processing data of new post with multer",
                    });
                }
                return res.redirect("back");
            }

            if (!req.files || req.files.length === 0) {
                console.log("Can not be created empty post ");
                if (req.xhr) {
                    return res.status(405).json({
                        err: "Can not be created empty post",
                    });
                }
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
                if (!req.body.eventEndTime) {
                    console.log("invalid request event end time is required");
                    return res.redirect("back");
                }
                let eventStartTime = new Date(req.body.eventStartTime).valueOf();
                let eventEndTime = new Date(req.body.eventEndTime).valueOf();
                console.log(
                    "event start time is ",
                    eventStartTime,
                    " and event End Time is ",
                    eventEndTime
                );
                if (eventEndTime < eventStartTime) {
                    console.log(
                        "invalid event request event start time should less than event end time"
                    );
                    if (req.xhr) {
                        return res.status(405).json({
                            err: "invalid event request event start time should less than event end time",
                        });
                    }
                    return res.redirect("back");
                }
                //handle event timing restrication and event location
                obj.eventStartTime = eventStartTime;
                obj.eventEndTime = eventEndTime;
                obj.venu = req.body.venu ? req.body.venu : "";
            }
            console.log("obj is ", obj);
            let post = await Post.create(obj);
            if (!post) {
                if (req.xhr) {
                    return res.status(500).json({
                        err: "Internal server err,post can not be created ",
                    });
                }
                console.log("Internal server err,post can not be created ");
                return res.redirect("back");
            }
            console.log("new post created successfully");
            let currentDate = Date.now();
            if (
                obj.eventStartTime &&
                (currentDate <= obj.eventStartTime || obj.eventEndTime >= currentDate)
            ) {
                await upcomingEvent.create({
                    postRef: post.id,
                    expireAt: obj.eventEndTime,
                });
            }
            //    console.log("req.user is ", req.user.related);
            post = await Post.populate(post, {
                path: "creator",
            });
            let job = queue.create("posts", post).save(function(err) {
                if (err) {
                    console.log("err in sending to the queue ", err);
                    return;
                }
                console.log("email en-queued ", job.id);
                return;
            });
            // postMailer.newPost(post);
            await req.user.myUser.related.posts.push(post.id);
            await req.user.myUser.related.save();
            if (req.xhr) {
                return res.status(200).json({
                    message: "post created successfully",
                });
            }
            return res.redirect("/");
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "Intenal server err in creating new post",
            });
        }
        console.log("internal server in creating new post : ", err);
        return res.redirect("back");
    }
}

async function deletePost(req, res) {
    // if (!req.user) {
    //     console.log("login first");
    //     return res.redirect("/user/sign-in");
    // }
    // if (!req.query || !req.query.post) {
    //     console.log("bad request");
    //     return res.redirect("back");
    // }
    //check post of that user or not
    // if (req.user.posts && !req.user.posts.includes(req.query.post)) {
    //     console.log("not authorized");
    //     return res.redirect("back");
    // }
    console.log("reached ^^^^^^^^^^^^^  ");
    try {
        let type = req.query.type;
        let model = type == "Post" ? Post : TextPost;
        let modelName = req.user.myUser.onModel;
        let usermModel =
            modelName == "Club" ?
            Club :
            modelName == "Hostel" ?
            Hostel :
            modelName == "Depart" ?
            Depart :
            null;
        if (usermModel == null) {
            if (req.xhr) {
                return res.status(401).json({
                    message: "u are not authorized, to delete this post",
                });
            }
            console.log("model not found ", usermModel);
            return res.redirect("back");
        }
        let post = await model.findById(req.query.post).populate("comments").exec();
        if (!post) {
            if (req.xhr) {
                return res.status(404).json({
                    message: "post not found, may deleted earlier, refresh the page",
                });
            }
            console.log("post not found, may deleted earlier, refresh the page");
            return res.redirect("back");
        }
        //check user is authorized or not
        if (post.creator != req.user.myUser.id) {
            if (req.xhr) {
                return res.status(401).json({
                    message: "you are not authorized, to delete this post",
                });
            }
            console.log("you are not authorized, to delete this post");
            return res.redirect("back");
        }
        //delete all likes from post
        await Like.deleteMany({ _id: { $in: post.likes } });

        // for (let postLike of post.likes) {
        //     console.log("postLike is ", postLike);
        //     await postLike.remove();
        // }
        //delete all comments of this post
        for (let cmnt of post.comments) {
            await login_restrict.deleteActualComment(cmnt);
        }

        //delete post from users posts list
        let targetUser = await usermModel.findByIdAndUpdate(
            req.user.myUser.related.id
        );
        await targetUser.posts.pull(post.id);
        // , {
        //     $pull: { posts: post.id },
        // });
        await targetUser.save();
        //delete all photos of post
        //delete all photos(feed) of that post
        if (type == "Post" && post.photos) {
            for (let photo of post.photos) {
                fs.unlinkSync(path.join(__dirname, "..", photo));
            }
        }
        let postId = post.id;
        //delete the post
        await post.remove();
        if (req.xhr) {
            return res.status(200).json({
                data: { postId: postId },
                message: "post deleted successfully",
            });
        }
        return res.redirect("back");
        // async function(err, post) {
        //     if (err || !post) {
        //         console.log("err in finding post or may does not exist", err);
        //         return res.redirect("back");
        //     }
        //     //check user is authorized or not
        //     if (post.creator != req.user.myUser.id) {
        //         console.log("you are not authorized");
        //         return res.redirect("back");
        //     }
        //     //delete all likes from post
        //     Like.deleteMany({ id: { $in: post.likes } }, function(err) {
        //         if (err) {
        //             console.log("err in deleting the likes of post", err);
        //         }
        //     });
        //     for (let postLike of post.likes) {
        //         console.log("postLike is ", postLike);
        //         await postLike.remove();
        //     }

        //     //delete all comments of this post
        //     for (let cmnt of post.comments) {
        //         await login_restrict.deleteActualComment(cmnt);
        //     }
        //     //delete post from users posts list

        //     await model.findByIdAndUpdate(req.user.myUser.related.id, {
        //         $pull: { posts: post.id },
        //     });

        //     await req.user.myUser.related.save();
        //     //delete all photos of post
        //     //delete all photos(feed) of that post
        //     if (type != "Post" && post.photos) {
        //         for (let photo of post.photos) {
        //             fs.unlinkSync(path.join(__dirname, "..", photo));
        //         }
        //     }
        //     //delete the post
        //     await post.remove();
        //     return res.redirect("back");
        // });
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                message: "err in deleting post is " + err,
            });
        }
        console.log("err in deleting post is ", err);
        return res.redirect("back");
    }
}

function createPostPage(req, res) {
    if (!req.user) {
        console.log("Login First");
        return res.redirect("/sign-in");
    }
    // const type = req.user.myUser.onModel;
    // console.log("type is ", type);
    // if (type != "Club") {
    //     console.log("You can not create post : ", type);
    //     return res.redirect("back");
    // }
    return res.render("new_post_page", {
        title: "new  post page",
    });
}

async function newTextPost(req, res) {
    // if (!req.user) {
    //     console.log("Login First");
    //     return res.redirect("/sign-in");
    // }
    try {
        let textPost = await TextPost.create({
            content: req.body.content,
            creator: req.user.myUser.id,
            caption: req.body.caption,
        });
        if (!textPost) {
            if (req.xhr) {
                return res.status(500).json({
                    err: "Internal server err, text post can not be created",
                });
            }
            console.log("Internal server err, text post can not be created");
            return res.redirect("back");
        }
        console.log("new text post created successfully");
        //    console.log("req.user is ", req.user.related);
        await req.user.myUser.related.textPosts.push(textPost.id);
        await req.user.myUser.related.save();
        if (req.xhr) {
            return res.status(200).json({
                message: "new text post created successfully",
            });
        }
        return res.redirect("/");
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal server err in creating new text post",
            });
        }
        console.log("internal server err in creating new text post : ", err);
        return res.redirect("back");
    }
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

async function addNewNotice(req, res) {
    try {
        Notice.uploadNotice(req, res, async function(err) {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    if (req.xhr) {
                        return res.status(405).json({
                            err: "file is too large max size allowed is 5mb",
                        });
                    }
                    console.log("file is too large max size allowed is 5mb");
                    return res.redirect("back");
                }
                if (req.xhr) {
                    return res.status(405).json({
                        err: "Err in processing data of new post with multer ",
                    });
                }
                console.log("Err in processing data of new post with multer ", err);
                return res.redirect("back");
            }
            if (!req.file) {
                if (req.xhr) {
                    return res.status(405).json({
                        err: "Can not be created empty post, pdf file is required",
                    });
                }
                console.log("Can not be created empty post");
                return res.redirect("back");
            }
            console.log("original file name ", req.file.originalname);
            let noticeFile = Notice.noticePath + "/" + req.file.filename;
            let notice = await Notice.create({
                caption: req.body.caption,
                noticeFile: noticeFile,
                creator: req.user.myUser.id,
                originalFileName: req.file.originalname,
            });
            if (!notice) {
                console.log("Internal server err, notice can not be created");
                if (req.xhr) {
                    return res.status(500).json({
                        err: "Internal server err, notice can not be created",
                    });
                }
                return res.redirect("back");
            }
            console.log("new notice created successfully");
            //    console.log("req.user is ", req.user.related);
            await req.user.myUser.related.notices.push(notice.id);
            await req.user.myUser.related.save();
            if (req.xhr) {
                return res.status(200).json({
                    message: "new notice created successfully",
                });
            }
            return res.redirect("/");
        });
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal server err, new notice can not be added",
            });
        }
        console.log("err in adding new notice ", err);
        return res.redirect("back");
    }
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

async function newAlert(req, res) {
    // if (!req.body.content) {
    //     console.log("alert can not be empty");
    //     return res.redirect("back");
    // }
    try {
        if (req.body.content.length > 80) {
            if (req.xhr) {
                return res.status(405).json({
                    err: "alert max length is 80 allowed",
                });
            }
            console.log("alert max length is 80 allowed");
            return res.redirect("back");
        }
        let expireDate = req.body.endDate ?
            new Date(req.body.endDate) :
            new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
        console.log("Expire Date ", expireDate);
        if (expireDate.getTime() <= new Date().getTime()) {
            if (req.xhr) {
                return res.status(405).json({
                    err: "you can not created this alert select correct time of deleting ",
                });
            }
            console.log(
                "you can not created this alert select correct time of deleting "
            );
            return res.redirect("back");
        }
        let alert = await Alert.create({
            content: req.body.content,
            creator: req.user.myUser.id,
            expireAt: expireDate,
        });
        if (!alert) {
            if (req.xhr) {
                return res.status(500).json({
                    err: "Internal server err, alert can not be created",
                });
            }
            console.log("alert can not created ");
            return res.redirect("back");
        }

        await req.user.myUser.related.alerts.push(alert.id);
        await req.user.myUser.related.save();
        await req.user.myUser.save();
        console.log("alert created successfully");
        if (req.xhr) {
            return res.status(200).json({
                message: "alert created successfully",
            });
        }
        return res.redirect("/");
    } catch (err) {
        console.log("err in adding new alert ", err);
        if (req.xhr) {
            return res.status(500).json({
                err: "err in adding new alert",
            });
        }
        return res.redirect("back");
    }
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

function addNewTeamMemberSelectUser(req, res) {
    return res.render("select_user_page", {
        title: "Select User To add new Team Member Page",
        results: null,
    });
}
async function getRequestUserWithPopulated(req) {
    return await User.findById(req.user.myUser.id)
        .populate({
            path: "related",
            populate: {
                path: "teamMembers",
            },
        })
        .exec();
}
async function checkTargetUserAlreadyInTeamOrNot(members, targetUserId) {
    for (let member of members) {
        if (member.userId == "" + targetUserId) {
            console.log("already member");
            return await Member.populate(member, {
                path: "userId",
            });
        }
    }
    return null;
}
async function updateOrAddTeamMember(req, res) {
    let target_user_id = req.query.user;
    User.findOne({ _id: target_user_id, onModel: "Student" },
        async function(err, user) {
            if (user) {
                let requestUser = await getRequestUserWithPopulated(req);
                console.log("request user is ", requestUser);

                console.log(
                    "requestUser.related.teamMebers    ",
                    requestUser.related.teamMembers
                );
                let memberPass = await checkTargetUserAlreadyInTeamOrNot(
                    requestUser.related.teamMembers,
                    user.id
                );

                console.log("user find, usre is ", user);
                return res.render("updateOrAddMemberPage", {
                    title: "Updat or Add Member Page",
                    member: memberPass,
                    userDetails: user,
                });
            } else {
                console.log("user not find");
            }
            return res.redirect("");
        }
    );
}

async function update_Team_Member(req, res) {
    if (!req.query || !req.query.member) return re.redirect("back");
    let memberId = req.query.member;
    Member.findById(memberId)
        .populate("userId")
        .exec(async function(err, member) {
            if (err || !member) {
                console.log("bad request member not found ");
                return res.redirect("back");
            }
            //check member is in team of request user or not
            // console.log("req.user.myUser ", req.user.myUser);
            let teamMembers = req.user.myUser.related.teamMembers;
            // console.log("teamMembers is ",teamMembers);
            if (!teamMembers.includes(member.id)) {
                console.log("you are not authorized to update this member");
                return res.redirect("back");
            }

            return res.render("updateOrAddMemberPage", {
                title: "Updat  Member Page",
                member: member,
                userDetails: null,
            });
        });
}
async function addNewTeamMember(req, res) {
    //get user_id of targeted user
    let userId = req.body.user_id;
    //check user_id is correct means user for that id is exist and onModel is student
    User.findOne({ _id: userId, onModel: "Student" },
        async function(err, targetUser) {
            if (err || !targetUser) {
                console.log("err in finding target user or may not exist");
                return res.redirect("back");
            }
            //check user is already in team-member or not
            let requestUser = await getRequestUserWithPopulated(req);
            console.log("request user is ", requestUser);

            let memberIncludes = await checkTargetUserAlreadyInTeamOrNot(
                requestUser.related.teamMembers,
                targetUser.id
            );
            let isAlreadyMember = !(memberIncludes == null);
            //if already in team member than add new request is invalid it should be update request
            if (isAlreadyMember) {
                console.log(
                    "this user is already team mmember so make the update request"
                );
                return res.redirect("back");
            }
            //if not already in team member add it in team member
            let body = req.body;
            let obj = {
                userId: body.user_id,
            };
            if (body.heading.length != 0) {
                obj.heading = body.heading;
            }
            if (body.description.length != 0) {
                obj.desc = body.description;
            }
            let newMember = await Member.create(obj);
            console.log("new member created successfully ", newMember);
            requestUser.related.teamMembers.push(newMember.id);
            requestUser.related.save();
            requestUser.save();
            console.log(
                "in requestUser add it in new team Member successfully ",
                requestUser
            );

            let id = req.user.myUser.id;
            return res.redirect("/user/profile?user_id=" + id);
        }
    );

    //if already in team member than add new request is invalid it should be update request
    // if not already in team that add it in team member
}
async function UpdateTeamMember(req, res) {
    //check member_id exist or not
    if (!req.body.memberId) {
        console.log("request is invalid");
        return res.redirect("back");
    }
    let memberId = req.body.memberId;
    //check memberId is correct or not
    Member.findById(memberId, function(err, member) {
        if (err || !member) {
            console.log("err in finding member by id or may not exist: ", err);
            return res.redirect("back");
        }
        //check member is in team of request user or not
        console.log("req.user.myUser ", req.user.myUser);
        let teamMembers = req.user.myUser.related.teamMembers;
        // console.log("teamMembers is ",teamMembers);
        if (!teamMembers.includes(member.id)) {
            console.log("you are not authorized to update this member");
            return res.redirect("back");
        }
        //if  already in team member update it in team member
        let body = req.body;
        let obj = {
            heading: body.heading.length != 0 ? body.heading : "Team Member",
            desc: body.description.length != 0 ?
                body.description :
                "Working Criteria or Rights of the member not updated yet",
        };

        // await Member.findByIdAndUpdate(member.id, obj);
        //or we can update like below
        member.heading = obj.heading;
        member.desc = obj.desc;
        member.save();
        console.log("updated successfully");
        let id = req.user.myUser.id;
        return res.redirect("/user/profile?user_id=" + id);
    });
}

async function delete_Team_Member(req, res) {
    if (!req.query || !req.query.member) return re.redirect("back");
    let memberId = req.query.member;
    Member.findById(memberId)
        .populate("userId")
        .exec(async function(err, member) {
            if (err || !member) {
                console.log("bad request member not found ");
                return res.redirect("back");
            }
            //check member is in team of request user or not
            // console.log("req.user.myUser ", req.user.myUser);
            let teamMembers = req.user.myUser.related.teamMembers;
            // console.log("teamMembers is ",teamMembers);
            if (!teamMembers.includes(member.id)) {
                console.log("you are not authorized to update this member");
                return res.redirect("back");
            }
            return res.render("updateOrAddMemberPage", {
                title: "Delete  Member Page",
                member: member,
                userDetails: null,
                type: "delete",
            });
        });
}
async function deleteTeamMember(req, res) {
    //check memberId exist or not

    if (!req.body.memberId) {
        console.log("request is invalid");
        return res.redirect("back");
    }
    let memberId = req.body.memberId;
    //check memberId is correct or not
    Member.findById(memberId, function(err, member) {
        if (err || !member) {
            console.log("err in finding member by id or may not exist: ", err);
            return res.redirect("back");
        }
        //check member is in team of request user or not
        console.log("req.user.myUser ", req.user.myUser);
        let teamMembers = req.user.myUser.related.teamMembers;
        // console.log("teamMembers is ",teamMembers);
        if (!teamMembers.includes(member.id)) {
            console.log("you are not authorized to delete this member");
            return res.redirect("back");
        }

        member.remove();
        console.log("delete successfully");
        let id = req.user.myUser.id;
        return res.redirect("/user/profile?user_id=" + id);
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
    addNewTeamMemberSelectUser,
    updateOrAddTeamMember,
    addNewTeamMember,
    UpdateTeamMember,
    update_Team_Member,
    delete_Team_Member,
    deleteTeamMember,
};