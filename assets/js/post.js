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
    console.log("post_id ", post_id);
    let comment = document.getElementById("comment-" + post_id);
    let styyle = getComputedStyle(comment).display;
    let newStyle = styyle === "none" ? "block" : "none";
    console.log("newStyle ", newStyle, "  prev Style ", styyle);
    comment.style.display = newStyle;
}

function toggleEventDetails(event_detail_id) {
    let target = document.getElementById(event_detail_id);

    let current_style = getComputedStyle(target).display;
    console.log(" target is ", target, "  current style ", current_style);
    target.style.display =
        current_style == "none" || !current_style ? "flex" : "none";
    return;
}