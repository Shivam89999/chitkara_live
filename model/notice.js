const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const NOTICE_PATH = path.join("/uploads/users/notices");

const noticeSchema = mongoose.Schema({
    caption: {
        type: "String",
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
        default: [],
    }, ],
    downloads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    noticeFile: {
        type: "String",
        required: true,
    },
    originalFileName: {
        type: "String",
    },
    image: {
        type: "String",
        default: "/images/default_pdf_image.jpg",
    },
}, {
    timestamps: true,
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, path.join(__dirname, "..", NOTICE_PATH));
    },
    filename: function(req, file, cb) {
        let uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return cb(
            null,
            file.fieldname + "-" + uniqueSuffix + "-" + file.originalname
        );
    },
});

//max size can be 25mb
const maxSize = 1024 * 1024 * 25;

noticeSchema.statics.uploadNotice = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function(req, file, cb) {
        console.log("file extension is ", file.mimetype);
        if (file.mimetype === "application/pdf") {
            return cb(null, true);
        }
        cb(null, false);
        return cb(new Error("Only pdf  file allowed!"));
    },
}).single("notice");

noticeSchema.statics.noticePath = NOTICE_PATH;

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;