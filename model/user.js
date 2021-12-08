const mongoose = require("mongoose");

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
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;