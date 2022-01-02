const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const AVATAR_PATH = path.join("/uploads/users/avatars");

const userSchema = mongoose.Schema({
    name: {
        type: "String",
    },
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    password: {
        type: "String",
        required: true,
        select: false,
    },
    pic: {
        type: "String",
        default: AVATAR_PATH + "/" + "avatar-default_profile.png",
    },
    bio: {
        type: "String",
    },
    mobile: {
        type: "String",
    },
    whatsapp: {
        type: "String",
    },
    related: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel",
    },
    onModel: {
        type: "String",
        enum: ["Student", "Club", "Hostel", "Depart"],
    },
}, {
    timestamps: true,
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, path.join(__dirname, "..", AVATAR_PATH));
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

userSchema.statics.uploadAvatar = multer({
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
}).single("avatar");

userSchema.statics.avatarPath = AVATAR_PATH;
const User = mongoose.model("User", userSchema);

module.exports = User;