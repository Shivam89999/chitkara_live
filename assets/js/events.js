console.log("event script running");

function changeTab(id) {
    var eles = document.querySelectorAll(".active-tab");
    for (let ele of eles) {
        ele.className = ele.className.replace(" active-tab", "");
    }
    var target = document.getElementById(id + "-tab");
    target.className += " active-tab";

    //make all content in-visible
    document.getElementById("upcoming").style.display = "none";
    document.getElementById("passed").style.display = "none";
    //make target type content visible
    document.getElementById(id).style.display = "block";
    handleLoadingEventVisiblity($(".load-event", $("#" + id)));
}