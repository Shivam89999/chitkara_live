const User = require("../model/user");
const Student = require("../model/student");
const Hostel = require("../model/hostel");
const Depart = require("../model/depart");
const Comment = require("../model/comment");
const Club = require("../model/club");
const Post = require("../model/post");
const path = require("path");
const fs = require("fs");
const Like = require("../model/like");
const { resolveSoa } = require("dns");

// function userProfile(req, res) {
//     if (!req.user) {
//         console.log("Sign-in first");
//         return res.redirect("/user/sign-in");
//     }
//     let posts = [];
//     console.log("req.url is ", req.url);
//     return res.render("user_profile", {
//         title: "User Profile Page",
//     });
// }

// function myProfile(req, res) {
//     if (!req.user) {
//         console.log("Sign-in first");
//         return res.redirect("/user/sign-in");
//     }
// }

// function create(req, res) {
//     //first user email is valid and check via sending otp
//     console.log("in create ", req.body);
//     //check the user
//     if (!req.body.email || !req.body.password) {
//         console.log("email or password can't be empty: ", req.body);
//         return res.redirect("back");
//     }
//     if (req.body.password != req.body.confirm_password) {
//         console.log("password or confirm password not matched ");
//         return res.redirect("back");
//     }
//     if (!req.body.tick) {
//         console.log("tick first");
//         return res.redirect("back");
//     }
//     if (!req.body.name) {
//         console.log("name can not be empty");
//         return res.redirect("back");
//     }
//     let findModel =
//         req.body.tick === "Student" ?
//         Student :
//         req.body.tick === "Hostel" ?
//         Hostel :
//         req.body.tick === "Club" ?
//         Club :
//         req.body.tick == "Depart" ?
//         Depart :
//         null;
//     if (!findModel) {
//         console.log("Tick Right Option First");
//         return res.redirect("back");
//     }
//     //first check email already exist or not
//     User.findOne({ email: req.body.email }, function(err, user) {
//         if (err) {
//             console.log("Err in finding the user for given email", err);
//             return res.redirect("back");
//         }
//         if (user) {
//             console.log("This Email is Already Exist ", user);
//             return res.redirect("back");
//         }

//         //create user in db
//         User.create(req.body, function(err, user) {
//             if (err) {
//                 console.log("Err in creating the user ", err);
//                 return res.redirect("back");
//             }
//             console.log("user created successfully: ");
//             findModel.create({ info: user.id }, function(err, m) {
//                 if (err) {
//                     console.log("Err in link user to respected model");
//                     return res.redirect("back");
//                 }
//                 user.related = m.id;
//                 user.onModel = req.body.tick;
//                 user.save();
//                 console.log("user is ", user);
//             });
//             return res.redirect("/user/sign-in");
//         });
//     });
// }

// function createSession(req, res) {
//     console.log("req.user is ", req.user);
//     return res.redirect("/");
// }

// function signUp(req, res) {
//     if (req.user) {
//         console.log("you already sign-in");
//         return res.redirect("back");
//     }
//     return res.render("sign_up", {
//         title: "Sign-Up Page",
//         layout: "./layouts/some_layout",
//     });
// }

// function signIn(req, res) {
//     if (req.user) {
//         console.log("you already sign-in");
//         return res.redirect("back");
//     }
//     return res.render("sign_in", {
//         title: "Sign-In Page",
//         layout: "./layouts/some_layout",
//     });
// }

// function signOut(req, res) {
//     req.logout();
//     return res.redirect("/");
// }

// function editProfilePage(req, res) {
//     if (!req.user) {
//         console.log("login first");
//         return res.redirect("back");
//     }
//     return res.render("edit-profile-page", {
//         title: "edit-profile-page",
//     });
// }

// function update(req, res) {
//     if (!req.user) {
//         console.log("Login First");
//         return res.redirect("/user/sign-in");
//     }
//     User.uploadAvatar(req, res, function(err) {
//         if (err) {
//             if (err.code === "LIMIT_FILE_SIZE") {
//                 console.log("file is too large max size allowed is 5mb");
//                 return res.redirect("back");
//             }

//             console.log("err in processing multipart-data with multer: ", err);
//             return res.redirect("back");
//         }
//         if (req.body.name === "") {
//             console.log("name can not be empty");
//             return res.redirect("back");
//         }
//         req.user.name = req.body.name;
//         req.user.bio = req.body.bio;
//         if (req.file) {
//             if (req.user.pic) fs.unlinkSync(path.join(__dirname, "..", req.user.pic));
//             req.user.pic = User.avatarPath + "/" + req.file.filename;
//         }
//         req.user.save();
//         return res.redirect("back");
//     });
// }

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

// function addComment(req, res) {
//     if (!req.user) {
//         console.log("login first");
//         return res.redirect("/user/sign-in");
//     }
//     if (!req.body.comment) {
//         console.log("comment can not be null");
//         return res.redirect("back");
//     }
//     Post.findById(req.query.post, function(err, post) {
//         if (err || !post) {
//             console.log("Err in finding post or post does not exist", err);
//             return res.redirect("back");
//         }
//         //create comment
//         Comment.create({ content: req.body.comment, creator: req.user.id, related: post.id },
//             function(err, comment) {
//                 if (err || !comment) {
//                     console.log("Err in creating comment or comment not created", err);
//                     return res.redirect("back");
//                 }
//                 post.comments.push(comment.id);
//                 post.save();
//                 console.log("comment created successfully");
//                 return res.redirect("back");
//             }
//         );
//     });
// }

