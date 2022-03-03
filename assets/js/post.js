console.log("post script running @@@@@@@@@@@@@@@@@@@@@@@ ");
//handleChangeNextPrev
function addListenerToallNextPrevBtn(items) {
    ////console.log("items are ", items.length);
    for (let itm of items) {
        handleChangeNextPrev(itm);
    }
}

function handleChangeNextPrev(item) {
    $(item).click((e) => {
        let id = $(item).attr("id");
        // var eles = document.querySelectorAll("." + id);
        var eles = $("." + id);
        let indexOfDisplay = 0;
        $(eles).each((i, img) => {
            //console.log("img is ", img);
            //  //console.log("img is ", img);
            // let display = getComputedStyle(img).display;
            let display = $(img).css("display");
            // //console.log("display is ", display);
            if (display != "none") {
                let current = parseInt($(img).attr("current_no"));
                let max = parseInt($(img).attr("max_no"));
                let buttonType = $(item).attr("type");
                let buttonEffect = buttonType == "back" ? -1 : +1;
                let toNext = current + buttonEffect;
                //     //console.log(
                //     "buttonType= ",
                //     buttonType,
                //     " current= ",
                //     current,
                //     " max= ",
                //     max,
                //     "  toNext ",
                //     toNext,
                //     " buttonEffect= ",
                //     buttonEffect
                // );
                indexOfDisplay = toNext >= max ? 0 : toNext < 0 ? max - 1 : toNext;
                // img.style.display = "none";

                //  $(img).css('display','none');
                $(img).css("display", "none");
                return;
            }
        });
        //console.log("indexOfDisplay  is ", indexOfDisplay);
        $(eles).each((i, img) => {
            let current = parseInt($(img).attr("current_no"));
            if (current == indexOfDisplay) {
                // img.style.display = "block";
                $(img).css("display", "block");
                let countDisplay = $("#displayCount-" + id);
                //countDisplay.innerText =
                //  current + 1 + "/" + parseInt(img.getAttribute("max_no"));
                $(countDisplay).text(
                    current + 1 + "/" + parseInt(img.getAttribute("max_no"))
                );
                return;
            }
        });
        // let count = parseInt(ele.getAttribute("count"));
        // ele.setAttribute("src", "<%=post.photos[" + (count - 1) + "]%>");
        // ele.setAttribute("count", count - 1);
    });
}

function addListenerToChange() {
    //   //console.log("running %%%%%%%%%%%%%%%%%%%%%%%  ");
    $(".button").each((i, itm) => {
        // let id = $(itm).attr("id");
        // let ele = $("#");
        handleChangeNextPrev(itm);
    });
    // document.querySelectorAll(".button").forEach((item) => {
    //     item.addEventListener("click", function(e) {
    //         let id = this.getAttribute("id");
    //         //console.log("id is ", id);
    //     });
    // });
}
addListenerToChange();
//make only first image display block
async function intialImageDisplay() {
    // document.querySelectorAll(".post").forEach((item) => {
    //     let current_no = item.getAttribute("current_no");
    //     if (current_no === "0") {
    //         item.style.display = "block";
    //     }
    // });
    $(".post").each((i, item) => {
        let current_no = $(item).attr("current_no");
        if (current_no === "0") {
            $(item).css("display", "block");
        }
    });
}
intialImageDisplay();

function animateEventDetail(target, height) {
    $(target).animate({
            height: height,
        },
        1000
    );
}

function eventDetailToggle(itm) {
    $(itm).hover(
        function(e) {
            let target = $("#" + $(itm).attr("targetId"));
            $(target).stop(true, false);
            animateEventDetail(target, "270px");
        },
        function(e) {
            // let target = $("#" + $(itm).attr("targetId"));
            // $(target).stop(true, false);
            // animateEventDetail(target, "0px");
            return;
        }
    );
}

function animateBack(targetId) {
    //console.log("fvnjhbvffv is ", targetId);
    animateEventDetail($(targetId), "0px");
}

