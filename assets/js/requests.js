console.log("nvfjbv &&&&&&&&&&");

function toggleHead(headerId) {
    let ele = document.querySelector("#" + headerId);
    console.log("ele is ", ele);
    let allHeaderEle = document.querySelectorAll("." + ele.getAttribute("class"));
    console.log("all ", allHeaderEle);
    for (let e of allHeaderEle) {
        // e.setAttribute("backgroundColor", );
        console.log("e is ", e, " end");
        e.style.backgroundColor = "#77d6cd";
    }
    ele.style.backgroundColor = "blue";
    let displayChildEleClass = document.querySelectorAll(
        "." + ele.getAttribute("type")
    );
    let allChildEle = document.querySelectorAll(".all");
    for (let e of allChildEle) {
        e.style.display = "none";
    }
    for (let e of displayChildEleClass) {
        e.style.display = "flex";
    }
}

toggleHead("send-header");

toggleHead("send-header");