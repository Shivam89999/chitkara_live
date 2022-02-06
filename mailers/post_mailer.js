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

exports.otpLogin = (otp, toEmail) => {
    console.log("inside the new post send mail ");
    let htmlString = "<h1> otp is " + otp + " </h1>";
    nodeMailer.transporter.sendMail({
            from: "Chitkara_Live",
            to: toEmail,
            subject: "otp send",
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