function changeHeaderTab(id) {
    var eles = document.querySelectorAll(".current-active");
    for (let ele of eles) {
        ele.className = ele.className.replace("current-active", "");
    }
    var target = document.getElementById(id);
    target.className += "current-active";
}