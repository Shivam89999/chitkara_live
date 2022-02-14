const mongoose = require("mongoose");
const upcomingEventSchema = mongoose.Schema({
    postRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    expireAt: { type: Date, default: new Date(), index: { expires: 0 } },
}, {
    timestamps: true,
});

const upcomingEvent = mongoose.model("upcomingEvent", upcomingEventSchema);

module.exports = upcomingEvent;