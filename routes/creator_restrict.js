const express = require("express");

const router = express.Router();

const creator_restrict_controller = require("../controller/creator_restrict_controller");

router.get("/", function(req, res) {});

router.post("/new-post", creator_restrict_controller.newPost);

router.get("/delete-post/", creator_restrict_controller.deletePost);

router.get("/create-post-page", creator_restrict_controller.createPostPage);
router.get("/new-text-post-page", creator_restrict_controller.newTexPostPage);

router.post(
    "/new-post",
    function(req, res, next) {
        if (!req.body || req.body.eventStartTime || req.body.eventEndTime) {
            console.log(
                "event start date & time or  end date & time is not allowed in simple post "
            );
            return res.redirect("back");
        }
        next();
    },
    creator_restrict_controller.newPost
);
router.post("/new-text-post", creator_restrict_controller.newTextPost);
router.get("/new-notice-page", creator_restrict_controller.newNoticePage);
router.post("/add-new-notice", creator_restrict_controller.addNewNotice);
router.get(
    "/new-event-post-page",
    creator_restrict_controller.newEventPostPage
);
router.post(
    "/new-event-post",
    function(req, res, next) {
        //can not apply this logic bcz data is multipart so we don't have req.body
        // if (!req.body || !req.body.eventStartTime || !req.body.eventEndTime) {
        //     console.log(
        //         "start date & time of event and end date & time is required "
        //     );
        //     return res.redirect("back");
        // }
        next();
    },
    creator_restrict_controller.newPost
);
router.get("/new-alert-page", creator_restrict_controller.newAlertPage);
router.post("/new-alert", creator_restrict_controller.newAlert);

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
    function(req, res, next) {
        if (!req.query || !req.query.user) {
            console.log("bad request");
            return res.redirect("back");
        }
        next();
    },
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
router.get(
    "/update-Team-Member/",
    creator_restrict_controller.update_Team_Member
);

module.exports = router;