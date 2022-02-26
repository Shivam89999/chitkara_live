const nodeMailer = require("../config/nodemailer");
const from = "Aaa Tech <aaa.techy.in@gmail.com";
exports.newTeamMember = () => {};
exports.newCreatorAccountRequests = (obj) => {
    console.log("inside the new creator account rewuest send mail ", obj);
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/new_account_request.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "Your New Creator Account Request",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending creator account request mail: ", err);
                return;
            }
            console.log("mail send for creator account request successfully");
            return;
        }
    );
};

exports.newCreatorAccountRequestsToOrganiser = (obj) => {
    console.log(
        "inside the new creator account request to organiser send mail ",
        obj
    );
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/new_account_request_to_organiser.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "New Creator Account Request Get",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log(
                    "err in sending creator account request to organiser mail: ",
                    err
                );
                return;
            }
            console.log(
                "mail send for creator account request to organiser successfully"
            );
            return;
        }
    );
};

exports.newRequests = (obj) => {
    console.log("inside the new rewuest send mail ", obj);
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/recieve_new_request.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "Recieve a new Request",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending request: ", err);
                return;
            }
            console.log("mail send for request successfully");
            return;
        }
    );
};

exports.creatorRequestReject = (obj) => {
    console.log("inside the reject creator request mail ");
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/reject_new_creator_request.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "Your Creator Account Request Rejected ",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending creator account reject mail: ", err);
                return;
            }
            console.log("mail send for reject crator account request successfully");
            return;
        }
    );
};

exports.creatorRequestAccept = (obj) => {
    console.log("inside the accept creator request mail ");
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/accept_new_creator_request.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "Your Creator Account Request Accepted ",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending creator account accept mail: ", err);
                return;
            }
            console.log("mail send for  crator account accept successfully");
            return;
        }
    );
};

exports.creatorAccountActivateLink = (obj) => {
    console.log("inside the accept creator request mail ");
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/creator_account_activate_link.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "Link To Activate Creator Account",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending creator account activate link mail: ", err);
                return;
            }
            console.log(
                "mail send for  crator account activate link mail successfully"
            );
            return;
        }
    );
};

exports.creatorAccountActivatedSuccessfully = (obj) => {
    console.log("inside the  creator account activated successfully mail ");
    let htmlString = nodeMailer.renderTemplate({ obj },
        "/request/creator_account_activated_successfully.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "Creator Account Activated Successfully",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log(
                    "err in sending  creator account activated successfully mail : ",
                    err
                );
                return;
            }
            console.log("creator account activated successfully mail send ");
            return;
        }
    );
};