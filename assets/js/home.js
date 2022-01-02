console.log("Home script running");

function toggleEventsVisibality(id_name) {
    let obj = document.querySelector("#" + id_name);

    let currentStyle = obj.style.display;
    let newStyle = currentStyle === "none" ? "block" : "none";
    console.log("newStyle ", newStyle, "  prev Style ", currentStyle);
    obj.style.display = newStyle;
    let arrowUp = document.getElementById("arrow-up");
    let arrowDown = document.getElementById("arrow-down");
    arrowDown.style.display = newStyle == "block" ? "inline" : "none";
    arrowUp.style.display = newStyle == "block" ? "none" : "inline";
}

function findDate(dateString) {
    var options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    // return dateString.toLocaleDateString("en-US", options); // 9/17/2016
    console.log(dateString.toLocaleDateString("en-US", options));
    return "";
}

function setDate() {
    var allEle = document.querySelectorAll(".event-time");
    for (let ele of allEle) {
        let dateString = ele.getAttribute("timing");
        //  findDate(dateString);
        ele.innerText = dateString.substring(0, dateString.length - 30);
    }
}

function handleEventHeadText() {
    var eles = document.querySelectorAll(".event-head");
    for (let ele of eles) {
        let current = new Date();
        let startTime = ele.getAttribute("startTime");
        startTime = new Date(startTime);
        //converting time in miliseconds and comparing
        console.log("current ", current.getTime(), "  event ", startTime.getTime());
        if (startTime.getTime() <= current.getTime()) {
            ele.innerText = "Running Event";
            ele.style.color = "royalblue";
        }
    }
}
var noOfVisibleAlerts = document.querySelectorAll(".alert").length;

function disappearAlert(id) {
    console.log("id is ", id);
    document.getElementById(id).style.display = "none";
    --noOfVisibleAlerts;

    if (noOfVisibleAlerts === 0) {
        document.getElementById("alerts").style.display = "none";
    }
}

function setPostCreatedTime() {
    var eles = document.querySelectorAll(".created-time");
    for (let ele of eles) {
        let dateString = ele.getAttribute("createdTime");
        ele.innerText = dateString.substring(0, dateString.length - 30);
    }
}

handleEventHeadText();
setDate();
setPostCreatedTime();