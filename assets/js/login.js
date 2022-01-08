console.log("login script running ");
document.getElementById("container").addEventListener("mousemove", function() {
    console.log("yes ");
});

function handleInputChange(e) {
    // console.log("e is ", e);
    // let target = e.target;
    // console.log("vfnj");
    // console.log("target is ", target);
    // let value = e.target.value;
    // console.log("before target.style ", target.style.left);
    document.querySelectorAll(".eye-manik").forEach((target) => {
        let length = e.target.value.length;
        console.log("target is ", getComputedStyle(target).left);
        target.style.left = Math.min(15, length) + "px";
        target.style.top = "5px";
    });

    // console.log(" after target.style ", target.style.left);
}

function slideup(e) {
    let ele = document.getElementById("slide-container");
    ele.style.top = "122px";
}

function slidedown(e) {
    console.log("out running ");
    let ele = document.getElementById("slide-container");
    ele.style.top = "175px";
}