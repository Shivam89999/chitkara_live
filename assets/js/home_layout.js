// handle search functionality
function makeCompleteOptionPage(options) {
    let sample = `<div id="option-page">
    <div id="option-header">
        <span class="All active-search-tab" onclick="showOption('All',event)">All</span>
        <span class="Student" onclick="showOption('Student',event)">Student</span>
        <span class="Club" onclick="showOption('Club',event)">Club</span>
        <span class="Depart" onclick="showOption('Depart',event)">Depart</span>
        <span class="Hostel" onclick="showOption('Hostel',event)">Hostel</span>
    </div>

    <div id="empty-div">No user Found</div>
    <!-- <div id="empty-div">vnfbv</div>
    <div id="empty-div">jvfhvjfn</div> -->
    <main id="search-user-result-main">`;
    for (let option of options) {
        sample += `<a href="/user/profile?user_id=${option._id}" type="${option.onModel}" class="link search-result ${option.onModel}-result">
                <div class="option">
                    <div><img src="${option.pic}" alt="Logo" /></div>
                    <div class="right-div" style="word-wrap: break-word">
                        <span>${option.name}</span>
                        <span style="font-size: 11; word-wrap: break-word">${option.onModel}</span
          >
          <span style="font-size: 11; word-wrap: break-word"
            >${option.email}</span
          >

          <span style="font-size: 11; word-wrap: break-word"
            >${option.bio}</span
          >
        </div>
      </div>
    </a>`;
    }

    sample += `</main></div>`;
    return $(sample);
}

function handleSearch() {
    let searchForm = $("#search-form");
    // searchForm.submit((e) => {
    //     e.preventDefault();
    // });
    $("#search-input").on("input", (e) => {
        let value = $(e.target).val();
        // //console.log("value is &&&&&&&&&&&&&&&&&&& ", value);
        if (value.length <= 0) return;
        $.ajax({
            type: "POST",
            url: searchForm.prop("action"),
            data: searchForm.serialize(),
            success: function(data) {
                // window.history.pushState({
                //         html: "fdfdd",
                //     },
                //     "",
                //     searchForm.prop("action")
                // );
                //console.log("data is ", data);
                let page = $("#page-outline");
                //console.log("page is ", page);

                // //console.log("page is ", page);
                // page.html(findOptionPage(data.data.results));
                // intialSetUp();
                let searchOutline = $("#option-page");
                page.html("");
                if (searchOutline.length == 0) {
                    let completeOptionPage = makeCompleteOptionPage(data.data.results);
                    $(page).append(completeOptionPage);
                    displayAccordingActiveTab();
                    return;
                }
                // //console.log("search outline is ", searchOutline.length);
                let searchResultMain = $("#search-user-result-main", searchOutline);
                $(searchResultMain).html(findOptionPage(data.data.results));
                $(page).append(searchOutline);
                displayAccordingActiveTab();

                return;
            },
            error: function(err) {
                //console.log("err is ", err.responseJSON.err);
            },
        });
    });
}

handleSearch();

function findOptionPage(options) {
    let result = "";
    for (let option of options) {
        result += ` <a href="/user/profile?user_id=${option._id}" type='${option.onModel}' class="link search-result ${option.onModel}-result">
            <div class="option">
                <div><img src="${option.pic}" alt="Logo" /></div>
                <div class="right-div" style="word-wrap: break-word">
                    <span>${option.name}</span>
                    <span style="font-size: 11; word-wrap: break-word">${option.onModel}</span
        >
        <span style="font-size: 11; word-wrap: break-word"
          >${option.email}</span
        >

        <span style="font-size: 11; word-wrap: break-word"
          >${option.bio}</span
        >
      </div>
    </div>
  </a>`;
    }

    return $(result);
}

// document.addEventListener("mouseup", function(e) {
//     let classs = "clickDisappear";
//     // let not = document.getElementsByClassName("tem-member-edit-option");
//     // let no = document.getElementsByClassName(classs);
//     // if (!no[0].contains(e.target)) {
//     //     //console.log("yes mfvnjvjfv ****** ");
//     //     document.querySelectorAll("." + classs).forEach((item) => {
//     //         item.remove();
//     //     });
//     // }

//     let no = $("." + classs)[0];
//     if (no && !no.contains(e.target)) {
//         $("." + classs).remove();
//     }
// });

function animationOnInternet(top, time) {
    $("#no-internet").animate({
            top: top,
        },

        time,
        "linear"
    );
}

