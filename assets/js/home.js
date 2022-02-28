//console.log("Home script running");

// function toggleEventsVisibality(id_name) {
//     let obj = document.querySelector("#" + id_name);
//     let currentMaxHeight = getComputedStyle(obj).maxHeight;
//     // //console.log("off-set-height is ", obj.offsetHeight);
//     obj.style.maxHeight = currentMaxHeight != "0px" ? "0px" : "600px";

//     // let newStyle = currentStyle === "none" ? "block" : "none";
//     // //console.log("newStyle ", newStyle, "  prev Style ", currentStyle);
//     // obj.style.display = newStyle;
//     let arrowUp = document.getElementById("arrow-up");
//     // let arrowDown = document.getElementById("arrow-down");
//     // arrowDown.style.display = obj.style.maxHeight != "0px" ? "inline" : "none";
//     arrowUp.style.transform =
//         obj.style.maxHeight == "0px" ?
//         "rotate3d(1,0,0,0deg)" :
//         "rotate3d(1,0,0,180deg)";
// }

// function findDate(dateString) {
//     var options = {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//     };

//     // return dateString.toLocaleDateString("en-US", options); // 9/17/2016
//     //console.log(dateString.toLocaleDateString("en-US", options));
//     return "";
// }

// function setDate() {
//     var allEle = document.querySelectorAll(".event-time");
//     for (let ele of allEle) {
//         let dateString = ele.getAttribute("timing");
//         //  findDate(dateString);
//         ele.innerText =
//             new Date(dateString).toDateString() +
//             " | " +
//             new Date(dateString).toLocaleString("en-US", {
//                 hour: "numeric",
//                 minute: "numeric",
//                 hour12: true,
//             });
//     }
// }

// function handleEventHeadText() {
//     var eles = document.querySelectorAll(".event-head");
//     for (let ele of eles) {
//         let current = new Date();
//         let startTime = ele.getAttribute("startTime");
//         startTime = new Date(startTime);
//         //converting time in miliseconds and comparing
//         //console.log("current ", current.getTime(), "  event ", startTime.getTime());
//         if (startTime.getTime() <= current.getTime()) {
//             ele.innerText = "Running Event";
//             ele.style.color = "royalblue";
//         }
//     }
// }

// function setPostCreatedTime() {
//     var eles = document.querySelectorAll(".created-time");
//     for (let ele of eles) {
//         let dateString = ele.getAttribute("createdTime");
//         //console.log("dateString is ", dateString);
//         ele.innerText =
//             new Date(dateString).toDateString() +
//             " | " +
//             new Date(dateString).toLocaleString("en-US", {
//                 hour: "numeric",
//                 minute: "numeric",
//                 hour12: true,
//             });
//     }
// }

// function calculate() {
//     //console.log("yes is &&&&&&&&&& ", document.querySelectorAll(".to_calculate"));
//     document.querySelectorAll(".to_calculate").forEach((item) => {
//         //console.log("item ", item);
//         let yes = parseInt(item.getAttribute("yes_votes_length"));
//         let no = parseInt(item.getAttribute("no_votes_length"));
//         let type = parseInt(item.getAttribute("type"));
//         yes += 1;
//         no += 1;
//         //console.log("yes is ", yes, " no is ", no);
//         let ratio = ((type == "yes" ? yes : no) * 100) / (yes + no);
//         item.innerText = ratio + " % ";
//     });
// }
// calculate();
// handleEventHeadText();
// setDate();
// setPostCreatedTime();

function handleAlertDisplay() {
    //console.log("running ^^^^^^^^^^^ &&&&&&& ");
    $(".alert").each((i, alert) => {
        let id = $(alert).attr("id");
        //console.log("id is ", id);
        if (cookies[id]) {
            //console.log("not display ^^^^^^^^^^^ ");
            $(alert).remove();
        }
    });

    if ($("#alerts").children().length == 0) {
        $("#alerts").remove();
    }
}
handleAlertDisplay();

var noOfVisibleAlerts = document.querySelectorAll(".alert").length;

function disappearAlert(id) {
    //console.log("id is ", id);
    document.getElementById(id).style.display = "none";
    --noOfVisibleAlerts;
    let expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 1000 * 60 * 60 * 24);
    document.cookie =
        id + "=" + id + "; expires=" + expireDate.toUTCString() + ";";
    ("alert-<%=alert.id%>");
    if (noOfVisibleAlerts === 0) {
        document.getElementById("alerts").style.display = "none";
    }
}