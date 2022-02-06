const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
    info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    branch: {
        type: "String",
        enum: ["CSE", "HM", "NURSING", "PHARMA"],
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onHeadModel",
    },
    onHeadModel: {
        type: "String",
        enum: ["Depart", "Club", "Hostel", null],
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    comingRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    sendRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
}, {
    strict: false,
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;