function checkInternetConnected() {
    if (!navigator.onLine) {
        // window.alert();
        // window.alert("jvbfjhbvfb");
        let view = $("#no-internet");

        if (view.hasClass(".no_display")) {
            view.removeClass(".no_display");
            animationOnInternet(60, 600);
            animationOnInternet(52, 300);
        }
    } else if (!view.hasClass(".no_display")) {
        animationOnInternet(60, 300);
        animationOnInternet(2, 600);
        setTimeout(() => {
            view.addClass(".no_display");
        }, 900);
    }
}

function addNoInternetView() {
    if ($("#no-internet").length <= 0) {
        $("html").append(`<div id="no-internet class="no_display">
            <img src="/uploads/icons/39.wifi-off.png" alt="wi-fi" height="20px" width="25px" />
            <span style="font-size: 20; padding: 5px; padding-right: 0px">Low Internet.</span
      >
      <span style="font-size: 15; padding: 5px; padding-left: 0px"
        >Check data connection and refresh</span
      >
    </div>`);
    }
}
addNoInternetView();
setInterval(function() {
    checkInternetConnected();
}, 100);

function handleDarkMode() {
    let toggle = $(".toggle-container");
    let toggleBtn = $(".toggle-btn");
    // //console.log("toggle ^^^^^^^^6666 ", toggle.length);
    // //console.log("btn is ^^^^&&&&&& ", toggleBtn.length);
    $(toggle).click((e) => {
        //console.log("yes click ", e.target);
        // let type = $(toggle).prop("type");

        if ($("body").hasClass("darkMode")) {
            $("body").removeClass("darkMode");
            let expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + 1000 * 60 * 60 * 24 * 365);

            document.cookie =
                "darkModeStatus = false; expires=" + expireDate.toUTCString();
        } else {
            $("body").addClass("darkMode");
            let expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + 1000 * 60 * 60 * 24 * 365);

            document.cookie =
                "darkModeStatus = true; expires=" + expireDate.toUTCString();
        }
        // $("body").addClass(" darkMode");
        $(toggle).toggleClass(" toggle-container-active");
        $(toggleBtn).toggleClass(" toggle-btn-active");
    });
}
handleDarkMode();

//handle  media query
function wrapperDom() {
    return $(`<div id="wrapper">
  </div>`);
}

var intialProfileView = null;
var intialEventInfo = null;
var leftSideHeaderDiv = null;
var rightSideHeaderDiv = true;

function handleIntialState() {
    if ($("#wrapper").length <= 0) {
        return;
    }
    if ($("#wrapper").length > 0) {
        $("#wrapper").remove();
    }
    if (intialEventInfo != null && intialProfileView != null) {
        $("#home-container").prepend($(intialEventInfo));
        // $("#home-container").prepend($(leftSideHeaderDiv));
        $("#home-container").append($(intialProfileView));
    }
}

function handleMediaQuery() {
    if ($("#wrapper").length > 0) {
        return;
    }
    let wrapper = wrapperDom();

    $(wrapper).css({
        width: "100%",
        maxWidth: "100%",
    });
    $("#home-content-container").prepend($(wrapper));
    intialProfileView = $("#profile-view");
    intialEventInfo = $("#upcoming-events");
    let profileViewClone = $("#profile-view").clone(true);
    let eventInfoClone = $("#upcoming-events").clone(true);

    $(profileViewClone).css({
        width: "49.5%",
        maxWidth: "49.5%",
        minWidth: "160px",
        position: "relative",
        boxSizing: "border-box",

        // minWidth: "195px",
    });

    //console.log("kjvjbf $$$$$$$$$ ", $("#profile-view", wrapper).css("height"));
    $(eventInfoClone).css({
        height: $("#profile-view").css("height"),
        position: "relative",
        width: "49.5%",
        minWidth: "160px",
        maxWidth: "49.5%",
        // minWidth: "195px",
        // maxWidth: "195px",
        flexDirection: "column",
        // overflowX: "hidden",
        overflowY: "auto",
    });

    $("#profile-view").remove();
    $("#upcoming-events").remove();
    $("#event-header", eventInfoClone).css({
        fontSize: "13px",
    });
    $("a", $("#event-header", eventInfoClone)).hover(
        function() {
            $(this).css("fontSize", "13.1px");
        },
        function() {
            $(this).css("fontSize", "13px");
        }
    );
    $(wrapper).append(profileViewClone);
    $(wrapper).append(eventInfoClone);
    $(eventInfoClone).css({
        height: $("#profile-view").css("height"),
    });
}

function makeLeftOptions() {
    return $(`<div class="left-options"></div>`);
}

function animateAccording(target, pos) {
    $(target).animate({
            left: pos,
        },
        "fast"
    );
}

