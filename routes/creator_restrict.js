const express = require("express");

const router = express.Router();

const creator_restrict_controller = require("../controller/creator_restrict_controller");

router.get("/", function(req, res) {});

router.post("/new-post", creator_restrict_controller.newPost);

router.get("/delete-post/", creator_restrict_controller.deletePost);

router.get("/create-post-page", creator_restrict_controller.createPostPage);
router.get("/new-text-post-page", creator_restrict_controller.newTexPostPage);

router.post("/new-post", creator_restrict_controller.newPost);
router.post("/new-text-post", creator_restrict_controller.newTextPost);
router.get("/new-notice-page", creator_restrict_controller.newNoticePage);
router.post("/add-new-notice", creator_restrict_controller.addNewNotice);
router.get(
    "/new-event-post-page",
    creator_restrict_controller.newEventPostPage
);
router.post("/new-event-post", creator_restrict_controller.newPost);
router.get("/new-alert-page", creator_restrict_controller.newAlertPage);
router.post("/new-alert", creator_restrict_controller.newAlert);
module.exports = router;