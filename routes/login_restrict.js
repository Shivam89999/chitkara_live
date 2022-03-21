const express = require("express");
const res = require("express/lib/response");

const middleware = require("../config/middleware");

const router = express.Router();
const login_restrict_controller = require("../controller/login_restrict_controller");

router.get("/profile/", login_restrict_controller.userProfile);

router.get("/edit-profile-page", login_restrict_controller.editProfilePage);
router.get("/sign-out", login_restrict_controller.signOut);
router.post(
    "/update",

    login_restrict_controller.update
);
router.post(
    "/add-comment",
    middleware.addComment,
    login_restrict_controller.addComment
);
router.get(
    "/delete-comment/",
    middleware.deleteComment,
    login_restrict_controller.deleteComment
);

router.get("/toggle-like/", login_restrict_controller.toggleLike);
// router.get(
//     "/toggle",
//     login_restrict_controller.toggleAccount
// );
router.get("/posts/", middleware.posts, login_restrict_controller.userPosts);
router.get("/likes/", middleware.likes, login_restrict_controller.likes);

router.get(
    "/send-request/",
    middleware.checkValidRequest,
    login_restrict_controller.sendRequest
);
router.get(
    "/accept-request",
    middleware.checkValidRequest,
    login_restrict_controller.acceptRequest
);
router.get(
    "/ignore-request",
    middleware.checkValidRequest,
    login_restrict_controller.declineRequest
);
router.get(
    "/withdraw-request",
    middleware.checkValidRequest,
    login_restrict_controller.dropRequest
);
router.get(
    "/remove-membership",
    middleware.checkValidRequest,
    login_restrict_controller.removeMembership
);

router.get(
    "/profile-requests-page/",
    login_restrict_controller.profileRequestsPage
);

router.get("/events", login_restrict_controller.eventsPage);
router.get("/notice-download/", login_restrict_controller.noticeDownload);

router.post(
    "/add-new-poll",
    middleware.checkNewPollRequest,
    login_restrict_controller.addNewPoll
);
router.get("/new-poll-page", login_restrict_controller.newPollPage);
router.get(
    "/add-poll-vote/",
    middleware.checkValidPollVoteRequest,
    login_restrict_controller.addPollVote
);
// router.get("/new-question-page", login_restrict_controller.newQuestionPage);
router.get(
    "/toggle-to-save",
    middleware.checkForToogleToSave,
    login_restrict_controller.toggleToSave
);
router.get("/my-save-items", login_restrict_controller.mySaveItems);
router.get(
    "/my-save-items-details/",
    login_restrict_controller.mySaveItemsDetails
);
router.get(
    "/own-as-member-update-details-page/",
    login_restrict_controller.OwnAsMemberUpdateDetailsPage
);
router.post(
    "/own-as-member-update-details",
    login_restrict_controller.OwnAsMemberUpdateDetails
);
router.get("/poll-votes/", login_restrict_controller.pollVotes);

// router.get(
//     "/delete-poll/",
//     middleware.deletePollRequestCheck,
//     login_restrict_controller.deletePoll
// );
router.get(
    "/delete-by-type/",
    middleware.deleteTypeRequestCheck,
    login_restrict_controller.deleteTypeObj
);
router.get(
    "/load-more-post-likes/",
    login_restrict_controller.loadMorePostLikes
);
router.get(
    "/load-event-for-event-page/",
    login_restrict_controller.loadMoreEvents
);
router.get("/toggle-b/w-accounts", login_restrict_controller.toggleAccount);
router.post(
    "/new-creator-account-request",
    login_restrict_controller.newCreatorAccountRequest
);
router.get(
    "/fetch-toggle-account-details/:userId",
    login_restrict_controller.toggleAccountDetail
);
router.get(
    "/add-post-like/:postId",

    login_restrict_controller.addPostLike
);
router.use("", function(req, res) {
    //console.log("reache d!!!!!!!!!!!!!!! ");
    return res.render("404_page_not_found");
});
module.exports = router;