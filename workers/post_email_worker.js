const queue = require("../config/kue");
const postMailer = require("../mailers/post_mailer");

queue.process("posts", function(job, done) {
    console.log("emails worker is processing a job");
    postMailer.newPost(job.data);
    done();
});

queue.process("polls", function(job, done) {
    console.log("polls worker is processing a job");
    postMailer.newPoll(job.data);
    done();
});

queue.process("alerts", function(job, done) {
    console.log("alerts worker is processing a job");
    postMailer.newAlert(job.data);
    done();
});

queue.process("notices", function(job, done) {
    console.log("notices worker is processing a job");
    postMailer.newNotice(job.data);
    done();
});

queue.process("events", function(job, done) {
    console.log("events worker is processing a job");
    postMailer.newEvent(job.data);
    done();
});