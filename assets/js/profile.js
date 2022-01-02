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
    let contact = document.getElementById("contact");
    let currentDisplay = contact.style.display;
    let arrowUp = document.getElementById("arrow-up");
    let arrowDown = document.getElementById("arrow-down");
    console.log("current display ", currentDisplay);
    contact.style.display = !currentDisplay || currentDisplay == "none" ? "block" : "none";
    arrowDown.style.display = contact.style.display == "block" ? "inline" : "none";
    arrowUp.style.display = contact.style.display == "block" ? "none" : "inline";
    console.log("down display ", arrowDown.style.display);
    console.log("up display ", arrowUp.style.display);
    console.log("after display ", contact.style.display);
}