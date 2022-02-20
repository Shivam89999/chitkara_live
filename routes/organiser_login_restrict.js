const express = require("express");
const organiser_controller = require("../controller/organiser_controller");
const router = express.Router();

router.get("/", organiser_controller.home);
router.post("/sign-out", organiser_controller.signOut);
router.get("/profile", organiser_controller.profile);
router.post("/add_admin", organiser_controller.add_admin);
router.get("/delete-admin/", organiser_controller.delete_admin);
router.get(
    "/add_new_creator_or_organiser_page",
    organiser_controller.add_new_creator_or_organiser_page
);
router.post(
    "/add_new_creator_or_organiser",
    organiser_controller.add_new_creator_or_organiser
);
router.post("/search", organiser_controller.search);
router.get("/my-profile", organiser_controller.myProfile);
router.get("/edit-profile-page", organiser_controller.myEditProfilePage);
router.post("/update-my-profile", organiser_controller.updateMyProfile);
router.get("/requests-page", organiser_controller.creatorAccountRequests);
router.get(
    "/creator-account-request/",
    organiser_controller.handleCreatorAccountRequests
);
router.post(
    "/reject-creator-account-request",
    organiser_controller.rejectCreatorAccountRequest
);
router.post(
    "/accept-creator-account-request/",
    organiser_controller.acceptCreatorAccountRequest
);
module.exports = router;