const express = require("express");
const home_controller = require("../controller/home_controller");
const router = express.Router();

router.use("/user", require("./user"));

router.get("/", home_controller.homePage);

module.exports = router;