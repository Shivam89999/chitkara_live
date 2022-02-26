const fs = require("fs");
const rfs = require("rotating-file-stream");
const path = require("path");

const logDirectory = path.join(__dirname, "../production_logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs("access.log", {
    interval: "1d",
    path: logDirectory,
});

const development = {
    name: "development",
    asset_path: "./assets",
    session_cookie_key: "somethingencoded",
    db: "chitkara_live_development",
    smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,

        auth: {
            // user: "shivammittal00786@gmail.com",
            // pass: "Shivam@2515875",
            user: "aaa.techy.in@gmail.com",
            pass: "Shivam@9876",
        },
        // name: "AAA Tech",
    },
    google_client_id: "120170884583-fgn2q0um1p6svnt006jisb1ivtnfb2s2.apps.googleusercontent.com",
    google_client_secret: "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",
    google_callback_url: "http://chitkaralive.com/auth/google/callback",
    morgan: {
        mode: "dev",
        options: {
            stream: accessLogStream,
        },
    },
};

const production = {
    name: "production",
    asset_path: process.env.LIVE_ASSET,
    session_cookie_key: process.env.LIVE_SESSION_COOKIE_KEY,
    db: process.env.LIVE_DB,
    smtp: {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,

        auth: {
            // user: "shivammittal00786@gmail.com",
            // pass: "Shivam@2515875",
            user: process.env.LIVE_GMAIL_USERNAME,
            pass: process.env.LIVE_GMAIL_PASSWORD,
        },
        // name: "AAA Tech",
    },
    google_client_id: process.env.LIVE_GOOGLE_CLIENT_ID,
    google_client_secret: process.env.LIVE_GOOGLE_CLIENT_SECRET,
    // google_callback_url: process.env.LIVE_GOOGLE_CALLBACK_URL,
    google_callback_url: "http://chitkaralive.com/auth/google/callback",
    morgan: {
        mode: "combined",
        options: {
            stream: accessLogStream,
        },
    },
};

module.exports =
    eval(process.env.LIVE_ENVIRONMENT) == undefined ?
    development :
    eval(process.env.LIVE_ENVIRONMENT);
// module.exports = development;