const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const MEMBER_PATH = path.join("/uploads/users/member");
const default_team_cover_image =
    MEMBER_PATH + "/" + "default_team_cover_image.jpg";
const memberSchema = mongoose.Schema({
    heading: {
        type: "String",
        default: "Team Member",
    },
    desc: {
        type: "String",
        default: "Working Criteria or Rights of the member not updated yet",
    },
    image: {
        type: "String",
        default: default_team_cover_image,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, path.join(__dirname, "..", MEMBER_PATH));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return cb(
            null,
            file.fieldname + "-" + uniqueSuffix + "-" + file.originalname
        );
    },
});
//max 5 mb size allowed
const maxSize = 1024 * 1024 * 5;
memberSchema.statics.uploadMember = multer({
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
}).single("memberPhoto");

memberSchema.statics.memberPath = MEMBER_PATH;
memberSchema.statics.defaultTeamCoverImage = default_team_cover_image;
const Member = mongoose.model("Member", memberSchema);
module.exports = Member;