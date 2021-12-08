const express = require("express");

const user_controller = require("../controller/user_controller");

const router = express.Router();

router.get("/", user_controller.userProfile);
router.get("/sign-up", user_controller.signUp);
router.post("/create", user_controller.create);

module.exports = router;