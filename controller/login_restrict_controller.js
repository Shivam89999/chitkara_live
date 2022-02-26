const User = require("../model/user");
const Student = require("../model/student");
const Hostel = require("../model/hostel");
const Depart = require("../model/depart");
const Comment = require("../model/comment");
const Club = require("../model/club");
const Post = require("../model/post");
const TextPost = require("../model/textPost");
const path = require("path");
const fs = require("fs");
const Like = require("../model/like");
const passport = require("passport");
const { redirect } = require("express/lib/response");
const Notice = require("../model/notice");
const Poll = require("../model/poll");
const Save = require("../model/Save");
const Member = require("../model/Member");
const res = require("express/lib/response");
//const commentsMailer = require("../mailers/comment_mailers");
const queue = require("../config/kue");
const messEmailWorker = require("../workers/mess_email_worker");
const postEmailWorker = require("../workers/post_email_worker");
const Alert = require("../model/alert");
const Upcoming = require("../model/upcomingEvents");
const creatorRequest = require("../model/creatorRequest");
const requestEmailWorker = require("../workers/request_email_worker");
const requestMailer = require("../mailers/request_mailer");
const organisers = require("../model/organiser");
async function userProfile(req, res) {
    if (!req.user) {
        console.log("Sign-in first");
        return res.redirect("/sign-in");
    }
    //console.log("req.url is ", req.url);
    if (!req.query || !req.query.user_id) {
        console.log("bad request");
        return res.redirect("/");
    }
    User.findById(req.query.user_id)
        .populate([{
                path: "polls",
            },
            {
                path: "related",
            },
        ])
        .exec(async function(err, user_profile) {
            if (err || !user_profile) {
                console.log(
                    "Err in finding user from user_id or may does not exist ",
                    err
                );
                return res.redirect("/");
            }
            if (
                user_profile.onModel != "Student" &&
                user_profile.onModel != "Hostel"
            ) {
                await User.populate(user_profile, [{
                        path: "related",
                        populate: [
                            { path: "posts" },
                            { path: "notices" },
                            { path: "alerts" },
                            { path: "textPosts" },
                            { path: "admin" },
                            {
                                path: "teamMembers",
                                populate: {
                                    path: "userId",
                                },
                            },
                        ],
                    },
                    {
                        path: "polls",
                    },
                ]);
            }
            if (user_profile.onModel == "Hostel") {
                console.log("yes hostel");
                await User.populate(user_profile, [{
                        path: "polls",
                    },
                    {
                        path: "related",
                        populate: [
                            { path: "posts" },
                            { path: "notices" },
                            { path: "alerts" },
                            { path: "textPosts" },
                            { path: "admin" },
                            {
                                path: "menu",
                                populate: {
                                    path: "dayWise",
                                    populate: {
                                        path: "timeFood",
                                    },
                                },
                            },
                            {
                                path: "teamMembers",
                                populate: {
                                    path: "userId",
                                },
                            },
                        ],
                    },
                ]);
            } else if (user_profile.onModel == "Student") {
                let t = await User.populate(user_profile, {
                    path: "related",
                    populate: {
                        path: "head",
                    },
                });
                console.log("t is ", t);
            }
            console.log("user_profile ", user_profile);
            return res.render("user_profile", {
                title: "User Profile Page",
                user_profile: user_profile,
            });
        });
}

function myProfile(req, res) {
    if (!req.user) {
        console.log("Sign-in first");
        return res.redirect("/sign-in");
    }
}

async function addComment(req, res) {
    // console.log(
    //     "reached ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ "
    // );
    try {
        let type = req.body.type;
        let model = type == "Post" ? Post : TextPost;
        let post = await model.findById(req.body.postId);
        if (!post) {
            console.log("post does not exist");
            if (req.xhr) {
                return res.status(300).json({
                    data: {},
                    message: "post does not exist",
                });
            }
            return res.redirect("back");
        }
        let comment = await Comment.create({
            content: req.body.comment,
            creator: req.user.myUser.id,
            related: post.id,
        });
        if (!comment) {
            console.log("comment not created");
            if (req.xhr) {
                return res.status(404).json({
                    data: {},
                    message: "comment not created internal server error",
                });
            }
            return res.redirect("back");
        }
        await post.comments.unshift(comment.id);
        await post.save();
        console.log("comment is ", comment);
        comment = await Comment.populate(comment, {
            path: "creator",
        });
        // let all_students = await User.find({ onModel: "Student" });
        // for (let student of all_students) {
        //     let job = queue
        //         .create("email", {
        //             comment: comment,
        //             type: "yes",
        //             to: "" + student.email,
        //         })
        //         .save(function(err) {
        //             if (err) {
        //                 console.log("err in sending to the queue ", err);
        //                 return;
        //             }
        //             console.log("email en-queued ", job.id);
        //             return;
        //         });
        // }
        // req.flash("success", "new comment added successfully ");
        console.log("comment created successfully");
        if (req.xhr) {
            console.log("yes %%%%%%%%%%%%  ajax request ");
            return res.status(200).json({
                data: {
                    comment: comment,
                    post: post,
                },
                message: "new comment added successfully ",
            });
        }
        return res.redirect("back");
    } catch (err) {
        console.log("err is ", err);
        if (req.xhr) {
            return res.status(500).json({
                err: "err in creating the comment :  " + err,
            });
        }
        req.flash("error", err);
        return res.redirect("back");
    }
}

