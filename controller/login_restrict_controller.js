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

function userProfile(req, res) {
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
        .populate({
            path: "related",
            populate: {
                //admin based on condition
                path: "posts",
            },
        })
        .exec(function(err, user_profile) {
            if (err || !user_profile) {
                console.log(
                    "Err in finding user from user_id or may does not exist ",
                    err
                );
                return res.redirect("/");
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

function addComment(req, res) {
    if (!req.user) {
        console.log("login first");
        return res.redirect("/sign-in");
    }
    if (!req.body.comment) {
        console.log("comment can not be null");
        return res.redirect("back");
    }
    Post.findById(req.query.post, function(err, post) {
        if (err || !post) {
            console.log("Err in finding post or post does not exist", err);
            return res.redirect("back");
        }
        //create comment
        Comment.create({
                content: req.body.comment,
                creator: req.user.myUser.id,
                related: post.id,
            },
            function(err, comment) {
                if (err || !comment) {
                    console.log("Err in creating comment or comment not created", err);
                    return res.redirect("back");
                }
                post.comments.push(comment.id);
                post.save();
                console.log("comment created successfully");
                return res.redirect("back");
            }
        );
    });
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
    if (type == "Post") {
        Post.findById(req.query.id, function(err, post) {
            if (err || !post) {
                console.log("Err in finding post or may not exist", req.query.id);
                return res.redirect("back");
            }
            if (existLike) {
                Like.findByIdAndRemove(existLike.id, function(err) {
                    if (err) {
                        console.log("err in deleting the comment Like");
                    }
                });
                post.likes.pull(existLike.id);
                post.save();
                console.log("like deleted from post successfully");
                return res.redirect("back");
            } else {
                Like.create({ creator: req.user.myUser.id, onModel: type, obj: post.id },
                    function(err, like) {
                        if (err) {
                            console.log("Err in creating like");
                            return res.redirect("back");
                        }
                        post.likes.push(like.id);
                        post.save();
                        console.log("like added to post successfully");
                        return res.redirect("back");
                    }
                );
            }
        });
    } else if (type == "Notice") {
        Notice.findById(req.query.id, function(err, notice) {
            if (err || !notice) {
                console.log("Err in finding notice or may not exist", req.query.id);
                return res.redirect("back");
            }
            if (existLike) {
                Like.findByIdAndRemove(existLike.id, function(err) {
                    if (err) {
                        console.log("err in deleting the comment Like");
                    }
                });
                notice.likes.pull(existLike.id);
                notice.save();
                console.log("like deleted from notice successfully");
                return res.redirect("back");
            } else {
                Like.create({ creator: req.user.myUser.id, onModel: type, obj: notice.id },
                    function(err, like) {
                        if (err) {
                            console.log("Err in creating like");
                            return res.redirect("back");
                        }
                        notice.likes.push(like.id);
                        notice.save();
                        console.log("like added to notice successfully");
                        return res.redirect("back");
                    }
                );
            }
        });
    } else if (type == "Comment") {
        Comment.findById(req.query.id, function(err, comment) {
            if (err || !comment) {
                console.log("Err in finding comment or may not exist", err);
                return res.redirect("back");
            }
            if (existLike) {
                Like.findByIdAndRemove(existLike.id, function(err) {
                    if (err) {
                        console.log("err in deleting the comment Like");
                    }
                });
                comment.likes.pull(existLike.id);
                comment.save();
                return res.redirect("back");
            } else {
                Like.create({ creator: req.user.myUser.id, onModel: type, obj: comment.id },
                    function(err, like) {
                        if (err) {
                            console.log("Err in creating like");
                            return res.redirect("back");
                        }
                        comment.likes.push(like.id);
                        comment.save();
                        return res.redirect("back");
                    }
                );
            }
        });
    }
}

function deleteComment(req, res) {
    if (!req.user) {
        console.log("login first");
        return res.redirect("/sign-in");
    }
    if (!req.query || !req.query.comment) {
        console.log("bad request");
        return res.redirect("back");
    }
    Comment.findById(req.query.comment, function(err, comment) {
        if (err || !comment) {
            console.log("err in finding comment or may does not exist");
            return res.redirect("back");
        }
        //delete all likes of comment
        Like.deleteMany({ _id: { $in: comment.likes } }, function(err) {
            if (err) console.log("err in deleting likes of comment");
        });
        //elete comment from  post comment array
        let postId = req.query.post;
        Post.findById(postId, function(err, post) {
            if (post) {
                post.comments.pull(comment.id);
            }
        });
        comment.remove();

        return res.redirect("back");
    });
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
        req.user.myUser.name = req.body.name;
        req.user.myUser.bio = req.body.bio;
        req.user.myUser.whatsapp = req.body.whatsapp;
        req.user.myUser.mobile = req.body.mobile;
        if (req.file) {
            if (req.user.myUser.pic)
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
    if (!req.query || !req.query.target) {
        console.log("bad request not correct query ");
        return false;
    }
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
}
async function sendRequest(req, response) {
    let res = await checkValidRequest(req, response);
    console.log("res is ", res);
    if (res != true) {
        return response.redirect("back");
    }
    let target = await User.findById(req.query.target).populate("related").exec();
    console.log("target is ", target);
    if (target.related.comingRequest.includes(req.user.myUser.id)) {
        console.log("you are already requested");
        return response.redirect("back");
    }
    if (target.related.members.includes(req.user.myUser.id)) {
        console.log("you are already member");
        return response.redirect("back");
    }
    if (target.related.sendRequest.includes(req.user.myUser.id)) {
        console.log("target  already send you a request accept it ");
        return response.redirect("back");
    }
    console.log("mfnjfnbf ");
    target.related.comingRequest.push(req.user.myUser.id);
    target.related.save();
    target.save();
    req.user.myUser.related.sendRequest.push(target.id);
    req.user.myUser.related.save();
    req.user.myUser.save();
    console.log("request send successfully");
    return response.redirect("back");
}

async function cancelRequest(from, to) {
    if (
        from.related.sendRequest.includes(to.id) &&
        to.related.comingRequest.includes(from.id)
    ) {
        from.related.sendRequest.pull(to.id);
        from.related.save();
        from.save();
        to.related.comingRequest.pull(from.id);
        to.related.save();
        to.save();
        return true;
    } else {
        console.log("bad request");
        return false;
    }
}

async function dropRequest(req, response) {
    let res = await checkValidRequest(req, response);
    console.log("res is ", res);
    if (res != true) {
        return response.redirect("back");
    }
    let target = await User.findById(req.query.target).populate("related").exec();
    let r = await cancelRequest(req.user.myUser, target);
    console.log("drop request ", r === true ? "Success" : "Fail");
    return response.redirect("back");
}

async function declineRequest(req, response) {
    let res = await checkValidRequest(req, response);
    console.log("res is ", res);
    if (res != true) {
        return response.redirect("back");
    }
    let target = await User.findById(req.query.target).populate("related").exec();
    let r = await cancelRequest(target, req.user.myUser);
    console.log("decline request ", r === true ? "Success" : "Fail");
    return response.redirect("back");
}

async function addMembership(from, to) {
    if (
        from.related.sendRequest.includes(to.id) &&
        to.related.comingRequest.includes(from.id)
    ) {
        from.related.sendRequest.pull(to.id);
        to.related.comingRequest.pull(from.id);
        from.related.members.push(to.id);
        to.related.members.push(from.id);
        from.related.save();
        from.save();
        to.related.save();
        to.save();
        return true;
    } else {
        console.log("no request exist ");
        return false;
    }
}
async function acceptRequest(req, response) {
    let res = await checkValidRequest(req, response);
    console.log("res is ", res);
    if (res != true) {
        return response.redirect("back");
    }
    let target = await User.findById(req.query.target).populate("related").exec();
    let r = await addMembership(target, req.user.myUser);
    console.log("accept request ", r === true ? "Success" : "Fail");
    return response.redirect("back");
}
async function endMembership(from, to) {
    if (
        from.related.members.includes(to.id) &&
        to.related.members.includes(from.id)
    ) {
        from.related.members.pull(to.id);
        to.related.members.pull(from.id);
        from.related.save();
        from.save();
        to.related.save();
        to.save();
        return true;
    } else {
        console.log("bad request *** ");
        return false;
    }
}
async function removeMembership(req, response) {
    let res = await checkValidRequest(req, response);
    console.log("res is ", res);
    if (res != true) {
        return response.redirect("back");
    }
    let target = await User.findById(req.query.target).populate("related").exec();
    let r = await endMembership(req.user.myUser, target);
    console.log("remove membership request ", r === true ? "Success" : "Fail");
    return response.redirect("back");
}

function userPosts(req, res) {
    let user = req.query.u;
    //find user of which posts are
    User.findById(user, function(err, success_user) {
        if (err || !success_user) {
            console.log("err in finding user ", err);
            return res.redirect("back");
        }
        Post.find({ creator: success_user.id })
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
                    u: success_user,
                });
            });
    });
}

function likes(req, res) {
    if (!req.query || !req.query.post) {
        console.log("bad request ");
        return res.redirect("back");
    }
    let postId = req.query.post;
    Post.findById(postId)
        .populate({
            path: "likes",
            populate: {
                path: "creator",
            },
        })
        .exec(function(err, post) {
            console.log("post is ", post);
            if (post)
                return res.render("likes", {
                    title: "likes page",
                    post: post,
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

function eventsPage(req, res) {
    Post.find({
            eventStartTime: { $exists: true },
            eventEndDate: { $exists: true },
        })
        .populate({
            path: "creator",
            populate: {
                path: "related",
            },
        })
        .populate({
            path: "likes",
            populate: {
                path: "creator",
                populate: {
                    path: "related",
                },
            },
        })
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
                    populate: {
                        path: "related",
                    },
                },
            ],
        })
        .exec(function(err, posts) {
            if (!posts || err) {
                console.log("err in finding event  post or may no event exist ", err);
                posts = [];
            }
            let upcoming = [],
                passed = [],
                running = [];
            for (let post of posts) {
                let type;
                let current = new Date();
                if (new Date(post.eventEndTime).getTime() < current.getTime()) {
                    type = "past";
                    passed.push(post);
                } else if (
                    new Date(post.eventStartTime).getTime() > current.getTime()
                ) {
                    type = "upcoming";
                    upcoming.push(post);
                } else {
                    type = "running";
                    running.push(post);
                }
            }
            console.log("upcomings ", upcoming);
            console.log("passed ", passed);
            console.log("running ", running);
            return res.render("events_page", {
                title: "Events Page",
                upcoming,
                running,
                passed,
            });
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
function noticeDownload(req, res) {
    if (!req.query.notice) {
        console.log("bad request");
        return res.redirect("back");
    }
    let noticeId = req.query.notice;
    Notice.findById(noticeId, function(err, notice) {
        if (notice) {
            let filePath = path.join(__dirname, "..", notice.noticeFile);
            res.download(filePath, notice.originalFileName, (err) => {
                if (err) {
                    console.log("Err in downloading the pdf file ", err);
                    return res.redirect("back");
                }
                console.log("pull  is ", notice.downloads.pull(req.user.myUser.id));
                console.log(
                    "downloading is ",
                    notice.downloads.push(req.user.myUser.id)
                );
                console.log("notice ", notice.downloads);
                notice.save();
                console.log(notice.originalFileName, " notice downloaded successfully");
                return;
            });
        }
    });
}

function newPollPage(req, res) {
    return res.render("new_poll_page", {
        title: "New Poll Page",
    });
}

function addNewPoll(req, res) {
    if (!req.body || !req.body.question) {
        console.log("question can not be empty");
        return res.redirect("back");
    }
    let obj = {
        ...req.body,
        creator: req.user.myUser.id,
    };
    console.log("obj is ", obj);
    Poll.create(obj, function(err, poll) {
        if (err || !poll) {
            console.log("err in creating poll: ", err);
            return res.redirect("back");
        }
        console.log("poll created successfully");
        return res.redirect("/");
    });
}

function newQuestionPage(req, res) {
    return res.render("new_question_page", {
        title: "new question page",
    });
}

function addPollVote(req, res) {
    if (!req.query || !req.query.poll_id || !req.query.vote_type) {
        console.log("bad poll vote request");
        return res.redirect("back");
    }
    let pollId = req.query.poll_id;
    let voteType = req.query.vote_type;
    if (voteType != "yes" && voteType != "no") {
        console.log("not valid vote type ", voteType);
        return res.redirect("back");
    }
    //check poll exist or not expire
    Poll.findById(pollId, function(err, poll) {
        if (err || !poll) {
            console.log("Err in finding poll or may not exist: ", err);
            return res.redirect("back");
        }
        //check this user is not already voted
        if (
            poll.yes_votes.includes(req.user.myUser.id) ||
            poll.no_votes.includes(req.user.myUser.id)
        ) {
            console.log("you already voted ");
            return res.redirect("back");
        }
        if (voteType == "yes") poll.yes_votes.push(req.user.myUser.id);
        else poll.no_votes.push(req.user.myUser.id);
        poll.save();
        console.log("you are voted successfully of type ", voteType);
        return res.redirect("back");
    });
}

function toggleToSave(req, res) {
    if (!req.query || !req.query.type || !req.query.refId) {
        console.log("bad request in addToSave ");
        return res.redirect("back");
    }
    const allowedType = ["Post", "TextPost"];
    if (!allowedType.includes(req.query.type)) {
        console.log("bad reuest ^^");
        return res.redirect("back");
    }
    let type = req.query.type;
    let refId = req.query.refId;
    let modelType = type == "Post" ? Post : TextPost;
    modelType.findById(refId, function(err, target) {
        if (err || !target) {
            console.log("err in finding target post or may not exist ", err);
            return res.redirect("back");
        }
        //check targte item already saved by targeted user or not
        Save.findOne({ refItem: target.id, onModel: type, by: req.user.myUser.id },
            function(err, exist) {
                if (err) {
                    console.log("err in varifying that already saved or not");
                    return res.redirect("back");
                }
                //for requested user it is already in saved so remove it from save model and targeted user save item array
                if (exist) {
                    req.user.myUser.saveItems.pull(exist.id);
                    req.user.myUser.save();
                    exist.remove();
                    exist.save();
                    return res.redirect("back");
                } else {
                    Save.create({ refItem: target.id, onModel: type, by: req.user.myUser.id },
                        function(err, saveItem) {
                            if (saveItem) {
                                req.user.myUser.saveItems.push(saveItem.id);
                                req.user.myUser.save();
                                console.log("item saved successfully");
                                return res.redirect("back");
                            } else {
                                console.log("err in saving the item ", err);
                                return res.redirect("back");
                            }
                        }
                    );
                }
            }
        );
    });
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
    });
}
module.exports = {
    userProfile,
    myProfile,
    addComment,
    deleteComment,
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
};