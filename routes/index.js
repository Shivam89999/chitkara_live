const express = require("express");
const passport = require("passport");

const router = express.Router();

router.use("/organiser", require("./organiser"));
router.use(
    "/user",
    passport.checkAuthentication,
    passport.notOrganiser,
    require("./login_restrict")
);
router.use(
    "/creator",
    passport.notOrganiser,
    passport.checkCreator,
    require("./creator_restrict")
);

router.use("/", require("./open"));
module.exports = router;