async function toggleLike(req, res) {
    if (!req.user) {
        console.log("Login First");
        return res.redirect("/sign-in");
    }
    let existLike = await Like.findOne({
        creator: req.user.myUser.id,
        obj: req.query.id,
        onModel: req.query.type,
    });
    console.log("existLike is ", existLike);
    let type = req.query.type;

    if (type == "Post" || type == "TextPost") {
        try {
            let model = type == "Post" ? Post : TextPost;
            let post = await model.findById(req.query.id);
            if (!post) {
                if (req.xhr) {
                    return res.status(404).json({
                        message: "post not found may deleted if you still seeing the post plzz refresh the page",
                    });
                }
                console.log(
                    "post not found may deleted if you still seeing the post plzz refresh the page"
                );
                return res.redirect("back");
            }
            if (existLike) {
                await Like.findByIdAndRemove(existLike.id);
                await post.likes.pull(existLike.id);
                await post.save();
                await model.populate(post, {
                    path: "likes",
                    populate: {
                        path: "creator",
                    },
                });
                if (req.xhr) {
                    return res.status(200).json({
                        data: { post: post },
                        message: "like deleted from post successfully",
                    });
                }
                console.log("like deleted from post successfully");
                return res.redirect("back");
            } else {
                let like = await Like.create({
                    creator: req.user.myUser.id,
                    onModel: type,
                    obj: post.id,
                });

                await post.likes.unshift(like.id);
                await post.save();
                await model.populate(post, {
                    path: "likes",
                    populate: {
                        path: "creator",
                    },
                });
                if (req.xhr) {
                    return res.status(200).json({
                        data: { post: post, like: true },
                        message: "like added to post successfully",
                    });
                }
                console.log("like added to post successfully");
                return res.redirect("back");
            }
        } catch (err) {
            if (req.xhr) {
                return res.status(405).json({
                    message: "err in toggling post like" + err,
                });
            }
            console.log("err is ", err);
            return res.redirect("back");
        }
    } else if (type == "Notice") {
        try {
            let notice = await Notice.findById(req.query.id);
            if (!notice) {
                if (req.xhr) {
                    return res.status(404).json({
                        err: "Notice not found, may deleted",
                    });
                }
                console.log("Notice not found may deleted");
                return res.redirect("back");
            }

            if (existLike) {
                await Like.findByIdAndRemove(existLike.id);

                await notice.likes.pull(existLike.id);
                await notice.save();
                if (req.xhr) {
                    return res.status(200).json({
                        data: { notice: notice },
                        message: "like deleted from notice successfully",
                    });
                }
                console.log("like deleted from notice successfully");
                return res.redirect("back");
            } else {
                let like = await Like.create({
                    creator: req.user.myUser.id,
                    onModel: type,
                    obj: notice.id,
                });
                if (!like) {
                    console.log("internal server err, like can not added ");
                    if (req.xhr) {
                        return res.status(500).json({
                            err: "internal server, like can not added ",
                        });
                    }
                    return res.redirect("back");
                }
                await notice.likes.push(like.id);
                await notice.save();
                if (req.xhr) {
                    return res.status(200).json({
                        data: { notice: notice, like: true },
                        message: "like added to notice successfully",
                    });
                }
                console.log("like added to notice successfully");
                return res.redirect("back");
            }
        } catch (err) {
            if (req.xhr) {
                return res.status(405).json({
                    message: "err in toggling post like" + err,
                });
            }
            console.log("err is ", err);
            return res.redirect("back");
        }
    } else if (type == "Comment") {
        try {
            console.log("new like &&&&&&&&&&&&&&&&&&&&&&&& &&&&&&&&&&&&&&&&&&& ");
            let comment = await Comment.findById(req.query.id);
            if (!comment) {
                if (req.xhr) {
                    return res.status(404).json({
                        message: "comment not found may be deleted",
                    });
                }
                console.log("comment not found may be deleted");
                return res.redirect("back");
            }
            if (existLike) {
                await Like.findByIdAndRemove(existLike.id);
                await comment.likes.pull(existLike.id);
                await comment.save();
                if (req.xhr) {
                    return res.status(200).json({
                        data: { comment: comment },
                        message: "like removed successfully",
                    });
                }
                return res.redirect("back");
            } else {
                let like = await Like.create({
                    creator: req.user.myUser.id,
                    onModel: type,
                    obj: comment.id,
                });
                await comment.likes.push(like.id);
                await comment.save();
                if (req.xhr) {
                    return res.status(200).json({
                        data: { comment: comment, like: true },
                        message: "like added successfully",
                    });
                }
                return res.redirect("back");
            }
        } catch (err) {
            if (req.xhr) {
                return res.status(405).json({
                    message: "err in toggling comment like" + err,
                });
            }
            console.log("err is ", err);
            return res.redirect("back");
        }
    }
}
async function deleteActualComment(comment) {
    // for (let like of comment.likes) {
    //     await like.remove();
    // }
    await Like.deleteMany({ _id: { $in: comment.likes } });

    await comment.remove();
    console.log("comment deleted successfully");
    return;
}
async function deleteComment(req, res) {
    try {
        console.log("req.query is !!!!!!!!! ", req.query);
        let commentId = req.query.comment;
        let postId = req.query.post;
        let type = req.query.type;
        let model = type == "Post" ? Post : TextPost;
        let comment = await Comment.findById(commentId).exec();
        if (!comment) {
            if (req.xhr) {
                return res.status(404).json({
                    err: "comment does not exist, may deleted already",
                });
            }
            console.log("comment does not exist");
            return res.redirect("back");
        }
        let cmntId = comment.id;
        let post = await model.findById(postId);
        if (!post) {
            if (req.xhr) {
                return res.status(404).json({
                    err: "post for associated comment does not exist, may deleted already",
                });
            }
            console.log(
                "post for associated comment does not exist, may deleted already"
            );
            return res.redirect("back");
        }
        if (!post.creator ||
            (post.creator != req.user.myUser.id &&
                comment.creator != req.user.myUser.id)
        ) {
            if (req.xhr) {
                return res.status(401).json({
                    err: "u can not delete this comment",
                });
            }
            console.log("unauthorized req, u can not delete this comment");

            return res.redirect("back");
        }

        //elete comment from  post comment array
        //delete all likes of comment
        await deleteActualComment(comment);

        // post = await model.findByIdAndUpdate(postId, {
        //     $pull: { comments: comment.id },
        // });
        await post.comments.pull(cmntId);
        await post.save();

        if (req.xhr) {
            return res.status(200).json({
                data: {
                    commentId: cmntId,
                    postId: post.id,
                    commentLength: post.comments.length,
                },
                message: "comment deleted successfully",
            });
        }
        console.log("comment deleted successfully");
        return res.redirect("back");
    } catch (err) {
        console.log("internal server err in deleting comment ", err);
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal Server err in deleting comment ",
            });
        }
        console.log("err in deleting comment", err);
        return res.redirect("back");
    }
}

function signOut(req, res) {
    req.logout();
    return res.redirect("/");
}

function editProfilePage(req, res) {
    if (!req.user) {
        console.log("login first");
        return res.redirect("back");
    }
    return res.render("edit-profile-page", {
        title: "edit-profile-page",
    });
}

function update(req, res) {
    if (!req.user) {
        console.log("Login First");
        return res.redirect("/sign-in");
    }
    User.uploadAvatar(req, res, function(err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                console.log("file is too large max size allowed is 5mb");
                return res.redirect("back");
            }

            console.log("err in processing multipart-data with multer: ", err);
            return res.redirect("back");
        }
        if (req.body.name === "") {
            console.log("name can not be empty");
            return res.redirect("back");
        }
        let prev = req.user.myUser;
        let newdData = req.body;
        if (
            prev.name.trim() != newdData.name.trim() ||
            prev.bio.trim() != newdData.bio.trim() ||
            prev.whatsapp.trim() ||
            (prev.name.trim() != newdData.name.trim()) != newdData.whatsapp.trim() ||
            prev.mobile.trim() != newdData.mobile.trim() ||
            req.file
        ) {
            req.flash("success", "Profile Updated successfully");
        }
        prev.name = newdData.name;
        prev.bio = newdData.bio;
        prev.whatsapp = newdData.whatsapp;
        prev.mobile = newdData.mobile;
        if (req.file) {
            if (req.user.myUser.pic && req.user.myUser.pic != User.defaultAvatarPath)
                fs.unlinkSync(path.join(__dirname, "..", req.user.myUser.pic));
            req.user.myUser.pic = User.avatarPath + "/" + req.file.filename;
        }
        req.user.myUser.save();
        return res.redirect("back");
    });
}

