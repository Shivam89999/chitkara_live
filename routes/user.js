// request which can be by any types of user

const express = require("express");

const user_controller = require("../controller/user_controller");
const passport = require("passport");
const router = express.Router();

// router.get(
//     "/profile",
//     passport.checkAuthentication,
//     user_controller.userProfile
// );
// router.get(
//     "/back-to-profile",
//     passport.checkAuthentication,
//     user_controller.userProfile
// );
router.get("/sign-up", user_controller.signUp);
// router.get(
//     "/edit-profile-page",
//     passport.checkAuthentication,
//     user_controller.editProfilePage
// );
router.get("/sign-in", user_controller.signIn);
// router.get("/sign-out", passport.checkAuthentication, user_controller.signOut);
router.post("/create", user_controller.create);
// router.post("/update", passport.checkAuthentication, user_controller.update);
router.post(
    "/create-session",
    passport.authenticate("local", { failureRedirect: "/user/sign-in" }),
    user_controller.createSession
);

router.post("/new-post", passport.checkAuthentication, user_controller.newPost);
// router.post(
//     "/add-comment/",
//     passport.checkAuthentication,
//     user_controller.addComment
// );

router.get(
    "/delete-post/",
    passport.checkAuthentication,
    user_controller.deletePost
);
// router.get(
//     "/delete-comment/",
//     passport.checkAuthentication,
//     user_controller.deleteComment
// );

// router.get(
//     "/toggle-like/",
//     passport.checkAuthentication,
//     user_controller.toggleLike
// );
console.log("reached @@@@@@ %%%%% ");
router.use("", function(req, res) {
    console.log("running !!!!! $$$$ %%%%% & ****** ");
    return res.render("404_page_not_found");
});
module.exports = router;