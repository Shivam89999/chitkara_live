const nodeMailer = require("../config/nodemailer");
const from = "AAA Tech <aaa.techy.in@gmail.com";
exports.meMember = (obj) => {
    console.log("inside the me member send mail ");
    let htmlString = nodeMailer.renderTemplate({ data: obj.by, targetName: obj.targetName },
        "/member/me_member.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "You Are Added As Member",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for me member added: ", err);
                return;
            }
            console.log("mail send for me member added successfully");
            return;
        }
    );
};

exports.meMemberDelete = (obj) => {
    console.log("inside the me member delete send mail ");
    let htmlString = nodeMailer.renderTemplate({ data: obj.by, targetName: obj.targetName },
        "/member/me_member_delete.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "You Are Deleted From Member",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for me member deleted: ", err);
                return;
            }
            console.log("mail send for me member deleted successfully");
            return;
        }
    );
};

exports.meMemberUpdate = (obj) => {
    console.log("inside the me member update send mail ");
    let htmlString = nodeMailer.renderTemplate({ data: obj.by, targetName: obj.targetName },
        "/member/me_member_update.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "You Are Updated In Team Member",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for me member updated: ", err);
                return;
            }
            console.log("mail send for me member updated successfully");
            return;
        }
    );
};

exports.newMember = (obj) => {
    console.log("inside the new member send mail ");
    let htmlString = nodeMailer.renderTemplate({ data: obj.by, targetName: obj.targetName },
        "/member/member.ejs"
    );
    nodeMailer.transporter.sendMail({
            from: from,
            to: obj.targetEmail,
            subject: "new Member Added",
            html: htmlString,
        },
        function(err, info) {
            if (err) {
                console.log("err in sending mail for new member added: ", err);
                return;
            }
            console.log("mail send for new member added successfully");
            return;
        }
    );
};