// function toggleAccount(req, res) {
//     if (!req.user) return res.redirect("back");
//     // console.log("fffffffffffffffffffffff");
//     //  console.log("req.user.head ", req.user);
//     User.findById(req.user.related.head)
//         .populate("related")
//         .exec(function(err, user) {
//             console.log("found &&&&&&&&&&&&", user);
//             if (user) {
//                 passport.serializeUser(null, {
//                     organiser: false,
//                     user: user,
//                 });
//                 console.log("new &&&&&&&&&&");
//                 return res.render("/", {
//                     title: "new Home",
//                 });
//             }
//             return res.redirect("back");
//         });
// }
// function toggleAccount(req, res) {
//     User.findById(req.user.related.head)
//         .populate({
//             path: "related",
//             populate: {
//                 path: "posts",
//             },
//         })
//         .exec(function(err, user) {
//             console.log("found **************", user);
//             if (user) {
//                 // req.login(user, function(err) {
//                 //     if (!err) {
//                 //         console.log("switch success");
//                 //     }
//                 // });
//                 // //res.end("home");
//                 req.session.passport.user = user;
//                 // req.session.passport.save();
//                 return res.redirect("/");
//             } else return res.redirect("back");
//         });
//     // return res.redirect("/");
// }

// function newPost(req, res) {
//     if (!req.user) {
//         console.log("Login First");
//         return res.redirect("/sign-in");
//     }
//     const type = req.user.myUser.onModel;
//     console.log("type is ", type);
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
//         Post.create({
//                 caption: req.body.caption,
//                 photos: post_array,
//                 creator: req.user.myUser.id,
//             },
//             function(err, post) {
//                 if (err || !post) {
//                     console.log("Some error in creating post", err);
//                     return res.redirect("back");
//                 }
//                 console.log("new post created successfully");
//                 //    console.log("req.user is ", req.user.related);
//                 req.user.myUser.related.posts.push(post.id);
//                 req.user.myUser.related.save();
//                 return res.redirect("/");
//             }
//         );
//     });
// }
async function checkValidRequest(req, res) {
    try {
        let target = await User.findById(req.query.target);
        if (!target) {
            console.log("target user not found");
            return false;
        }
        console.log("req.user ", req.user.myUser.onModel);
        console.log("target is ", target.onModel);
        if (!(req.user.myUser.onModel === "Student" && target.onModel != "Student") &&
            !(target.onModel === "Student" && req.user.myUser.onModel != "Student")
        ) {
            console.log("bad request ** ");
            return false;
        }
        return true;
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                err: "err in deleting comment " + err,
            });
        }
        console.log("err in deleting comment", err);
        return res.redirect("back");
    }
}
async function sendRequest(req, response) {
    try {
        let res = await checkValidRequest(req, response);
        // console.log("res is ", res);
        if (res != true) {
            if (req.xhr) {
                return response.status(400).json({
                    err: "bad request",
                });
            }
            return response.redirect("back");
        }
        let target = await User.findById(req.query.target)
            .populate("related")
            .exec();
        console.log("target is ", target);
        if (target.related.comingRequest.includes(req.user.myUser.id)) {
            if (req.xhr) {
                return response.status(400).json({
                    err: "you are already requested",
                });
            }
            console.log("you are already requested");
            return response.redirect("back");
        }
        if (target.related.members.includes(req.user.myUser.id)) {
            if (req.xhr) {
                return response.status(400).json({
                    err: "you are already member",
                });
            }
            console.log("you are already member");
            return response.redirect("back");
        }
        if (target.related.sendRequest.includes(req.user.myUser.id)) {
            if (req.xhr) {
                return response.status(400).json({
                    err: "target  already send you a request accept it ",
                });
            }
            console.log("target  already send you a request accept it ");
            return response.redirect("back");
        }
        // console.log("mfnjfnbf ");
        await target.related.comingRequest.push(req.user.myUser.id);
        await target.related.save();
        await target.save();
        await req.user.myUser.related.sendRequest.push(target.id);
        await req.user.myUser.related.save();
        await req.user.myUser.save();
        console.log("request send successfully");
        let job = queue
            .create("requests", {
                user: req.user.myUser,
                targetEmail: target.email,
                targetName: target.name,
            })
            .save(function(err) {
                if (err) {
                    console.log("err in sending to the queue ", err);
                    return;
                }
                console.log("request email en-queued ", job.id);
                return;
            });
        if (req.xhr) {
            return response.status(200).json({
                message: "request send successfully",
                data: {
                    type: "connect",
                    profileId: target._id,
                },
            });
        }
        return response.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return response.status(405).json({
                err: "err in deleting comment " + err,
            });
        }
        console.log("err in deleting comment", err);
        return response.redirect("back");
    }
}

async function cancelRequest(from, to, req, res) {
    try {
        if (
            from.related.sendRequest.includes(to.id) &&
            to.related.comingRequest.includes(from.id)
        ) {
            await from.related.sendRequest.pull(to.id);
            await from.related.save();
            await from.save();
            await to.related.comingRequest.pull(from.id);
            await to.related.save();
            await to.save();
            return true;
        } else {
            console.log("bad request");
            return false;
        }
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                err: "err in cancel request " + err,
            });
        }
        console.log("err in cancel request ", err);
        return res.redirect("back");
    }
}

async function dropRequest(req, response) {
    try {
        let res = await checkValidRequest(req, response);
        console.log("res is ", res);
        if (res != true) {
            if (req.xhr) {
                return response.status(400).json({
                    err: "bad request",
                });
            }
            console.log("bad request ");
            return response.redirect("back");
        }
        let target = await User.findById(req.query.target)
            .populate("related")
            .exec();
        let r = await cancelRequest(req.user.myUser, target, req, response);
        if (r == true) {
            if (req.xhr) {
                return response.status(200).json({
                    message: "request drop successfully",
                    data: {
                        type: "withdraw",
                        profileId: target._id,
                    },
                });
            }
            return response.redirect("back");
        }

        if (req.xhr) {
            return response.status(500).json({
                err: "Internal server err,request  not droped, try again after some time",
            });
        }
        console.log("drop request ", r === true ? "Success" : "Fail");
        return response.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return response.status(405).json({
                err: "err in drop request " + err,
            });
        }
        console.log("err in drop request ", err);
        return response.redirect("back");
    }
}

