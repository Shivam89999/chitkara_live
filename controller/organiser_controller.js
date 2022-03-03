const Organiser = require("../model/organiser");
const User = require("../model/user");
const Club = require("../model/club");
const Depart = require("../model/depart");
const Hostel = require("../model/hostel");
const Requests = require("../model/creatorRequest");
const fs = require("fs");
const path = require("path");
const requestMailer = require("../mailers/request_mailer");
const creatorAccountRequestVerifiedEmail = require("../model/creatorAccountRequestVerifiedMail");
const queue = require("../config/kue");
const communicationEmailWorker = require("../workers/communication_mail_worker");
const adminMailer = require("../mailers/admin_mailer");

function signIn(req, res) {
    // console.log("right 77777777777777");
    if (req.user) {
        console.log("you already sign-in");
        return res.redirect("/organiser");
    }
    return res.render("./organiser/sign_in", {
        title: "Organiser Sign-In Page",
        layout: "./layouts/organiser_layout",
    });
}

function signOut(req, res) {
    if (req.user) {
        req.logout();
    }
    return res.redirect("/organiser");
}

async function home(req, res) {
    if (!req.user) {
        console.log("login first");
        return res.redirect("/organiser/sign-in");
    }

    let clubs = [],
        hostels = [],
        departs = [];
    clubs = await User.find({ onModel: "Club" });
    hostels = await User.find({ onModel: "Hostel" });
    departs = await User.find({ onModel: "Depart" });

    return res.render("./organiser/home", {
        title: "Organiser Home Page",
        layout: "./layouts/organiser_layout",
        clubs: clubs,
        hostels: hostels,
        departs: departs,
    });
}

function createSession(req, res) {
    return res.redirect("/organiser/");
}

// //delete this fn brfore live
// function create(req, res) {
//     console.log("reached ", req.body);
//     if (!req.body) {
//         return res.redirect("back");
//     }
//     const info = req.body;
//     Organiser.create({ name: info.name, email: info.email, password: info.password },
//         function(err, organiser) {
//             if (err) {
//                 console.log("err in creating organiser ", err);
//             }
//             console.log("organiser created successfully");
//             return res.redirect("/organiser/sign-in");
//         }
//     );
// }

function profile(req, res) {
    const id = req.query.profile;
    User.findById(id)
        .populate({
            path: "related",
            populate: {
                path: "admin",
            },
        })
        .exec(function(err, profile) {
            if (profile) {
                return res.render("./organiser/profile", {
                    layout: "./layouts/organiser_layout",
                    profile,
                });
            }
            return res.redirect("back");
        });
}

function user_profile(req, res) {
    let email = req.query.mail;
    User.findOne({ email: email, onModel: "Student" })
        .populate("related")
        .exec(function(err, user) {
            if (user) {
                return res.render("./organiser/user_profile", {
                    layout: "./layouts/organiser_layout",
                    user_profile: user,
                });
            }
            console.log("err in finding user or may does not exist in student model");
            return res.redirect("back");
        });
}
async function setHeadNull(targetId, creatorProfile) {
    User.findById(targetId)
        .populate("related")
        .exec(function(err, user) {
            if (err || !user) {
                return;
            }
            user.related.head = null;
            user.related.onHeadModel = null;
            user.related.save();
            user.save();
            adminMailer.removeAdmin({
                targetEmail: user.email,
                targetName: user.name,
                creatorProfile: creatorProfile,
            });
        });
}
async function add_admin(req, res) {
    //  console.log("body is ", req.body);
    if (!req.body || !req.body.email || !req.body.of) return res.redirect("back");
    User.findOne({ email: req.body.email, onModel: "Student" })
        .populate("related")
        .exec(function(err, user) {
            if (user) {
                //check user is already an admin or not
                // console.log("user.related.head ", user.related);
                if (user.related.head) {
                    console.log("head is %%%%%%%%%%%% ", user.related);
                    console.log(
                        "this is already admin of any ",
                        user.related.onHeadModel
                    );
                    // return res.redirect("back");
                    return res.end(
                        "this is already admin of any " + user.related.onHeadModel
                    );
                }
                //add admin
                User.findById(req.body.of)
                    .populate("related")
                    .exec(async function(err, creator) {
                        if (creator) {
                            console.log("creator ", creator);
                            console.log("creator is ", creator.id);
                            //find admin user and set head of it as null;
                            if (creator.related.admin != null) {
                                await setHeadNull(creator.related.admin, creator);
                            }
                            creator.related.admin = user.id;
                            creator.related.save();
                            creator.save();
                            user.related.head = creator.id;
                            //  user.related.onHeadModel = creator.onModel;
                            user.related.save();
                            user.save();
                            //send add admin mail to target user
                            adminMailer.addAdmin({
                                targetEmail: user.email,
                                targetName: user.name,
                                creatorProfile: creator,
                            });
                            console.log("user is ", user);
                            console.log("admin addedd successfully");
                            console.log("user is ", user);
                        }
                    });
                return res.redirect("back");
            }
            // console.log("err in finding user or may does not exist in student model");
            // return res.end(
            //     "err in finding user or may does not exist in student model"
            // );
        });
}

