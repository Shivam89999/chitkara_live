console.log("post script running");

document.querySelectorAll(".button").forEach((item) => {
    item.addEventListener("click", function(e) {
        let id = this.getAttribute("id");
        console.log("id is ", id);
        var eles = document.querySelectorAll("." + id);
        let indexOfDisplay = 0;
        eles.forEach((img) => {
            //  console.log("img is ", img);
            let display = getComputedStyle(img).display;
            // console.log("display is ", display);
            if (display != "none") {
                let current = parseInt(img.getAttribute("current_no"));
                let max = parseInt(img.getAttribute("max_no"));
                let buttonType = item.getAttribute("type");
                let buttonEffect = buttonType === "back" ? -1 : +1;
                let toNext = current + buttonEffect;
                console.log(
                    "buttonType= ",
                    buttonType,
                    " current= ",
                    current,
                    " max= ",
                    max,
                    "  toNext ",
                    toNext,
                    " buttonEffect= ",
                    buttonEffect
                );
                indexOfDisplay = toNext >= max ? 0 : toNext < 0 ? max - 1 : toNext;
                img.style.display = "none";
                return;
            }
        });
        console.log("indexOfDisplay  is ", indexOfDisplay);
        eles.forEach((img) => {
            let current = parseInt(img.getAttribute("current_no"));
            if (current === indexOfDisplay) {
                img.style.display = "block";

                let countDisplay = document.getElementById("displayCount-" + id);
                countDisplay.innerText =
                    current + 1 + "/" + parseInt(img.getAttribute("max_no"));
                return;
            }
        });
        // let count = parseInt(ele.getAttribute("count"));
        // ele.setAttribute("src", "<%=post.photos[" + (count - 1) + "]%>");
        // ele.setAttribute("count", count - 1);
    });
});

//make only first image display block
document.querySelectorAll(".post").forEach((item) => {
    let current_no = item.getAttribute("current_no");
    if (current_no === "0") {
        item.style.display = "block";
    }
});

function toggleComment(post_id) {
    // console.log("post_id ", post_id);
    let comment = document.getElementById("comment-" + post_id);
    let styyle = getComputedStyle(comment).display;
    let newStyle = styyle === "none" ? "block" : "none";
    // console.log("newStyle ", newStyle, "  prev Style ", styyle);
    comment.style.display = newStyle;
}

function toggleEventDetails(event_detail_id) {
    let target = document.getElementById(event_detail_id);

    let current_style = getComputedStyle(target).display;
    // console.log(" target is ", target, "  current style ", current_style);
    target.style.display =
        current_style == "none" || !current_style ? "flex" : "none";
    return;
}

document.addEventListener("mouseup", function(e) {
    // console.log("yes detected *************");
    let classs = "toUpdate";
    // let not = document.getElementsByClassName("tem-member-edit-option");
    let no = document.getElementsByClassName(classs);
    if (!no[0].contains(e.target)) {
        // console.log("yes mfvnjvjfv ****** ");
        document.querySelectorAll("." + classs).forEach((item) => {
            item.remove();
        });
    }
});

function handleEvents() {
    document.querySelectorAll(".type-detail").forEach((item) => {
        // console.log("postDetails are ", postDetails);
        let postId = item.getAttribute("postId");
        let startTime = parseInt(new Date(item.getAttribute("start")).valueOf());
        let location = item.getAttribute("location");
        if (location == "") location = "not updated ";
        let endTime = parseInt(new Date(item.getAttribute("end")).valueOf());
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
        let typeSpanParent = item.firstElementChild;
        typeSpanParent.innerHTML =
            "<span style='text-transform:capitalize;' class='" +
            type +
            "'>" +
            type +
            " Event</span>";
        console.log("postId is ", postId);
        let node =
            "<div class='event-details' id='" +
            postId +
            "-event'><div class = 'detail-container' > <div class = 'icon-container' > <img height = '20px'width = '20px'src = 'https://cdn-icons.flaticon.com/png/512/3239/premium/3239945.png?token=exp=1641371763~hmac=a8c493b4ac98b3a20602304774f5e433' alt = '' > </div> <div class = 'detail-values' > <span class = 'detail-head' > Start Date & Time </span> <span class = 'detail-value' > " +
            startDateString +
            " </span> </div> </div> <div class = 'detail-container' > <div class = 'icon-container' > <img height = '20px'width = '20px' src = 'https://cdn-icons.flaticon.com/png/512/3239/premium/3239945.png?token=exp=1641371763~hmac=a8c493b4ac98b3a20602304774f5e433' alt = '' > </div> <div class = 'detail-values' > <span class = 'detail-head' > End Date & Time </span> <span class = 'detail-value' > " +
            endDateString +
            " </span> </div> </div> <div class = 'detail-container' > <div class = 'icon-container' > <img height = '20px'width = '20px'src = 'https://cdn-icons.flaticon.com/png/512/2838/premium/2838912.png?token=exp=1641372039~hmac=4393bd139984d88263fb11cf012d489b' alt = 'location' > </div> <div class = 'detail-values' ><a href='/post-for-location?post=" +
            postId +
            "' style='text-decoration-color:hotpink;'> <span class = 'detail-head' > Location </span></a> <span class = 'detail-value' > " +
            location +
            " </span> </div> </div></div> ";
        // let ele = document.createElement("div");
        // ele.className = "event-details";
        // ele.id = "some-event";
        // let elem = "<li>i m here</li>";

        item.insertAdjacentHTML("afterend", node);
        // let l = "<div class='some' let= 'let' id= 'id'>  </div>";
        // e.innerHTML = l;
        // // let node = document.createAttribute(l.trim());
        // console.log("node is ", e);
        // item.appendChild(e);
    });
}
handleEvents();

// document.getElementById("post-3").scrollIntoView();

function setDate() {
    var allEle = document.querySelectorAll(".event-time");
    for (let ele of allEle) {
        let dateString = ele.getAttribute("timing");
        //  findDate(dateString);
        ele.innerText =
            new Date(dateString).toDateString() +
            " | " +
            new Date(dateString).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
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

function setPostCreatedTime() {
    var eles = document.querySelectorAll(".created-time");
    for (let ele of eles) {
        let dateString = ele.getAttribute("createdTime");
        console.log("dateString is ", dateString);
        ele.innerText =
            new Date(dateString).toDateString() +
            " | " +
            new Date(dateString).toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
    }
}

handleEventHeadText();
setDate();
setPostCreatedTime();