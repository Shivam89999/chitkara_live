// console.log("running @@@@@@@");

async function makeAllHeadLessVisible(id) {
    let spans = document.querySelectorAll(".active");

    for (let sp of spans) {
        sp.className = sp.className.replace(" active", "");
    }
    let target = document.getElementById(id);
    target.className += " active";
}

async function changeTab(id) {
    await makeAllHeadLessVisible(id);
}

function toggleContact() {
    console.log("toggle contact running");
    let contact = document.getElementById("contact-container");
    let currentMaxHeight = getComputedStyle(contact).maxHeight;
    console.log("current ", currentMaxHeight);
    contact.style.maxHeight = currentMaxHeight != "0px" ? "0px" : "800px";
    console.log("new ", contact.style.maxHeight);
    // let currentDisplay = contact.style.display;
    let arrowUp = document.getElementById("arrow-up");

    contact.style.boxShadow =
        contact.style.maxHeight == "0px" ?
        "none" :
        "0px 1px 2px 1px rgba(0, 0, 0, 0.2)";
    console.log(
        "max-height ",
        contact.style.maxHeight,
        " box-shadow ",
        contact.style.boxShadow
    );
    // let arrowDown = document.getElementById("arrow-down");
    // console.log("current display ", currentDisplay);
    // contact.style.height = "auto";
    // // contact.style.display = !currentDisplay || currentDisplay == "none" ? "block" : "none";
    // arrowDown.style.display =
    //     contact.style.maxHeight != "0px" ? "inline" : "none";
    arrowUp.style.transform =
        contact.style.maxHeight != "0px" ?
        "rotate3d(1,0,0,180deg)" :
        "rotate3d(1,0,0,0deg)";
    // console.log("down display ", arrowDown.style.display);
    // console.log("up display ", arrowUp.style.display);
    // console.log("after display ", contact.style.display);
}