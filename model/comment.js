const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    content: {
        type: "String",
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    related: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
    }, ],
}, {
    timestamps: true,
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;