async function declineRequest(req, response) {
    try {
        let res = await checkValidRequest(req, response);
        console.log("res is ", res);
        if (res != true) {
            if (req.xhr) {
                return response.status(400).json({
                    err: "bad request",
                });
            }
            console.log("bad request ");
            return response.redirect("back");
        }
        let target = await User.findById(req.query.target)
            .populate("related")
            .exec();
        let r = await cancelRequest(target, req.user.myUser, req, response);
        if (r == true) {
            if (req.xhr) {
                return response.status(200).json({
                    message: "request decline successfully",
                    data: {
                        type: "ignore",
                        profileId: target._id,
                    },
                });
            }
            return response.redirect("back");
        }
        if (req.xhr) {
            return response.status(500).json({
                err: "Internal server err,request  not declined, try again after some time",
            });
        }
        console.log("decline request ", r === true ? "Success" : "Fail");
        return response.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return response.status(405).json({
                err: "err in decline request " + err,
            });
        }
        console.log("err in decline request ", err);
        return response.redirect("back");
    }
}

async function addMembership(from, to, req, res) {
    try {
        if (
            from.related.sendRequest.includes(to.id) &&
            to.related.comingRequest.includes(from.id)
        ) {
            await from.related.sendRequest.pull(to.id);
            await to.related.comingRequest.pull(from.id);
            await from.related.members.push(to.id);
            await to.related.members.push(from.id);
            await from.related.save();
            await from.save();
            await to.related.save();
            await to.save();
            return true;
        } else {
            console.log("no request exist ");
            return false;
        }
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal server err, in add membership",
            });
        }
        return res.redirect("back");
    }
}
async function acceptRequest(req, response) {
    try {
        let res = await checkValidRequest(req, response);
        console.log("res is ", res);
        if (res != true) {
            if (req.xhr) {
                return response.status(405).json({
                    err: "Invalid request,  can not accept",
                });
            }
            console.log("Invalid request, can not accept");
            return response.redirect("back");
        }
        let target = await User.findById(req.query.target)
            .populate("related")
            .exec();
        let r = await addMembership(target, req.user.myUser, req, response);
        if (r == true) {
            if (req.xhr) {
                return response.status(200).json({
                    message: "Request accept successfully",
                    data: {
                        type: "accept",
                        profileId: target._id,
                    },
                });
            }
            console.log("request accepted successfully");
            return response.redirect("back");
        }
        if (req.xhr) {
            return response.status(500).json({
                err: "Intebal Server err, in accepting the request! try again",
            });
        }
        console.log("accept request ", r === true ? "Success" : "Fail");
        return response.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return response.status(500).json({
                err: "Internal server err in accept request:  " + err,
            });
        }
        return response.redirect("back");
    }
}
async function endMembership(from, to, req, res) {
    try {
        if (
            from.related.members.includes(to.id) &&
            to.related.members.includes(from.id)
        ) {
            await from.related.members.pull(to.id);
            await to.related.members.pull(from.id);
            await from.related.save();
            await from.save();
            await to.related.save();
            await to.save();
            return true;
        } else {
            console.log("bad request *** ");
            return false;
        }
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal server err in end membership:  " + err,
            });
        }
        return res.redirect("back");
    }
}
async function removeMembership(req, response) {
    try {
        let res = await checkValidRequest(req, response);
        console.log("res is ", res);
        if (res != true) {
            if (req.xhr) {
                return response.status(405).json({
                    err: "Invalid request,  can not remove membership",
                });
            }
            console.log("Invalid request, can not remove membership");
            return response.redirect("back");
        }
        let target = await User.findById(req.query.target)
            .populate("related")
            .exec();
        let r = await endMembership(req.user.myUser, target, req, response);
        if (r == true) {
            if (req.xhr) {
                return response.status(200).json({
                    message: "Membership remove successfully",
                    data: {
                        type: "remove",
                        profileId: target._id,
                    },
                });
            }
            console.log("Membership remove successfully");
            return response.redirect("back");
        }
        if (req.xhr) {
            return response.status(500).json({
                err: "Intebal Server err, in remove the membership! try again",
            });
        }
        console.log("remove membership request ", r === true ? "Success" : "Fail");
        return response.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return response.status(500).json({
                err: "Internal server err in remove membership:  " + err,
            });
        }
        return response.redirect("back");
    }
}

async function userPosts(req, res) {
    let user = req.query.u;
    let types = req.query.types;
    let target = req.query.target;
    let model = null;
    if (types == "posts" || types == "events") {
        model = Post;
    }
    console.log("type is ", types);
    if (model == null) {
        console.log("invalid type");
        return res.redirect("back");
    }

    //find user of which posts are
    User.findById(user, async function(err, success_user) {
        if (err || !success_user) {
            console.log("err in finding user ", err);
            return res.redirect("back");
        }
        if (types == "events") {
            Post.find({
                    creator: success_user.id,
                    eventStartTime: { $ne: null },
                })
                .sort({ createdAt: -1 })
                .populate("creator")
                .populate({
                    path: "comments",
                    populate: [{
                            path: "likes",
                            populate: {
                                path: "creator",
                            },
                        },
                        {
                            path: "creator",
                        },
                    ],
                })
                .populate({
                    path: "likes",
                    populate: {
                        path: "creator",
                    },
                })
                .exec(function(err, posts) {
                    if (err) {
                        console.log("Err in Finding the posts in user posts", err);
                        posts = [];
                    }
                    return res.render("user_posts", {
                        title: "posts page",
                        posts: posts,
                        types: req.query.types,
                        u: success_user,
                        loadMorePost: false,
                        target,
                    });
                });
        } else {
            let models = [Post, TextPost];
            let posts = [];
            for (let model of models) {
                let newPosts = await model
                    .find({
                        creator: success_user.id,
                        eventStartTime: { $eq: null },
                    })
                    .sort({ createdAt: -1 })
                    .populate("creator")
                    .populate({
                        path: "comments",
                        populate: [{
                                path: "likes",
                                populate: {
                                    path: "creator",
                                },
                            },
                            {
                                path: "creator",
                            },
                        ],
                    })
                    .populate({
                        path: "likes",
                        populate: {
                            path: "creator",
                        },
                    });
                posts = posts.concat(newPosts);
            }
            return res.render("user_posts", {
                title: "posts page",
                posts: posts,
                types: req.query.types,
                u: success_user,
                loadMorePost: false,
                target,
            });
        }
    });
}

function likes(req, res) {
    let postId = req.query.post;
    let type = req.query.type;
    let model = type == "Post" ? Post : type == "TextPost" ? TextPost : null;
    if (model == null) {
        console.log("invalid request");
        return res.redirect("back");
    }
    model
        .findById(postId)
        // .populate({
        //     path: "likes",
        //     populate: {
        //         path: "creator",
        //     },
        // })
        .exec(function(err, post) {
            console.log("post is ", post);
            if (post)
                return res.render("likes", {
                    title: "likes page",
                    post: post,
                    currentTime: Date.now(),
                });
            else {
                console.log("err in finding post or may not exist");
                return res.redirect("back");
            }
        });
}

