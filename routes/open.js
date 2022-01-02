//request which need not to authenticate
const express = require("express");
const passport = require("passport");
const router = express.Router();
console.log("running g                ggggggggggggg    ");
const open_controller = require("../controller/open_controller");

router.get("/sign-up", open_controller.signUp);
router.get("/sign-in", open_controller.signIn);
router.post("/create", open_controller.create);
router.post(
    "/create-session",
    passport.authenticate("local", { failureRedirect: "/sign-in" }),
    open_controller.createSession
);

router.get("/", open_controller.homePage);
router.get("/options/", open_controller.findOptions);
router.post("/search", open_controller.search);
router.get("/notices", open_controller.notices);
router.get("/home-option-page/", open_controller.homeOptionPage);
module.exports = router;