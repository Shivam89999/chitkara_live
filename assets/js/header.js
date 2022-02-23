let cookies = {};

async function getCookieValueByName() {
    document.cookie.split(";").forEach(async(nameValuePair) => {
        let [name, val] = nameValuePair.split("=");
        cookies[name.trim()] = val.trim();
    });
}
getCookieValueByName();
let darkModeStatus = cookies["darkModeStatus"] == "true" ? true : false;
//handle the dark mode status
let completeToggleContainer = $("#complete-toggle-container");
console.log("some ^^^^^^^^^^^^^^^^^6666 ", completeToggleContainer);
if (darkModeStatus == true) {
    $(completeToggleContainer).append(
        $(`
    <div>
                            <div class="toggle-container toggle-container-active" type="active">
                                <div class="toggle-btn toggle-btn-active"></div>
                            </div>
                        </div>
    `)
    );

    $("body").addClass("darkMode");
    let expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 1000 * 60 * 60 * 24 * 365);
    document.cookie =
        "darkModeStatus = true; expires=" + expireDate.toUTCString();
} else {
    $(completeToggleContainer).append(
        $(`
    <div>
                            <div class="toggle-container" type="not-active">
                                <div class="toggle-btn"></div>
                            </div>
                        </div>
    `)
    );
    $("body").removeClass("darkMode");
    let expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + 1000 * 60 * 60 * 24 * 365);
    document.cookie =
        "darkModeStatus = false; expires=" + expireDate.toUTCString();
}

function changeHeaderTab(id) {
    // var eles = document.querySelectorAll(".current-active");
    // for (let ele of eles) {
    //     ele.className = ele.className.replace("current-active", "");
    // }
    // var target = document.getElementById(id);
    // target.className += "current-active";
}