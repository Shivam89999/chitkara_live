const express = require("express");

const passport = require("passport");
const router = express.Router();
const login_restrict_controller = require("../controller/login_restrict_controller");
const open_controller = require("../controller/open_controller");

router.get("/profile/", login_restrict_controller.userProfile);

router.get("/edit-profile-page", login_restrict_controller.editProfilePage);
router.get("/sign-out", login_restrict_controller.signOut);
router.post("/update", login_restrict_controller.update);
router.post("/add-comment/", login_restrict_controller.addComment);
router.get("/delete-comment/", login_restrict_controller.deleteComment);

router.get("/toggle-like/", login_restrict_controller.toggleLike);
// router.get(
//     "/toggle",
//     login_restrict_controller.toggleAccount
// );
router.get("/posts/", login_restrict_controller.userPosts);
router.get("/likes/", login_restrict_controller.likes);

router.get("/send-request/", login_restrict_controller.sendRequest);
router.get("/accept-request", login_restrict_controller.acceptRequest);
router.get("/ignore-request", login_restrict_controller.declineRequest);
router.get("/withdraw-request", login_restrict_controller.dropRequest);
router.get("/remove-membership", login_restrict_controller.removeMembership);

router.get(
    "/profile-requests-page",
    login_restrict_controller.profileRequestsPage
);

router.get("/events", login_restrict_controller.eventsPage);
router.get("/notice-download/", login_restrict_controller.noticeDownload);

router.post("/add-new-poll", login_restrict_controller.addNewPoll);
router.get("/new-poll-page", login_restrict_controller.newPollPage);
router.get("/new-question-page", login_restrict_controller.newQuestionPage);
module.exports = router;