const nodeMailer = require("../config/nodemailer");

exports.newPost = (post) => {
    console.log("inside the new post send mail ");
    let htmlString = nodeMailer.renderTemplate({ post: post },
        "/posts/new_post.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: "shivamgupta.cse19@chitkarauniversity.edu.in",
            subject: "new Post published",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new comment: ", err);
                return;
            }
            console.log("mail send for new comment successfully");
            return;
        }
    );
};

exports.newPoll = (obj) => {
    console.log("inside the new poll send mail ");
    let htmlString = nodeMailer.renderTemplate({ obj: obj },
        "/poll/new_poll.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: obj.targetEmail,
            subject: "new Poll Added",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new poll: ", err);
                return;
            }
            console.log("mail send for new poll successfully");
            return;
        }
    );
};

exports.newAlert = (obj) => {
    console.log("inside the new alert send mail ");
    let htmlString = nodeMailer.renderTemplate({ obj: obj },
        "/alert/new_alert.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: obj.targetEmail,
            subject: "New Alert Added",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new alert: ", err);
                return;
            }
            console.log("mail send for new alert successfully");
            return;
        }
    );
};

exports.newNotice = (obj) => {
    console.log("inside the new Notice send mail ");
    let htmlString = nodeMailer.renderTemplate({ obj: obj },
        "/notice/new_notice.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: obj.targetEmail,
            subject: "New Notice Added",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new notice: ", err);
                return;
            }
            console.log("mail send for new notice successfully");
            return;
        }
    );
};

exports.newEvent = (obj) => {
    console.log("inside the new Notice send mail ");
    let htmlString = nodeMailer.renderTemplate({ obj: obj },
        "/event/new_events.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: obj.targetEmail,
            subject: "New Event Added",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new Event: ", err);
                return;
            }
            console.log("mail send for new Event successfully");
            return;
        }
    );
};