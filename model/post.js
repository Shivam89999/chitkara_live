const mongoose = require("mongoose");

const multer = require("multer");
const path = require("path");
const FEED_PATH = path.join("/uploads/users/feed");

const postSchema = mongoose.Schema({
    caption: {
        type: "String",
    },
    photos: [{
        type: "String",
        required: true,
    }, ],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }, ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
    }, ],
    eventStartTime: {
        type: Date,
        default: null,
    },
    eventEndTime: {
        type: Date,
        default: null,
    },
    venu: {
        type: "String",
        default: "",
    },
}, {
    timestamps: true,
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, path.join(__dirname, "..", FEED_PATH));
    },
    filename: function(req, file, cb) {
        let uniquesSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return cb(
            null,
            file.fieldname + "-" + uniquesSuffix + "-" + file.originalname
        );
    },
});
const maxSize = 60000000000;
postSchema.statics.uploadFeed = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function(req, file, cb) {
        console.log("file.mimetype is: ", file.mimetype);
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
}).array("post", 8);
postSchema.statics.feedPath = FEED_PATH;

const Post = mongoose.model("Post", postSchema);
module.exports = Post;