function listenerTo3Line() {
    $(".triple-line").click((e) => {
        let leftOption = $(" .left-options")[0];
        let left = $(leftOption).position().left;
        //console.log("left is ", left);
        if (left < -50) animateAccording(leftOption, 0);
        else animateAccording(leftOption, -100);
    });
}
listenerTo3Line();

function headerMediaQuery() {
    if ($("header .mid-div").length > 0) {
        leftSideHeaderDiv = $(".mid-div").clone(true);
        //remove if prevoius exist
        if ($(".left-options").length > 0) $(".left-options").remove();
        //add left options
        let left = makeLeftOptions();
        let clone = $(leftSideHeaderDiv).clone(true);
        $(clone).addClass(" left-view-header-option");
        $(left).append(clone);
        $("body").append(left);
        $("header .mid-div").remove();
    }

    if ($("header .triple-line").length == 0) {
        $("header").prepend(
            $(
                `<div class="triple-line" style='text-align:center; vertical-align:center;'>&#8801;</div>`
            )
        );
        listenerTo3Line();
    }
}

function headerMediaQuery2() {
    if ($("header .right-div").length > 0) {
        rightSideHeaderDiv = $("header .right-div");
        $(rightSideHeaderDiv).addClass(" left-view-header-option2");
        $(".left-options").append($(rightSideHeaderDiv));
        // $("header .right-div").remove();
    }
}

function resoterHeaderMedia() {
    if ($("header .triple-line").length > 0) {
        $("header .triple-line").remove();
        $(".left-options").remove();

        $("header > div:nth-child(1)").after($(leftSideHeaderDiv));
    }
}

function resoterHeaderMedia2() {
    // //console.log("running $$ ");
    if ($(".left-view-header-option2").length > 0) {
        $(rightSideHeaderDiv).removeClass(" left-view-header-option2");
        $("header").append($(rightSideHeaderDiv));
        // $(".left-view-header-option2").remove();
        // //console.log("running ^^^ ");
        // handleDarkMode();
    }
}

function setNotificationTop() {
    let headerHeight = $("header").css("height");
    headerHeight = headerHeight.substring(0, headerHeight.length - 2);
    $("#notifications").css({
        top: eval(headerHeight + "+6"),
    });
}
setNotificationTop();

function setNotificationRight() {
    $("#notifications").css({
        right: "2px",
    });
}

$(window).resize(() => {
    //console.log("m running ######  ");
    if (window.matchMedia("(max-width: 1075px)").matches) {
        handleMediaQuery();
        headerMediaQuery();
    }
    if (window.matchMedia("(max-width: 750px)").matches) {
        headerMediaQuery2();
    }
    if (!window.matchMedia("(max-width: 750px)").matches) {
        resoterHeaderMedia2();
    }
    if (!window.matchMedia("(max-width: 1075px)").matches) {
        handleIntialState();
        resoterHeaderMedia();
    }
    setRequestPageContainerTop();
    console.log("resize header height is ", $("header").css("height"));
    setEventHeaderTopAndSearchHeaderTop();
});
if (window.matchMedia("(max-width: 1075px)").matches) {
    handleMediaQuery();
    headerMediaQuery();
    setNotificationTop();
    setEventHeaderTopAndSearchHeaderTop();
    setRequestPageContainerTop();
}
if (window.matchMedia("(max-width: 750px)").matches) {
    headerMediaQuery2();
    setNotificationTop();
    setNotificationRight();
    setEventHeaderTopAndSearchHeaderTop();
    setRequestPageContainerTop();
}

//handle left option move when click outside
$(window).click((e) => {
    e.stopPropagation;
    let leftBar = $(".left-options")[0];
    let tripleLine = $(".triple-line")[0];
    if (
        leftBar &&
        !leftBar.contains(e.target) &&
        !tripleLine.contains(e.target)
    ) {
        animateAccording(leftBar, -100);
    }
});

function setEventHeaderTopAndSearchHeaderTop() {
    let headerHeight = $("header").css("height");
    headerHeight = headerHeight.substring(0, headerHeight.length - 2);
    console.log("header $$$$$$$$$$$$$$$$$4444444444 ", eval(headerHeight + "+6"));
    $("#events-container").css("top", eval(headerHeight + "+6"));
    $("#option-header").css("top", eval(headerHeight + "+6"));
}
setEventHeaderTopAndSearchHeaderTop();

function setRequestPageContainerTop() {
    let headerHeight = $("header").css("height");
    headerHeight = headerHeight.substring(0, headerHeight.length - 2);
    console.log("after resize header height is ", eval(headerHeight + "+6"));
    $("#request-new-creator-account-container").css(
        "top",
        eval(headerHeight + "+6")
    );
}
setRequestPageContainerTop();