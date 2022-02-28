//console.log("login script running ");

function handleInputChange(e) {
    // //console.log("e is ", e);
    // let target = e.target;
    // //console.log("vfnj");
    // //console.log("target is ", target);
    // let value = e.target.value;
    // //console.log("before target.style ", target.style.left);
    document.querySelectorAll(".eye-manik").forEach((target) => {
        let length = e.target.value.length;
        //console.log("target is ", getComputedStyle(target).left);
        target.style.left = Math.min(15, length) + "px";
        target.style.top = "5px";
    });

    // //console.log(" after target.style ", target.style.left);
}

function slideup(e) {
    ////console.log("slideup running ", e.target);
    let ele = document.getElementById("slide-container");
    ele.style.top = "122px";
}

function slidedown(e) {
    ////console.log("slide down running ", e.target);
    setTimeout(function() {
        let ele = document.getElementById("slide-container");
        ele.style.top = "175px";
    }, 500);
}

function handleTabChange(type, event) {
    document.querySelectorAll(".actual-option").forEach((itm) => {
        itm.className = "actual-option";
    });
    document.querySelectorAll(".option-head").forEach((itm) => {
        itm.style.color = "#748194";
    });
    let target = event.target.parentNode;
    // //console.log("target is ", target);
    // //console.log("parent ", target.parentNode);
    target.style.color = "#EE9BA3";
    target.parentNode.className += " " + type + "-div-active";
    if (type == "left") {
        showSignInPage();
    } else {
        showSignUpGetOtpPage();
    }
}