function profileRequestsPage(req, res) {
    // populate the request and send to page
    User.findById(req.user.myUser.id)
        .populate({
            path: "related",
            populate: [{
                    path: "members",
                },
                {
                    path: "comingRequest",
                },
                {
                    path: "sendRequest",
                },
            ],
        })
        .exec(function(err, user) {
            if (err || !user) {
                console.log("err in finding user or populating user ", err);
                return res.redirect("back");
            }
            return res.render("requests", {
                title: "requests page",
                myProfile: user,
            });
        });
}
async function loadMoreUpcoming(time, loadLimit) {
    let currentTime = Date.now();
    console.log("time is $$$$$$$$$$$$ ", time);
    let events = await Post.find({
            createdAt: { $lt: time },
            eventEndTime: { $gte: currentTime },
        })
        .sort({ createdAt: -1 })
        .limit(loadLimit)
        .populate({
            path: "likes",
            populate: {
                path: "creator",
            },
        })
        .populate("creator");
    return events;
}
async function loadMorePassed(time, loadLimit) {
    let currentTime = Date.now();
    let events = await Post.find({
            createdAt: { $lt: time },
            eventEndTime: { $lt: currentTime },
        })
        .sort({ createdAt: -1 })
        .limit(loadLimit)
        .populate({
            path: "likes",
            populate: {
                path: "creator",
            },
        })
        .populate("creator");
    return events;
}
async function loadMoreEvents(req, res) {
    try {
        let type = req.query.type;
        let time = req.query.time;
        let events = [];
        if (type == "upcoming") {
            //console.log("time is @@@@@@@@@@@ ", time);
            events = await loadMoreUpcoming(time, 2);
        } else {
            events = await loadMorePassed(time, 2);
            //events = [];
        }

        let lastTime =
            events.length == 0 ? new Date(0) : events[events.length - 1].createdAt;

        return res.status(200).json({
            message: "events loaded successfully",
            data: {
                events: events,
                lastTime: lastTime,
                localUser: req.user && req.user.myUser ? req.user.myUser : null,
            },
        });
    } catch (err) {
        console.log("err in loading events " + err);
        return res.status(500).json({
            err: "Internal server err in loading events ",
        });
    }
}

function eventsPage(req, res) {
    // Post.find({
    //         eventStartTime: { $exists: true },
    //         eventStartTime: { $ne: null },
    //     })
    //     .populate("creator")
    //     .populate([{
    //             path: "comments",
    //             populate: [{
    //                     path: "creator",
    //                 },
    //                 { path: "likes" },
    //             ],
    //         },
    //         {
    //             path: "likes",
    //             populate: {
    //                 path: "creator",
    //                 options: { limit: 15 },
    //             },
    //         },
    //     ])
    //     .sort({ updatedAt: -1 })

    // .exec(function(err, posts) {
    //     if (!posts || err) {
    //         console.log("err in finding event  post or may no event exist ", err);
    //         posts = [];
    //     }
    //     let upcomingOrrunning = [],
    //         passed = [];
    //     for (let post of posts) {
    //         let type;
    //         let current = parseInt(new Date().valueOf());
    //         if (!post.eventStartTime) {
    //             console.log("bad found");
    //             continue;
    //         }
    //         console.log("&&&&&&&&&&&&&&&&&*************");
    //         if (parseInt(new Date(post.eventEndTime).valueOf()) < current) {
    //             type = "past";
    //             passed.push(post);
    //         } else {
    //             type = "running";
    //             upcomingOrrunning.push(post);
    //         }
    //     }
    //     console.log("upcomings ", upcomingOrrunning);
    //     console.log("passed ", passed);

    //     return res.render("events_page", {
    //         title: "Events Page",
    //         upcomingOrrunning,
    //         passed,
    //     });
    // });
    return res.render("events_page", {
        title: "Events Page",
        upcomingOrrunning: [],
        passed: [],
    });
}
// function createPostPage(req, res) {
//     if (!req.user) {
//         console.log("Login First");
//         return res.redirect("/sign-in");
//     }
//     const type = req.user.myUser.onModel;
//     console.log("type is ", type);
//     if (type != "Club") {
//         console.log("You can not create post : ", type);
//         return res.redirect("back");
//     }
//     return res.render("new_post_page", {
//         title: "new  post page",
//     });
// }

// function newTextPost(req, res) {
//     if (!req.user) {
//         console.log("Login First");
//         return res.redirect("/sign-in");
//     }
//     TextPost.create({
//             content: req.body.content,
//             creator: req.user.myUser.id,
//             caption: req.body.caption,
//         },
//         function(err, textPost) {
//             if (err || !textPost) {
//                 console.log("Some error in creating text post", err);
//                 return res.redirect("back");
//             }
//             console.log("new text post created successfully");
//             //    console.log("req.user is ", req.user.related);
//             req.user.myUser.related.textPosts.push(textPost.id);
//             req.user.myUser.related.save();
//             return res.redirect("/");
//         }
//     );
// }

// function newTexPostPage(req, res) {
//     return res.render("text_post_page", {
//         title: "new-text-post-page",
//     });
// }

// function newNoticePage(req, res) {
//     return res.render("new_notice_page", {
//         title: "new notice page",
//     });
// }

// function addNewNotice(req, res) {}
async function noticeDownload(req, res) {
    try {
        if (!req.query.notice) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "bad request",
                });
            }
            console.log("bad request");
            return res.redirect("back");
        }
        let noticeId = req.query.notice;
        let notice = await Notice.findById(noticeId);
        if (!notice) {
            if (req.xhr) {
                return res.status(404).json({
                    err: "can not find notice, may be deleted",
                });
            }
            console.log("can not find notice, may be deleted");
            return res.redirect("back");
        }
        let filePath = path.join(__dirname, "..", notice.noticeFile);
        return res.download(
            filePath,
            notice.originalFileName,
            async function(err) {
                if (err) {
                    // if (req.xhr) {
                    //     return res.status(500).json({
                    //         err: "Err in downloading the pdf file " + err,
                    //     });
                    // }
                    console.log("Err in downloading the pdf file ", err);
                    // return res.redirect("back");
                    return;
                }
                if (notice.downloads.indexOf(req.user.myUser.id) == -1) {
                    await notice.downloads.push(req.user.myUser.id);
                }

                // console.log("pull  is ", notice.downloads.pull(req.user.myUser.id));
                // console.log(
                //     "downloading is ",
                //     notice.downloads.push(req.user.myUser.id)
                // );
                console.log("notice no of  downloads ", notice.downloads.length);
                await notice.save();
                // if (req.xhr) {
                //     return res.status(200).json({
                //         message: notice.originalFileName + " notice downloaded successfully",
                //     });
                // }
                console.log(notice.originalFileName, " notice downloaded successfully");
                // return res.redirect("back");
                return;
            }
        );
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "err is " + err,
            });
        }
        console.log("err is ", err);
        return res.redirect("back");
    }
}

function newPollPage(req, res) {
    return res.render("new_poll_page", {
        title: "New Poll Page",
    });
}