function delete_admin(req, res) {
    let id = req.query.u;
    User.findById(id)
        .populate("related")
        .exec(function(err, user) {
            if (user) {
                console.log("user is ", user);
                if (user.onModel != "Student" || !user.related.head)
                    return res.redirect("back");
                User.findById(user.related.head)
                    .populate("related")
                    .exec(function(err, creator) {
                        //delete from creator admin field
                        creator.related.admin = null;
                        creator.related.save();
                        creator.save();
                        user.related.head = null;
                        user.related.onHeadModel = null;
                        user.related.save();
                        user.save();
                        adminMailer.removeAdmin({
                            targetEmail: user.email,
                            targetName: user.name,
                            creatorProfile: creator,
                        });
                        console.log("deleted successfully");
                        console.log("user is ", user);
                        return res.redirect("back");
                    });
            }
        });
}

function add_new_creator_or_organiser_page(req, res) {
    return res.render("./organiser/add_new_creator_or_organiser_page", {
        layout: "./layouts/organiser_layout",
        title: "add_new_organiser_or_creator_page",
    });
}

async function add_new_creator_or_organiser(req, res) {
    let allowedType = ["Club", "Depart", "Hostel", "Organiser"];
    let body = req.body;
    if (!body ||
        !body.email ||
        !body.password ||
        !body.tick ||
        !allowedType.includes(body.tick) ||
        body.password != body.confirm_password
    )
        return res.redirect("back");
    let user = await Organiser.findOne({ email: body.email });
    if (user) {
        console.log("this email is already exist");
        return res.redirect("back");
    }
    user = await User.findOne({ email: body.email });
    if (user) {
        console.log("this email is already exist in db");
        return res.redirect("back");
    }

    //if type is organiser
    if (body.tick === "Organiser") {
        Organiser.create({
                email: body.email,
                password: body.password,
                name: body.name,
            },
            function(err, user) {
                if (user) {
                    console.log("user created successfully");
                    return res.redirect("/organiser");
                } else {
                    console.log("err in creating user");
                    return res.redirect("back");
                }
            }
        );
    }
    //else
    else {
        let model =
            body.tick === "Club" ?
            Club :
            body.tick === "Hostel" ?
            Hostel :
            body.tick === "Depart" ?
            Depart :
            null;

        User.create({
                email: body.email,
                password: body.password,
                name: body.name,
            },
            function(err, user) {
                if (user) {
                    model.create({ info: user.id }, function(err, final) {
                        if (final) {
                            user.related = final.id;
                            user.onModel = body.tick;
                            user.save();
                            console.log("user created successfully");
                            return res.redirect("/organiser");
                        } else {
                            console.log("err in creating");
                            return res.redirect("back");
                        }
                    });
                } else {
                    console.log("err in creating user");
                    return res.redirect("back");
                }
            }
        );
    }
}

async function search(req, res) {
    let name = req.body.name;
    User.find({ name: { $regex: name, $options: "i" } })
        .populate({
            path: "related",
            populate: {
                path: "admin",
            },
        })
        .exec(function(err, users) {
            let results = [];
            //  console.log("users ", users);
            if (users)
                results = users.filter(function(item) {
                    return item.onModel != "Student";
                });
            //  console.log("results ", results);
            return res.render("./organiser/search_result", {
                layout: "./layouts/organiser_layout",
                title: "search_result_page",
                results: results,
            });
        });
}

function myProfile(req, res) {
    Organiser.findById(req.user.id, function(err, profile) {
        if (profile) {
            console.log("profile find successfully ", profile);
            return res.render("./organiser/my_profile", {
                layout: "./layouts/organiser_layout",
                title: "my profile page",
                my: profile,
            });
        }
        return res.redirect("back");
    });
}

function myEditProfilePage(req, res) {
    Organiser.findById(req.user.id, function(err, profile) {
        if (profile) {
            return res.render("./organiser/edit_profile_page", {
                layout: "./layouts/organiser_layout",
                title: "my Edit profile page",
                me: profile,
            });
        }
        return res.redirect("");
    });
}

function updateMyProfile(req, res) {
    Organiser.uploadAvatar(req, res, function(err) {
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
        req.user.name = req.body.name;
        req.user.bio = req.body.bio;
        req.user.whatsapp = req.body.whatsapp;
        req.user.mobile = req.body.mobile;
        if (req.file) {
            if (req.user.pic) fs.unlinkSync(path.join(__dirname, "..", req.user.pic));
            req.user.pic = Organiser.avatarPath + "/" + req.file.filename;
        }
        req.user.save();
        return res.redirect("/organiser/my-profile");
    });
}
async function creatorAccountRequests(req, res) {
    let allRequest = await Requests.find({}).populate("by");
    return res.render("./organiser/requests_page", {
        layout: "./layouts/organiser_layout",
        title: "requests page",
        allRequest: allRequest,
    });
}

