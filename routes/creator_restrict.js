const express = require("express");
const middleware = require("../config/middleware");

const router = express.Router();

const creator_restrict_controller = require("../controller/creator_restrict_controller");

router.get("/", function(req, res) {});

// router.post("/new-post", creator_restrict_controller.newPost);

router.get(
    "/delete-post/",
    middleware.deletePost,
    creator_restrict_controller.deletePost
);

router.get("/create-post-page", creator_restrict_controller.createPostPage);
router.get("/new-text-post-page", creator_restrict_controller.newTexPostPage);

router.post(
    "/new-post",

    creator_restrict_controller.newPost
);
router.post(
    "/new-text-post",
    middleware.checkForTextPostOrAlert,
    creator_restrict_controller.newTextPost
);
router.get("/new-notice-page", creator_restrict_controller.newNoticePage);
router.post("/add-new-notice", creator_restrict_controller.addNewNotice);
router.get(
    "/new-event-post-page",
    creator_restrict_controller.newEventPostPage
);
router.post("/new-event-post", creator_restrict_controller.newPost);
router.get("/new-alert-page", creator_restrict_controller.newAlertPage);
router.post(
    "/new-alert",
    middleware.checkForTextPostOrAlert,
    creator_restrict_controller.newAlert
);

router.get("/update-menu/", creator_restrict_controller.updateMenu);
router.post(
    "/update-day-time-menu-content",
    creator_restrict_controller.updateDayTimeMenuContent
);
router.get(
    "/add-new-team-member-select-user",
    creator_restrict_controller.addNewTeamMemberSelectUser
);
router.get(
    "/updateOrAddTeamMember/",
    middleware.updateOrAddTeamMember,
    creator_restrict_controller.updateOrAddTeamMember
);
router.post(
    "/add-new-team-member",
    creator_restrict_controller.addNewTeamMember
);
router.post(
    "/update-team-member",
    creator_restrict_controller.UpdateTeamMember
);
router.post(
    "/delete-team-member",
    creator_restrict_controller.deleteTeamMember
);
router.get(
    "/update-Team-Member/",
    creator_restrict_controller.update_Team_Member
);
router.get(
    "/delete-Team-Member/",
    creator_restrict_controller.delete_Team_Member
);

router.use("", function(req, res) {
    //console.log("reache d!!!!!!!!!!!!!!! ");
    return res.render("404_page_not_found");
});

module.exports = router;