const express = require("express");

// const port = 8000;
const fs = require("fs");

const path = require("path");
const app = express();
const port = process.env.PORT || 8000;
const mongoose = require("mongoose");
//connect app to db
const db = require("./config/mongoose");

// const DB =
//     "mongodb+srv://aaa_tech:Shivam@9876@cluster0.mr3po.mongodb.net/temp?retryWrites=true&w=majority";

//adding the sass middleware
const sass = require("node-sass-middleware");
app.use(
    sass({
        src: "./assets/scss",
        dest: "./assets/css",
        debug: true,
        outputStyle: "expanded",
        prefix: "/css",
    })
);

//set up the layouts
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
//extracts the style or script tag from body in case of layouts
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

app.set("view engine", "ejs");
app.set("views", "./views");
app.set("layout", "./layouts/home_layout");
//this is a middleware
// app.use(function(req, res, next) {
//     console.log("This is middleware ", req.url);
//     next();
// });

//set the assets
app.use(express.static("./assets"));

//make uplods path available to browser
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(express.urlencoded());
// var bodyParser = require("body-parser");
// app.use(bodyParser.json({ limit: "500mb" }));
// app.use(
//     bodyParser.urlencoded({
//         limit: "500mb",
//         extended: true,
//         parameterLimit: 500000,
//     })
// );
//add cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//user passport
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const passportGoogle = require("./config/passport-google-oauth2-strategy");
const session = require("express-session");

//add mongoStore to store session at server permanantly
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const customMWare = require("./config/middleware");
app.use(
    session({
        name: "chitkara_live",
        secret: "something",
        saveUninitialized: false,
        resave: false,
        cookie: {
            //1 min = 60000
            maxAge: 1000 * 1000 * 10000,
        },
        store: MongoStore.create({
                // mongoUrl: "mongodb://localhost/chitkara_live",
                mongoUrl: "mongodb+srv://aaa_tech:Shivam%409876@cluster0.mr3po.mongodb.net/temp?retryWrites=true&w=majority",
                autoRemove: "disabled",
            },
            function(err) {
                console.log(err || "connect-mongo successfully");
            }
        ),
    })
);

//intialize the passport
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

//add flash
app.use(flash());
app.use(customMWare.setFlash);
app.use("/", require("./routes"));

app.listen(port, function(err) {
    if (err) {
        console.log("Err in Running the Server");
        return;
    }
    console.log("Server is up and running on port: ", port);
    return;
});