const queue = require("../config/kue");

const communicationMailer = require("../mailers/communication_mailer");

queue.process("communication", function(job, done) {
    console.log("communication worker is processing a job");
    console.log("job dats is ", job.data);
    // commentsMailer.newComment(job.data);
    communicationMailer.sendCommuncationMail(job.data);
    done();
});