async function addNewPoll(req, res) {
    try {
        let obj = {
            ...req.body,
            creator: req.user.myUser.id,
            // expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
        };
        // console.log("obj is ", obj);
        let poll = await Poll.create(obj);
        if (!poll) {
            console.log("err in creating poll: ", err);
            if (req.xhr) {
                return res.status(500).json({
                    err: "Internal server err, poll can not be created",
                });
            }
            return res.redirect("back");
        }
        await req.user.myUser.polls.push(poll.id);
        await req.user.myUser.save();
        console.log("poll created successfully");
        User.find({}).exec((err, allUser) => {
            if (err) {
                console.log("err in finding user for send memeber mail");
            }
            for (let u of allUser) {
                let job = queue
                    .create("polls", {
                        by: req.user.myUser,
                        targetEmail: u.email,
                        targetName: u.name,
                        // expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),

                        //targetEmail: "shivamgupta.cse19@chitkarauniversity.edu.in",
                    })
                    .save(function(err) {
                        if (err) {
                            console.log("err in sending to the queue ", err);
                            return;
                        }
                        console.log("request email en-queued ", job.id);
                        return;
                    });
            }
        });
        if (req.xhr) {
            return res.status(200).json({
                message: "poll created successfully",
            });
        }
        return res.redirect("/");
    } catch (err) {
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal server err, in creating the poll",
            });
        }
        console.log("internal server err in creating the poll");
        return res.redirect("back");
    }
}

function newQuestionPage(req, res) {
    return res.render("new_question_page", {
        title: "new question page",
    });
}

async function addPollVote(req, res) {
    // if (!req.query || !req.query.poll_id || !req.query.vote_type) {
    //     console.log("bad poll vote request");
    //     return res.redirect("back");
    // }
    try {
        let pollId = req.query.poll_id;
        let voteType = req.query.vote_type;
        if (voteType != "yes" && voteType != "no") {
            console.log("not valid vote type ", voteType);
            if (req.xhr) {
                return res.status(400).json({
                    err: "invalid request",
                });
            }
            return res.redirect("back");
        }
        //check poll exist or not expire
        let poll = await Poll.findById(pollId);
        if (!poll) {
            if (req.xhr) {
                return res.status(404).json({
                    err: "poll not found or may not exist, deleted by creator or organiser:",
                });
            }
            console.log(
                "poll not found or may not exist, deleted by creator or organiser: ",
                err
            );
            return res.redirect("back");
        }
        //check this user is not already voted
        if (
            poll.yes_votes.includes(req.user.myUser.id) ||
            poll.no_votes.includes(req.user.myUser.id)
        ) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "you already voted ",
                });
            }
            console.log("you already voted ");
            return res.redirect("back");
        }
        if (voteType == "yes") await poll.yes_votes.push(req.user.myUser.id);
        else await poll.no_votes.push(req.user.myUser.id);
        await poll.save();
        if (req.xhr) {
            let totalVotes = poll.yes_votes.length + poll.no_votes.length;
            let yesPercent = ((poll.yes_votes.length * 100) / totalVotes).toFixed(0);
            let noPercent = ((poll.no_votes.length * 100) / totalVotes).toFixed(0);
            return res.status(200).json({
                message: "you are voted successfully for type " + voteType,
                data: {
                    pollId: poll._id,
                    yesPercent: yesPercent,
                    noPercent: noPercent,
                    totalVotes: totalVotes,
                },
            });
        }
        console.log("you are voted successfully of type ", voteType);
        return res.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                message: "err in toggling save " + err,
            });
        }
        console.log("err is ", err);
        return res.redirect("back");
    }
}

async function toggleToSave(req, res) {
    // if (!req.query || !req.query.type || !req.query.refId) {
    //     console.log("bad request in addToSave ");
    //     return res.redirect("back");
    // }
    // const allowedType = ["Post", "TextPost"];
    // if (!allowedType.includes(req.query.type)) {
    //     console.log("bad reuest ^^");
    //     return res.redirect("back");
    // }
    try {
        let type = req.query.type;
        let refId = req.query.refId;
        let modelType = type == "Post" ? Post : TextPost;
        let target = await modelType.findById(refId);

        if (!target) {
            if (req.xhr) {
                return res.status(404).json({
                    message: "post not found may be deleted",
                });
            }
            console.log("post not found may be deleted");
            return res.redirect("back");
        }
        //check targte item already saved by targeted user or not
        let exist = await Save.findOne({
            refItem: target.id,
            onModel: type,
            by: req.user.myUser.id,
        });
        if (exist) {
            console.log("exist is ", exist._id);
            // //find save-items without populating
            // let u = await User.findById(req.user.myUser.id);
            console.log("remove before ", req.user.myUser.saveItems);
            await req.user.myUser.saveItems.pull(exist._id);
            await req.user.myUser.save();
            await exist.remove();
            console.log("remove after ", req.user.myUser.saveItems);
            if (req.xhr) {
                return res.status(200).json({
                    data: { target: target },
                    message: "item remove from save items",
                });
            }
            console.log("item remove from save items");
            return res.redirect("back");
        } else {
            let saveItem = await Save.create({
                refItem: target.id,
                onModel: type,
                by: req.user.myUser.id,
            });
            if (saveItem) {
                await req.user.myUser.saveItems.push(saveItem.id);
                await req.user.myUser.save();

                if (req.xhr) {
                    return res.status(200).json({
                        data: { target: target, state: true },
                        message: "item saved successfully",
                    });
                }
                console.log("item saved successfully");
                return res.redirect("back");
            } else {
                if (req.xhr) {
                    return res.status(500).json({
                        message: "item not saved, Internal server error",
                    });
                }
                console.log("item not saved, Internal server error");
                return res.redirect("back");
            }
        }

        //for requested user it is already in saved so remove it from save model and targeted user save item array
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                message: "err in toggling save " + err,
            });
        }
        console.log("err is ", err);
        return res.redirect("back");
    }
}

function mySaveItems(req, res) {
    Save.find({ by: req.user.myUser.id })
        .populate("refItem")
        .exec(function(err, saveItems) {
            if (err) {
                console.log("err in finding save items ", err);
                return res.redirect("back");
            }
            console.log("save items are ", saveItems);
            return res.render("my_save_items", {
                title: "My Save Items",
                saveItems,
            });
        });
}

