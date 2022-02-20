const queue = require("../config/kue");
const requestMailer = require("../mailers/request_mailer");

queue.process("requests", function(job, done) {
    console.log("request worker is processing a job");
    // postMailer.newPost(job.data);
    requestMailer.newRequests(job.data);
    done();
});

queue.process("creatorAccountRequests", function(job, done) {
    console.log("creator account request worker is processing a job");
    // postMailer.newPost(job.data);
    if (job.data.isOrganiser) {
        requestMailer.newCreatorAccountRequestsToOrganiser(job.data);
    } else requestMailer.newCreatorAccountRequests(job.data);
    done();
});