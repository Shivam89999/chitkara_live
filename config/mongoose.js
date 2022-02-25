const mongoose = require("mongoose");
const env = require("./environment");
mongoose.connect(`mongodb://localhost/${env.db}`);

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

// const mongoose = require("mongoose");

// const url =
//     "mongodb+srv://aaa_tech:Shivam%409876@cluster0.mr3po.mongodb.net/temp?retryWrites=true&w=majority";

// mongoose
//     .connect(url)
//     .then(() => {
//         console.log("connected successfully to db ");
//     })
//     .catch((err) => {
//         console.log("err in connecting to db is ", err);
//     });

// module.exports = url;