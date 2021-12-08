const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/chitkara_live");

const db = mongoose.connection;

db.on("error", function(err) {
    if (err) {
        console.log("Err in connecting to db : ", err);
    }
});

db.once("open", function() {
    console.log("connected to db successfully !");
});

module.exports = db;