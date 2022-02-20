const queue = require("../config/kue");

const messMailer = require("../mailers/mess_mailer");

queue.process("mess", function(job, done) {
    console.log("mess worker is processing a job");
    console.log("job dats is ", job.data);
    //commentsMailer.newComment(job.data);
    messMailer.menuChanged(job.data);
    done();
});