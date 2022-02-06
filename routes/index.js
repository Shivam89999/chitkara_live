const express = require("express");
const passport = require("passport");

const router = express.Router();
const middleware = require("../config/middleware");

router.use("/", middleware.parseEmail, require("./open"));
router.use("/organiser", middleware.parseEmail, require("./organiser"));
router.use(
    "/user",
    middleware.parseEmail,
    passport.checkAuthentication,
    passport.notOrganiser,
    require("./login_restrict")
);
router.use(
    "/creator",
    middleware.parseEmail,
    passport.notOrganiser,
    passport.checkCreator,
    require("./creator_restrict")
);
router.use("/api", require("./api"));
module.exports = router;