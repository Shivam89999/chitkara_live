const express = require("express");
const port = 80;
const fs = require("fs");
const path = require("path");
const app = express();

//connect app to db
const db = require("./config/mongoose");

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
//add cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//user passport
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const session = require("express-session");

//add mongoStore to store session at server permanantly
const MongoStore = require("connect-mongo");

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
                mongoUrl: "mongodb://localhost/chitkara_live",
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

app.use("/", require("./routes"));

app.listen(port, function(err) {
    if (err) {
        console.log("Err in Running the Server");
        return;
    }
    console.log("Server is up and running on port: ", port);
    return;
});