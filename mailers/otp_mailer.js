const nodeMailer = require("../config/nodemailer");
const from = "Aaa Tech <aaa.techy.in@gmail.com";
exports.otpLogin = (otp, toEmail) => {
    // console.log("inside the new post send mail ");
    let htmlString = nodeMailer.renderTemplate({ otp: otp }, "/otp/otp.ejs");
    console.log("htmlString is ", htmlString);
    nodeMailer.transporter.sendMail({
            from: from,
            to: toEmail,
            subject: "New Otp recieved ",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for otp : ", err);
                return;
            }
            console.log("mail send for otp successfully");
            return;
        }
    );
};

exports.forgotPasswordLinkMail = (link, targetEmail) => {
    // console.log("inside the forgotPasswordLink send mail ");
    let htmlString = nodeMailer.renderTemplate({ forgotPasswordLink: link },
        "/otp/forgotPasswordSetLink.ejs"
    );
    // console.log("htmlString is ", htmlString);
    nodeMailer.transporter.sendMail({
            from: from,
            to: targetEmail,
            subject: "Set New Password  Link",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for forgot password link : ", err);
                return;
            }
            console.log("mail send for forgot password link successfully");
            return;
        }
    );
};

exports.signUpLink = (link, targetEmail) => {
    // console.log("inside the signUpLink send mail ");
    let htmlString = nodeMailer.renderTemplate({ signUpLink: link },
        "/otp/signUpLink.ejs"
    );
    // console.log("htmlString is ", htmlString);
    nodeMailer.transporter.sendMail({
            from: from,
            to: targetEmail,
            subject: "Sign-Up Link",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for signup link : ", err);
                return;
            }
            console.log("mail send for signUp link successfully");
            return;
        }
    );
};