async function acceptCreatorAccountRequest(req, res) {
    try {
        const targetId = req.body.target.trim();
        let request = await Requests.findById(targetId).populate("by").exec();
        if (!request) {
            console.log("no request found");
            return res.end("no request found");
        }
        let info = {
            targetEmail: request.by.email,
            name: request.by.name,
            email: request.by.email,
            data: {
                name: request.name,
                email: request.email,
                type: request.onModel,
            },
        };
        //confirm again that requester should be  student
        if (request.by.onModel != "Student") {
            return res.end(
                "request user is not student, so we advise you to reject this request"
            );
        }
        //confirm again that requester should not be head of any other account
        if (request.by.related.head != null) {
            return res.end(
                "request user is already head of some account, so we advise you to reject this request"
            );
        }
        //confirm again that email should not be already registered
        let u = await User.findOne({ email: request.email });
        if (u != null) {
            return res.end(
                "target email is already registered , so we advise you to reject this request"
            );
        }
        const accVerified = await creatorAccountRequestVerifiedEmail.create({
            name: info.data.name,
            email: info.data.email,
            type: info.data.type,
            by: request.by.id,
        });
        //delete request obj~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$$$$$$$$$$$$$$$$$$
        request.remove();
        console.log("request accepted and link generated");
        const accountActivateLink =
            "/activate-creator-account-page-link?secret=" + accVerified.id;

        //send mail to requested user that request acccepted
        requestMailer.creatorRequestAccept(info);
        requestMailer.creatorAccountActivateLink({
            targetEmail: request.email,
            name: request.by.name,
            email: request.by.email,
            data: {
                name: request.name,
                email: request.email,
                type: request.onModel,
                link: accountActivateLink,
            },
        });
        return res.end("request accepted successfully");
    } catch (err) {
        console.log("err in accepting request " + err);
        return res.end("err in accepting request " + err);
    }
}

async function rejectCreatorAccountRequest(req, res) {
    try {
        const targetId = req.body.target.trim();
        let request = await Requests.findById(targetId).populate("by").exec();
        if (!request) {
            console.log("no request found");
            return res.end("no request found");
        }
        let info = {
            targetEmail: request.by.email,
            name: request.by.name,
            data: {
                name: request.name,
                email: request.email,
                type: request.onModel,
                reason: req.body.reject_reason.trim(),
            },
        };
        await request.remove();
        //send mail to target user
        requestMailer.creatorRequestReject(info);
        return res.end("request rejected successfully");
    } catch (err) {
        console.log("err in rejecting request ");
        return res.end("err in rejecting request ");
    }
}
async function handleCreatorAccountRequests(req, res) {
    try {
        let type = req.query.type.trim();
        let targetId = req.query.target.trim();
        if (type != "Accept" && type != "Reject") {
            console.log("bad request not correct type ");
            if (req.xhr) {
                return res.status(400).json({
                    err: "Bad request not correct type",
                });
            }

            return res.end("Bad request not correct type");
        }
        let request = await Requests.findById(targetId).populate("by").exec();
        // if (type == "Reject") {
        return res.render("./organiser/requests_confirmation_page", {
            layout: "./layouts/organiser_layout",
            title: "requests Confirmation page",
            request: request,
            type: type,
        });
        // }
    } catch (err) {
        console.log("err in handle creator account request");
        return res.end("err in handle creator account request");
    }
}
async function allMailPage(req, res) {
    return res.render("./organiser/comunication_mail_to_all", {
        layout: "./layouts/organiser_layout",
        title: "Communication Mail",
    });
}
async function sendCommunicationMail(req, res) {
    User.find({}).exec(function(err, users) {
        if (err || !users) {
            console.log("err in finding users or no user found " + err);
            return res.end("err in finding users or no user found " + err);
        }
        for (let user of users) {
            let job = queue
                .create("communication", {
                    targetEmail: user.email,
                    data: {
                        user: user,
                        heading: req.body.mail_heading,
                        content: req.body.mail_content,
                    },
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
        return res.end("worker will process the job");
    });
}

module.exports = {
    signOut,
    signIn,
    home,
    createSession,
    profile,
    user_profile,
    add_admin,
    delete_admin,
    add_new_creator_or_organiser_page,
    add_new_creator_or_organiser,
    search,
    myProfile,
    myEditProfilePage,
    updateMyProfile,
    creatorAccountRequests,
    handleCreatorAccountRequests,
    rejectCreatorAccountRequest,
    acceptCreatorAccountRequest,
    allMailPage,
    sendCommunicationMail,
    // create,
};