// async function toggleLike(req, res) {
//     if (!req.user) {
//         console.log("Login First");
//         return res.redirect("/user/sign-in");
//     }
//     let existLike = await Like.findOne({
//         creator: req.user.id,
//         obj: req.query.id,
//         onModel: req.query.type,
//     });
//     console.log("existLike is ", existLike);
//     let type = req.query.type;
//     if (type == "Post") {
//         Post.findById(req.query.id, function(err, post) {
//             if (err || !post) {
//                 console.log("Err in finding post or may not exist", err);
//                 return res.redirect("back");
//             }
//             if (existLike) {
//                 Like.findByIdAndRemove(existLike.id, function(err) {
//                     if (err) {
//                         console.log("err in deleting the comment Like");
//                     }
//                 });
//                 post.likes.pull(existLike.id);
//                 post.save();
//                 return res.redirect("back");
//             } else {
//                 Like.create({ creator: req.user.id, onModel: type, obj: post.id },
//                     function(err, like) {
//                         if (err) {
//                             console.log("Err in creating like");
//                             return res.redirect("back");
//                         }
//                         post.likes.push(like.id);
//                         post.save();
//                         return res.redirect("back");
//                     }
//                 );
//             }
//         });
//     } else {
//         Comment.findById(req.query.id, function(err, comment) {
//             if (err || !comment) {
//                 console.log("Err in finding comment or may not exist", err);
//                 return res.redirect("back");
//             }
//             if (existLike) {
//                 Like.findByIdAndRemove(existLike.id, function(err) {
//                     if (err) {
//                         console.log("err in deleting the comment Like");
//                     }
//                 });
//                 comment.likes.pull(existLike.id);
//                 comment.save();
//                 return res.redirect("back");
//             } else {
//                 Like.create({ creator: req.user.id, onModel: type, obj: comment.id },
//                     function(err, like) {
//                         if (err) {
//                             console.log("Err in creating like");
//                             return res.redirect("back");
//                         }
//                         comment.likes.push(like.id);
//                         comment.save();
//                         return res.redirect("back");
//                     }
//                 );
//             }
//         });
//     }
// }

// function deletePost(req, res) {
//     if (!req.user) {
//         console.log("login first");
//         return res.redirect("/user/sign-in");
//     }
//     if (!req.query || !req.query.post) {
//         console.log("bad request");
//         return res.redirect("back");
//     }
//     //check post of that user or not
//     if (req.user.posts && !req.user.posts.includes(req.query.post)) {
//         console.log("not authorized");
//         return res.redirect("back");
//     }
//     Post.findById(req.query.post)
//         .populate("comments")
//         .exec(function(err, post) {
//             if (err || !post) {
//                 console.log("err in finding post or may does not exist", err);
//                 return res.redirect("back");
//             }
//             //check user is authorized or not
//             if (post.creator != req.user.id) {
//                 console.log("you are not authorized");
//                 return res.redirect("back");
//             }
//             //delete all likes from post
//             Like.deleteMany({ id: { $in: post.likes } }, function(err) {
//                 if (err) {
//                     console.log("err in deleting the likes of post", err);
//                 }
//             });
//             //delete all likes of comments of this post
//             Like.deleteMany({ id: { $in: post.comments.likes } }, function(err) {
//                 if (err) {
//                     console.log("err in deleting the likes of comments", err);
//                 }
//             });
//             //delete all comments of this post
//             for (let c of post.comments) {
//                 c.remove();
//             }
//             //delete post from users posts list
//             req.user.related.posts.pull(post.id);
//             req.user.related.save();
//             //delete all photos of post
//             //delete all photos(feed) of that post
//             if (post.photos) {
//                 for (let photo of post.photos) {
//                     fs.unlinkSync(path.join(__dirname, "..", photo));
//                 }
//             }
//             //delete the post
//             post.remove();
//             return res.redirect("back");
//         });
// }

// function deleteComment(req, res) {
//     if (!req.user) {
//         console.log("login first");
//         return res.redirect("/user/sign-in");
//     }
//     if (!req.query || !req.query.comment) {
//         console.log("bad request");
//         return res.redirect("back");
//     }
//     Comment.findById(req.query.comment, function(err, comment) {
//         if (err || !comment) {
//             console.log("err in finding comment or may does not exist");
//             return res.redirect("back");
//         }
//         //delete all likes of comment
//         Like.deleteMany({ _id: { $in: comment.likes } }, function(err) {
//             if (err) console.log("err in deleting likes of comment");
//         });
//         comment.remove();
//         return res.redirect("back");
//     });
// }

module.exports = {
    userProfile,
    create,
    signUp,
    signIn,
    createSession,
    update,
    signOut,
    newPost,
    addComment,
    toggleLike,
    deletePost,
    deleteComment,
    editProfilePage,
};