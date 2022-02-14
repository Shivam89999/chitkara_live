const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const FOOD_PATH = path.join("/uploads/users/food");
const default_food_image = FOOD_PATH + "/" + "default_food.jpg";
const foodDetail = mongoose.Schema({
    items: {
        type: "String",
        default: "Food items not updated ",
    },
    image: {
        type: "String",
        default: default_food_image,
    },
    fromTime: {
        type: Date,
        default: null,
    },
    toTime: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
}, {
    strict: false,
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, path.join(__dirname, "..", FOOD_PATH));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return cb(
            null,
            file.fieldname + "-" + uniqueSuffix + "-" + file.originalname
        );
    },
});

//max size can be 5mb
const maxSize = 1024 * 1024 * 5;

foodDetail.statics.uploadFoodImage = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function(req, file, cb) {
        console.log("file extension is ", file.mimetype);
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            return cb(null, true);
        }
        cb(null, false);
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    },
}).single("foodImage");
foodDetail.statics.foodPath = FOOD_PATH;
foodDetail.statics.defaultFoodImage = default_food_image;
const FoodDetail = mongoose.model("FoodDetail", foodDetail);

module.exports = FoodDetail;