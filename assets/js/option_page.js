function displayAccordingActiveTab() {
    let act = $(".active-search-tab");
    // //console.log("act is ", act[0]);
    let classType = $(act).prop("class").split(" ")[0];
    // //console.log("class type is ", classType);
    let totalCount = 0;
    //console.log("classType is ^^^^^^^^^^^^^^^^ ", classType);
    $(".search-result").each((i, itm) => {
        if (classType == "All") {
            // itm.style.display = "flex";
            $(itm).css("display", "flex");
            totalCount += 1;
        } else {
            let ty = $(itm).prop("type");
            //console.log("ty is ", ty, " and classType is ", classType);
            if (ty == classType) {
                $(itm).css("display", "flex");
                totalCount += 1;
            } else {
                $(itm).css("display", "none");
            }
        }
    });
    //console.log("total count is ", totalCount);
    if (totalCount == 0) {
        if (classType == "All") $("#empty-div").text("No User Found");
        else $("#empty-div").text("No " + classType + " Found");
        $("#empty-div").show();
    } else {
        $("#empty-div").hide();
    }
}

function showOption(type, event) {
    //change active tab
    let target = event.target;
    //console.log("target is ", target, " type is ", type);
    //change current active to in-active
    document.querySelectorAll(".active-search-tab").forEach((ele) => {
        ele.className = ele.className.replace(" active-search-tab", "");
    });
    target.className += " active-search-tab";
    //displaty content acc. to active tab
    displayAccordingActiveTab();
}
displayAccordingActiveTab();