function addListenerToEventDetailToggle() {
    $(".type-detail").each((i, itm) => {
        eventDetailToggle(itm);
    });
}
addListenerToEventDetailToggle();

function toggleEventDetails(event_detail_id) {
    //console.log("event detail is ", event_detail_id);
    // let target = document.getElementById(event_detail_id);
    let target = $("#" + event_detail_id);
    ////console.log("target is ", target);
    // let current_style = getComputedStyle(target).display;
    // let current_style = $(target).css("display");
    let current_height = $(target).css("height");
    // //console.log(" target is ", target, "  current style ", current_style);
    // target.style.display =
    //     current_style == "none" || !current_style ? "flex" : "none";
    let new_height = current_height != "0px" ? "0px" : "270px";
    //console.log("current is ", current_height, "  new is ", new_height);
    // $(target).css({
    //     display: "" + newStyle,
    // });
    animateEventDetail($(target), new_height);
    return;
}

// document.addEventListener("mouseup", function(e) {
//     // //console.log("yes detected *************");
//     let classs = "toUpdate";
//     // let not = document.getElementsByClassName("tem-member-edit-option");
//     // let no = document.getElementsByClassName(classs);
//     let no = $("." + classs)[0];
//     // if (!no[0].contains(e.target)) {
//     //     // //console.log("yes mfvnjvjfv ****** ");
//     //     document.querySelectorAll("." + classs).forEach((item) => {
//     //         item.remove();
//     //     });
//     // }
//     if (!$(no).is(e.target)) {
//         // //console.log("yes mfvnjvjfv ****** ");
//         // document.querySelectorAll("." + classs).forEach((item) => {
//         //     item.remove();
//         // });
//         $("." + classs).remove();
//     }
// });
function handleAllEvents() {
    $(".type-detail").each((i, item) => {
        handleEvents(item);
    });
}

function handleEvents(item) {
    // //console.log("postDetails are ", postDetails);
    let postId = $(item).attr("postId");
    let startTime = parseInt(new Date($(item).attr("start")).valueOf());
    let location = $(item).attr("location");
    if (location == "") location = "not updated ";
    let endTime = parseInt(new Date($(item).attr("end")).valueOf());
    let currentTime = parseInt(new Date().valueOf());
    let type = "running";
    let startDateString =
        new Date(startTime).toDateString() +
        " | " +
        new Date(startTime).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    let endDateString =
        new Date(endTime).toDateString() +
        " | " +
        new Date(endTime).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

    if (endTime < currentTime) type = "passed";

    if (startTime > currentTime) type = "upcoming";
    // let typeSpanParent = item.firstElementChild;
    let typeSpanParent = $(item).children().first();
    // //console.log("vffvbjf $$$$$$$$$$$ ", $(item));
    // typeSpanParent.innerHTML =
    //     "<span style='text-transform:capitalize;' class='" +
    //     type +
    //     "'>" +
    //     type +
    //     " Event</span>";
    // //console.log("postId is ", postId);
    typeSpanParent.html(
        "<span style='text-transform:capitalize;' class='" +
        type +
        "'>" +
        type +
        " Event</span>"
    );
    //console.log("postId is ", postId);
    let ss = "vfnjvf";
    let node =
        "<div class='event-details' id='" +
        postId +
        "-event'><div class = 'detail-container' > <div class = 'icon-container' > <img height = '20px'width = '20px'src = '/uploads/icons/1.event_start_time.png' alt = '' > </div> <div class = 'detail-values' > <span class = 'detail-head' > Start Date & Time </span> <span class = 'detail-value' > " +
        startDateString +
        " </span> </div> </div> <div class = 'detail-container' > <div class = 'icon-container' > <img height = '20px'width = '20px' src = '/uploads/icons/2.event_end_time.png' alt = '' > </div> <div class = 'detail-values' > <span class = 'detail-head' > End Date & Time </span> <span class = 'detail-value' > " +
        endDateString +
        " </span> </div> </div> <div class = 'detail-container' > <div class = 'icon-container' > <img height = '25px'width = '20px' src = '/uploads/icons/40.venu.png' alt = 'location' > </div> <div class = 'detail-values' ><a href='/post-for-location?post=" +
        postId +
        "' style='text-decoration-color:hotpink;'> <span class = 'detail-head' > Location <span style='color:red; font-size:14;text-transform:none'>(Click to see event location & your distance from event in map)</span> </span></a> <span class = 'detail-value' > " +
        location +
        " </span> </div> </div> <div style='dispay:flex; flex-direction:row-reverse;   margin-top:-20px; margin-bottom:0px; padding:0px;'> <button targetId=" +
        postId +
        "-event" +
        " class='event-back-btn' style='cursor:pointer; font-size:22px; font-weight:850; color:white; background-color:royalblue; transform:rotate(90deg); border-color:royalblue; border-radius:4px;'>&lt;</button></div> </div> ";
    // let ele = document.createElement("div");
    // ele.className = "event-detls";
    // ele.id = "some-event";
    // let elem = "<li>i m here</li>";

    // item.insertAdjacentHTML("afterend", node);
    $(node).insertAfter(item);
    // let l = "<div class='some' let= 'let' id= 'id'>  </div>";
    // e.innerHTML = l;
    // // let node = document.createAttribute(l.trim());
    // //console.log("node is ", e);
    // item.appendChild(e);
}
handleAllEvents();

