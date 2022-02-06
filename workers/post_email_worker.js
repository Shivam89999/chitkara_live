const queue = require("../config/kue");
const postMailer = require("../mailers/post_mailer");

queue.process("posts", function(job, done) {
    console.log("emails worker is processing a job");
    postMailer.newPost(job.data);
    done();
});