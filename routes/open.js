//request which need not to authenticate
const express = require("express");
const passport = require("passport");
const router = express.Router();
console.log("running g                ggggggggggggg    ");
const open_controller = require("../controller/open_controller");

function checkValidSearchReq(req, res, next) {
    console.log("middleware running");
    if (!req.body || !req.body.name) {
        console.log("bad request ");
        return res.redirect("back");
    }
    console.log("valid request");
    next();
}
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
router.post("/search", checkValidSearchReq, open_controller.search);
router.post(
    "/search_students",
    checkValidSearchReq,
    open_controller.searchStudents
);
router.get("/notices", open_controller.notices);
router.get("/home-option-page/", open_controller.homeOptionPage);
module.exports = router;