// document.getElementById("post-3").scrollIntoView();
function setEventDate(ele) {
    // let dateString = ele.getAttribute("timing");
    let dateString = $(ele).attr("timing");
    //  findDate(dateString);
    // ele.innerText =
    //     new Date(dateString).toDateString() +
    //     " | " +
    //     new Date(dateString).toLocaleString("en-US", {
    //         hour: "numeric",
    //         minute: "numeric",
    //         hour12: true,
    //     });
    $(ele).text(
        new Date(dateString).toDateString() +
        " | " +
        new Date(dateString).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
    );
}

function setAllEventDate() {
    // var allEle = document.querySelectorAll(".event-time");
    // for (let ele of allEle) {}
    $(".event-time").each((i, ele) => {
        setEventDate(ele);
    });
}

function handleEventHeadText(ele) {
    let current = new Date();
    // let startTime = ele.getAttribute("startTime");
    let startTime = $(ele).attr("startTime");
    startTime = new Date(startTime);
    console.log("i m running $$$$$$ @#######3########");
    //converting time in miliseconds and comparing
    //console.log("current ", current.getTime(), "  event ", startTime.getTime());
    if (startTime.getTime() <= current.getTime()) {
        // ele.innerText = "Running Event";
        // ele.style.color = "royalblue";
        $(ele).text("Running Event");
        $(ele).css({ color: "royalblue" });
    }
}

function handleAllEventHeadText() {
    //var eles = document.querySelectorAll(".event-head");
    $(".event-head").each((i, ele) => {
        handleEventHeadText(ele);
    });
}

function setCreatedTime(ele) {
    // let dateString = ele.getAttribute("createdTime");
    let dateString = $(ele).attr("createdTime");
    //console.log("dateString is ", dateString);
    // ele.innerText =
    //     new Date(dateString).toDateString() +
    //     " | " +
    //     new Date(dateString).toLocaleString("en-US", {
    //         hour: "numeric",
    //         minute: "numeric",
    //         hour12: true,
    //     });
    ele.text(
        new Date(dateString).toDateString() +
        " | " +
        new Date(dateString).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
    );
}

function setPostCreatedTimeForAll() {
    $(".created-time").each((i, ele) => {
        setCreatedTime(ele);
    });
}

function handleBack(btn) {
    $(btn).click((e) => {
        let targetId = $(btn).attr("targetId");
        animateEventDetail($("#" + targetId), "0px");
    });
}

function AddListenerTohandleBack() {
    $(".event-back-btn").each((i, btn) => {
        handleBack($(btn));
    });
}

AddListenerTohandleBack();
handleAllEventHeadText();
setAllEventDate();
setPostCreatedTimeForAll();