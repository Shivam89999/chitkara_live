const express = require("express");
const passport = require("passport");
const organiser_controller = require("../controller/organiser_controller");
const router = express.Router();

router.get("/sign-in", organiser_controller.signIn);
router.get("/sign-out", organiser_controller.signOut);
// router.post(
//     "/create-me",
//     function(req, res, next) {
//         console.log("reached ", req.body);
//         next();
//     },
//     organiser_controller.create
// );
router.post(
    "/create-session",
    passport.authenticate("local", {
        failureRedirect: "/organiser/sign-in",
    }),
    organiser_controller.createSession
);

router.use("/", passport.checkOrganiser, require("./organiser_login_restrict"));

module.exports = router;