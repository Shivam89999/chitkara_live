const express = require("express");

const user_controller = require("../controller/user_controller");
const passport = require("passport");
const router = express.Router();

router.get("/", passport.checkAuthentication, user_controller.userProfile);
router.get("/sign-up", user_controller.signUp);
router.get("/sign-in", user_controller.signIn);
router.post("/create", user_controller.create);
router.post("/update", user_controller.update);
router.post(
    "/create-session",
    passport.authenticate("local", { failureRedirect: "/user/sign-in" }),
    user_controller.createSession
);

module.exports = router;