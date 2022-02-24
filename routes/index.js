const express = require("express");
const passport = require("passport");

const router = express.Router();
const middleware = require("../config/middleware");
// router.get("/", function(req, res, next) {
//     return res.end("This is sending");
// });
router.use(
    "/organiser",
    // middleware.checkOrSetDarkModeStatus,
    middleware.parseEmail,
    require("./organiser")
);
router.use(
    "/user",
    // middleware.checkOrSetDarkModeStatus,
    middleware.parseEmail,
    passport.checkAuthentication,
    passport.notOrganiser,
    require("./login_restrict")
);
router.use(
    "/creator",
    // middleware.checkOrSetDarkModeStatus,
    middleware.parseEmail,
    passport.notOrganiser,
    passport.checkCreator,
    require("./creator_restrict")
);
router.use("/api", require("./api"));

router.use(
    "/",
    // middleware.checkOrSetDarkModeStatus,
    middleware.parseEmail,
    require("./open")
);

module.exports = router;