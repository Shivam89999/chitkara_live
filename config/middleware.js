function deletePost(req, res, next) {
    if (!req.query ||
        !req.query.post ||
        !req.query.type ||
        (req.query.type != "Post" && req.query.type != "TextPost")
    ) {
        console.log("bad request ");
        return res.redirect("back");
    }
    next();
}

function updateOrAddTeamMember(req, res, next) {
    if (!req.query || !req.query.user) {
        console.log("bad request");
        return res.redirect("back");
    }
    next();
}

function addComment(req, res, next) {
    console.log("here reached &&&&&&&&&& ");
    if (!req.body.type || !req.body.postId) {
        console.log("bad request");
        return res.redirect("back");
    }
    let type = req.body.type;
    if (type != "Post" && type != "TextPost") {
        console.log("invalid request");
        return res.redirect("back");
    }
    if (!req.body.comment || req.body.comment.length == 0) {
        console.log("comment can not be null");
        return res.redirect("back");
    }
    next();
}

function deleteComment(req, res, next) {
    if (!req.query ||
        !req.query.post ||
        !req.query.comment ||
        !req.query.type ||
        (req.query.type != "Post" && req.query.type != "TextPost")
    ) {
        return res.redirect("back");
    }
    next();
}

function posts(req, res, next) {
    if (!req.query.u || !req.query.types) {
        console.log("bad request");
        return res.redirect("back");
    }
    next();
}

function likes(req, res, next) {
    if (!req.query || !req.query.post || !req.query.type) {
        console.log("bad request ");
        return res.redirect("back");
    }
    console.log("req type ", req.query.type);
    if (req.query.type != "Post" && req.query.type != "TextPost") {
        console.log("invalid request");
        return res.redirect("back");
    }
    next();
}

function checkValidSearchReq(req, res, next) {
    console.log("middleware running");
    if (!req.body || !req.body.name) {
        console.log("bad request ");
        return res.redirect("back");
    }
    console.log("valid request");
    next();
}

function checkValidMail(email) {
    if (!email.includes("@") || !email.includes(".")) {
        return false;
    }
    return true;
}

function checkOtpRequest(req, res, next) {
    if (!req.body || !req.body.email) {
        console.log("bad request");
        return res.redirect("back");
    } //or u can add email type check condition
    let email = req.body.email;
    if (!checkValidMail(email)) {
        console.log("type valid email address");
        return res.redirect("back");
    }
    next();
}

function emailVerification(req, res, next) {
    if (!req.body || !req.body.email || !req.body.otp) {
        console.log("bad request");
        return res.redirect("back");
    }
    let email = req.body.email;
    if (!checkValidMail(email)) {
        console.log("type valid email address");
        return res.redirect("back");
    }
    next();
}

function resendMail(req, res, next) {
    if (!req.query || !req.query.email) {
        console.log("bad request");
        return res.redirect("back");
    }
    let email = req.query.email;
    if (!checkValidMail(email)) {
        console.log("type valid email address");
        return res.redirect("back");
    }
    next();
}

function passwordCheck(req, res, next) {
    if (!req.body ||
        !req.body.password ||
        !req.body.confirm_password ||
        !req.body.secret
    ) {
        console.log("bad request");
        return res.redirect("back");
    }
    if (req.body.password != req.body.confirm_password) {
        console.log("password did not match");
        return res.redirect("back");
    }
    next();
}

function checkForToogleToSave(req, res, next) {
    if (!req.query || !req.query.type || !req.query.refId) {
        console.log("bad request in addToSave ");
        return res.redirect("back");
    }
    const allowedType = ["Post", "TextPost"];
    if (!allowedType.includes(req.query.type)) {
        console.log("bad reuest ^^");
        return res.redirect("back");
    }
    next();
}

function setFlash(req, res, next) {
    res.locals.flash = {
        success: req.flash("success"),
        error: req.flash("error"),
    };
    next();
}

function deleteTypeRequestCheck(req, res, next) {
    if (!req.query || !req.query.type || !req.query.typeId) {
        if (req.xhr) {
            return res.status(400).json({
                err: " bad request ",
            });
        }
        console.log("bad request");
        return res.redirect("back");
    }
    next();
}

function checkValidPollVoteRequest(req, res, next) {
    if (!req.query || !req.query.poll_id || !req.query.vote_type) {
        if (req.xhr) {
            return res.status(400).json({
                err: "bad request",
            });
        }
        console.log("bad poll vote request");
        return res.redirect("back");
    }
    next();
}

function parseEmail(req, res, next) {
    if (req.body && req.body.email) {
        let email = req.body.email;
        // console.log("before trim ^^^^^^^^^^^^^^^^^^^^^ ", req.body);
        req.body.email = email.trim();
        // console.log("after trim ^^^^^^^^^^^^^^^^^^^^^ ", req.body);
    }
    if (req.query && req.query.email) {
        let email = req.query.email;
        // console.log("before trim ^^^^^^^^^^^^^^^^^^^^^ ", req.body);
        req.query.email = email.trim();
        // console.log("after trim ^^^^^^^^^^^^^^  ", req.query);
    }

    next();
}

function checkValidRequest(req, res, next) {
    if (!req.query || !req.query.target) {
        console.log("bad request  ");
        if (req.xhr) {
            return res.status(400).json({
                err: "bad request, target not found",
            });
        }
        return res.redirect("back");
    }
    next();
}
module.exports = {
    deletePost,
    updateOrAddTeamMember,
    addComment,
    posts,
    deleteComment,
    likes,
    checkValidSearchReq,
    checkOtpRequest,
    emailVerification,
    resendMail,
    passwordCheck,
    checkForToogleToSave,
    setFlash,
    deleteTypeRequestCheck,
    checkValidPollVoteRequest,
    checkValidRequest,
    parseEmail,
};