async function mySaveItemsDetails(req, res) {
    let target = req.query.target;
    console.log("target is !!!!!!!!!!!  ", req.query);
    let postIds = [],
        textIds = [];
    console.log("nvfjbvnfv ^^^^^^^^^^^^^");
    for (let saveObjid of req.user.myUser.saveItems) {
        // Save.findById(saveObjid, async function(err, success) {
        //     if (success) {
        //         let id = success.refItem;
        //         if (success.onModel == "Post") postIds.push(id);
        //         else textIds.push(id);
        //     } else {
        //         console.log("err in finding err ", err);
        //     }
        //     console.log("d  ^ ");
        // });
        const success = await Save.findById(saveObjid);
        if (success) {
            let id = success.refItem;
            if (success.onModel == "Post") postIds.push(id);
            else textIds.push(id);
        }
    }

    // console.log("postIds ", postIds, "  textIds ", textIds);
    let posts = await Post.find({ _id: { $in: postIds } })
        .sort({ createdAt: -1 })
        .populate("creator")
        .populate({
            path: "comments",
            populate: [{
                    path: "likes",
                    populate: {
                        path: "creator",
                    },
                },
                {
                    path: "creator",
                },
            ],
        })
        .populate({
            path: "likes",
            populate: {
                path: "creator",
            },
        })
        .exec();
    let texts = await TextPost.find({ _id: { $in: textIds } })
        .sort({ createdAt: -1 })
        .populate("creator")
        .populate({
            path: "comments",
            populate: [{
                    path: "likes",
                    populate: {
                        path: "creator",
                    },
                },
                {
                    path: "creator",
                },
            ],
        })
        .populate({
            path: "likes",
            populate: {
                path: "creator",
            },
        })
        .exec();
    console.log("posts ", postIds.length, "  texts length ", textIds.length);
    return res.render("my_save_items_details", {
        title: "my save items details",
        mySaveItems: posts.concat(texts),
        loadMorePost: false,
        target: target,
    });
}
async function OwnAsMemberUpdateDetails(req, res) {
    if (req.user.myUser.onModel != "Student") {
        console.log("bad request");
        return res.redirect("back");
    }
    Member.uploadMember(req, res, function(err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                console.log("file is too large max size allowed is 5mb");
                return res.redirect("back");
            }

            console.log("err in processing multipart-data with multer: ", err);
            return res.redirect("back");
        }
        if (!req.body.memberId) {
            console.log("bad request ");
            return res.redirect("back");
        }
        let memberId = req.body.memberId;
        Member.findById(memberId, function(err, member) {
            if (err || !member) {
                console.log("member not found ");
                return res.redirect("back");
            }
            if (member.userId + "" != req.user.myUser.id + "") {
                console.log("u r not authorized to update this member");
                return res.redirect("back");
            }

            if (req.file) {
                if (
                    member.image != null &&
                    member.image != Member.defaultTeamCoverImage
                )
                    fs.unlinkSync(path.join(__dirname, "..", member.image));
                member.image = Member.memberPath + "/" + req.file.filename;
            }
            member.save();
            return res.redirect("/");
        });
    });
}
async function OwnAsMemberUpdateDetailsPage(req, res) {
    if (!req.query || !req.query.member) {
        console.log("bad request  ", req.query);
        return res.redirect("back");
    }
    let memberId = req.query.member;
    Member.findById(memberId)
        .populate("userId")
        .exec(function(err, member) {
            if (err || !member) {
                console.log(
                    "bad request member id is incorrect or error in finding member"
                );
                return res.redirect("back");
            }
            if (member.userId.id != "" + req.user.myUser.id) {
                console.log(
                    "request is invalid, you are not authorized user to update that request "
                );
                return res.redirect("back");
            }
            return res.render("updateOrAddMemberPage", {
                title: "Updat  Member Page",
                member: member,
                userDetails: null,
            });
        });
}
async function pollVotes(req, res) {
    if (!req.query || !req.query.poll) {
        console.log("invalid request");
        return res.redirect("back");
    }
    let pollId = req.query.poll;
    Poll.findById(pollId)
        .populate([{
                path: "yes_votes",
            },
            {
                path: "no_votes",
            },
        ])
        .exec(function(err, poll) {
            if (err || !poll) {
                console.log("err in finding poll or may not exist");
                return res.redirect("back");
            }
            if (poll.creator != req.user.myUser.id) {
                console.log(
                    "you are not authorized to access of poll votes for this poll"
                );
                return res.redirect("back");
            }
            console.log("page rendered successfully");
            return res.render("./poll_vote_page", {
                title: "poll vote page",
                poll: poll,
            });
        });
}

async function handleDeleteNotice(req, res, found) {
    try {
        //delete all notice likes
        for (let likeId of found.likes) {
            await Like.findByIdAndDelete(likeId);
        }
        await found.remove();
        return;
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                message: "err in deleting  " + err,
            });
        }
        console.log("err is ", err);
        return res.redirect("back");
    }
}
async function deleteTypeObj(req, res) {
    try {
        let typeId = req.query.typeId;
        let type = req.query.type;
        console.log("type is ", type);
        let allowedType = ["alert", "poll", "notice"];
        if (!allowedType.includes(type)) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "bad request, type is invalid",
                });
            }
            console.log("invalid type ");
            return res.redirect("back");
        }
        let model = type == "alert" ? Alert : type == "poll" ? Poll : Notice;

        let found = await model.findById(typeId);
        //check authorized user or not
        if (found.creator != req.user.myUser.id) {
            if (req.xhr) {
                return res.status(405).json({
                    err: "you are not authorized to delete this ",
                });
            }
            console.log("you are not authorized to delete this ");
            return res.redirect("back");
        }
        const type_id = found._id;
        if (type == "notice") {
            await handleDeleteNotice(req, res, found);
        } else {
            await found.remove();
        }
        if (req.xhr) {
            return res.status(200).json({
                data: { typeId: type_id, type: type },
                message: type + " deleted successfully",
            });
        }
        console.log(type + " deleted successfully");
        return res.redirect("back");
    } catch (err) {
        if (req.xhr) {
            return res.status(405).json({
                message: "err in deleting  " + err,
            });
        }
        console.log("err is ", err);
        return res.redirect("back");
    }
}

// async function deletePoll(req, res) {
//     let pollId = req.query.poll;
//     let poll = await Poll.findById(pollId);
//     //check authorized user or not
//     if (poll.creator != req.user.myUser.id) {
//         if (req.xhr) {
//             return res.status(405).json({
//                 err: "you are not authorized to delete this poll",
//             });
//         }
//         console.log("you are not authorized to delete this poll");
//         return res.redirect("back");
//     }
//     const poll_Id = poll._id;
//     await poll.remove();
//     if (req.xhr) {
//         return res.status(200).json({
//             data: { pollId: poll_Id },
//             message: "poll deleted successfully",
//         });
//     }
//     console.log("poll deleted successfully");
//     return res.redirect("back");
// }

