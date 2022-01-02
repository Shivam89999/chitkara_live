const mongoose = require("mongoose");

const textPostSchema = mongoose.Schema({
    content: {
        type: "String",
        required: true,
    },
    caption: {
        type: "String",
    },
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
}, {
    timestamps: true,
});

const TextPost = mongoose.model("textPostSchema", textPostSchema);

module.exports = TextPost;