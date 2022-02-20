const queue = require("../config/kue");

const memberMailer = require("../mailers/member_mailer");

queue.process("members", function(job, done) {
    console.log("member worker is processing a job");
    console.log("job dats is ", job.data);
    //console.log("job data is ", job.data);
    if (job.data.youAreAdded) {
        memberMailer.meMember(job.data);
    } else if (job.data.youAreDeleted) {
        memberMailer.meMemberDelete(job.data);
    } else if (job.data.youAreUpdated) {
        memberMailer.meMemberUpdate(job.data);
    } else {
        memberMailer.newMember(job.data);
    }
    done();
});