async function loadMorePostLikes(req, res) {
    console.log("reached #########33 ");
    try {
        let postId = req.query.postId;
        let time = req.query.time;
        let limit = 1;
        let post = await Post.findById(postId).populate({
            path: "likes",
            options: {
                sort: { createdAt: -1 },
            },
            match: { createdAt: { $lt: time } },
            perDocumentLimit: limit,
            populate: {
                path: "creator",
            },
        });
        let lastTime =
            post.likes.length == 0 ?
            new Date(0) :
            post.likes[post.likes.length - 1].createdAt;
        // console.log("likes are ", post.likes.length);
        if (req.xhr) {
            return res.status(200).json({
                message: "likes loaded successfully ",
                data: {
                    likes: post.likes,
                    lastTime: lastTime,
                    localUser: req.user && req.user.myUser ? req.user.myUser : null,
                    postId: postId,
                },
            });
        }
        return res.redirect("back");
    } catch (err) {
        console.log("Internal server err in loading more likes : ", err);
        if (req.xhr) {
            return res.status(401).json({
                err: "Internal server err in loading more likes Refresh the page ",
            });
        }
        return res.redirect("back");
    }
}
async function toggleAccount(req, res) {
    let myProfile = await User.findById(req.user.myUser.id).populate("related");
    let newUser = null;
    if (myProfile.onModel == "Student") {
        if (myProfile.related.head == null) {
            console.log("no toggle acc. found ");
            req.flash("error", "no toggle acc. found");
            return res.redirect("back");
        }
        let newUserId = await myProfile.related.head;
        newUser = await User.findById(newUserId).populate("related");
        if (newUser.related.admin != myProfile.id) {
            console.log("toggle invalid req ");
            req.flash("error", "toggle invalid request");
            return res.redirect("back");
        }
    } else {
        if (myProfile.related.admin == null) {
            console.log("no toggle acc. found ");
            req.flash("error", "no toggle acc. found");
            return res.redirect("back");
        }
        let newUserId = await myProfile.related.admin;
        newUser = await User.findById(newUserId).populate("related");
        if (newUser.related.head != myProfile.id) {
            console.log("toggle invalid req ");
            req.flash("error", "toggle invalid request ");
            return res.redirect("back");
        }
    }
    if (newUser == null) {
        console.log("no toggle acc. found");
        req.flash("error", "no toggle acc. found");
        return res.redirect("back");
    }
    // await User.findById(req.user.myUser.id){

    // }
    //console.log("new User is ", newUser);
    // res.locals.unsub = "vfnjhbvfhvfhbhfvbjhvf";
    // res.locals.unsub = {
    //     success: "success",
    // };
    // req.user.myUser = "vfnkjvfjvf";
    // req.session.user = "vjhfvjvfnf";
    // req.session.save();
    res.locals.user = newUser;
    // res.locals.save();
    console.log("req is ", req.session);
    req.session.passport.user.id = newUser.id;
    req.session.save();
    req.flash("success", "Welcome, " + newUser.name);
    // return res.send("send successfully ");
    return res.redirect("back");
    // console.log("res.locals are @@@@@@@@@@@@@@@ ", res.locals);
    // console.log("req is ", req.user);
    // res.end();
    // req.user.myUser = newUser;
    //return res.redirect("/");
    // req.something = "vjnfjnvjfnvfnkjnvfnvfjnfjknjf";
    // return res.redirect("/");
}

async function newCreatorAccountRequest(req, res) {
    try {
        if (req.user.myUser.onModel != "Student") {
            console.log("no student account");
            if (req.xhr) {
                return res.status(400).json({
                    err: "Your acc. is not student acc. so you can not make this request",
                });
            }
            return res.redirect("back");
        }

        let usr = await User.populate(req.user.myUser, {
            path: "related",
            populate: {
                path: "head",
            },
        });
        if (usr.related.head != null) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "You are already head of " +
                        usr.related.head.name +
                        " (" +
                        usr.related.head.onModel +
                        ") ",
                });
            }
            console.log("you are already head of ");
            return res.redirect("back");
        }

        // console.log("request reached ", req.body);
        let email = req.body.email.trim();
        let userId = req.body.userId.trim();
        let name = req.body.name.trim();
        //check user is valid
        let requestBy = await User.findById(userId).exec();
        if (requestBy == null) {
            if (req.xhr) {
                return res.status(400).json({
                    err: "bad request",
                });
            }
            console.log("bad request ");
            return res.redirect("back");
        }
        //check user is already exist or not
        let u = await User.findOne({ email: email }).exec();
        console.log("u is ", u);
        if (u != null) {
            console.log("this email is already registered ");
            if (req.xhr) {
                return res.status(400).json({
                    err: "this email is already registered",
                });
            }
            return res.redirect("back");
        }
        //check request is already submit or not
        let exist = await creatorRequest.findOne({ email: email }).exec();
        if (exist != null) {
            console.log("for this email request is already submitted");
            if (req.xhr) {
                return res.status(400).json({
                    err: "request is already submitted for this email",
                });
            }
            return res.redirect("back");
        }
        let allowedType = ["Club", "Hostel", "Depart"];
        let type = req.body.type.trim();
        console.log("type is ", type);
        if (!allowedType.includes(type)) {
            console.log("this type is not allowed ");
            if (req.xhr) {
                return res.status(400).json({
                    err: "this type is not allowed",
                });
            }
            return res.redirect("back");
        }
        let newCreatorReq = creatorRequest.create({
            email: email,
            name: name,
            by: requestBy.id,
            onModel: type,
        });
        //send mail to organisers and sending user
        console.log("Your request is recoreded ");

        //mail to sending user
        let job = queue
            .create("creatorAccountRequests", {
                name: req.user.myUser.name,
                targetEmail: req.user.myUser.email,
                isOrganiser: false,
                data: { name: name, email: email, type: type },
            })
            .save(function(err) {
                if (err) {
                    console.log("err in sending to the queue ", err);
                    return;
                }
                console.log("request email en-queued ", job.id);
                return;
            });
        //mail to all organiser
        let allOrganisers = await organisers.find({}).exec();
        for (let org of allOrganisers) {
            let job = queue
                .create("creatorAccountRequests", {
                    name: org.name,
                    targetEmail: org.email,
                    //targetEmail: "shivamgupta.cse19@chitkarauniversity.edu.in",
                    isOrganiser: true,
                    sender: req.user.myUser,
                    data: { name: name, email: email, type: type },
                })
                .save(function(err) {
                    if (err) {
                        console.log("err in sending to the queue ", err);
                        return;
                    }
                    console.log("request email en-queued ", job.id);
                    return;
                });
        }
        if (req.xhr) {
            return res.status(200).json({
                message: "your request is recorded",
                data: { newCreatorReq: "newCreatorReq" },
            });
        }
        return res.redirect("back");
        // return res.redirect("back");
    } catch (err) {
        console.log("err in new creator acc. req." + err);
        if (req.xhr) {
            return res.status(500).json({
                err: "Internal server err ",
            });
        }
        return res.redirect("back");
    }
}
module.exports = {
    userProfile,
    myProfile,
    addComment,
    deleteComment,
    deleteActualComment,
    toggleLike,
    signOut,
    update,
    editProfilePage,
    // newPost,
    userPosts,
    likes,
    sendRequest,
    declineRequest,
    dropRequest,
    acceptRequest,
    removeMembership,
    profileRequestsPage,
    // toggleAccount,
    eventsPage,
    noticeDownload,
    newPollPage,
    addNewPoll,
    newQuestionPage,
    addPollVote,
    toggleToSave,
    mySaveItems,
    mySaveItemsDetails,
    OwnAsMemberUpdateDetails,
    OwnAsMemberUpdateDetailsPage,
    pollVotes,
    deleteTypeObj,
    loadMorePostLikes,
    loadMoreEvents,
    toggleAccount,
    newCreatorAccountRequest,
};