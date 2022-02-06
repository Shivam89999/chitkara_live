const queue = require("../config/kue");

const commentsMailer = require("../mailers/comment_mailers");

queue.process("email", function(job, done) {
    console.log("emails worker is processing a job");
    console.log("job dats is ", job.data);
    commentsMailer.newComment(job.data);
    done();
});