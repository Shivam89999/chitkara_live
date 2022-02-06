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
        // console.log("value is &&&&&&&&&&&&&&&&&&& ", value);
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
                console.log("data is ", data);
                let page = $("#page-outline");
                console.log("page is ", page);

                // console.log("page is ", page);
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
                // console.log("search outline is ", searchOutline.length);
                let searchResultMain = $("#search-user-result-main", searchOutline);
                $(searchResultMain).html(findOptionPage(data.data.results));
                $(page).append(searchOutline);
                displayAccordingActiveTab();

                return;
            },
            error: function(err) {
                console.log("err is ", err.responseJSON.err);
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

document.addEventListener("mouseup", function(e) {
    let classs = "clickDisappear";
    // let not = document.getElementsByClassName("tem-member-edit-option");
    let no = document.getElementsByClassName(classs);
    if (!no[0].contains(e.target)) {
        console.log("yes mfvnjvjfv ****** ");
        document.querySelectorAll("." + classs).forEach((item) => {
            item.remove();
        });
    }
});

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
        if ($("#no-internet").length <= 0) {
            $("html").append(`<div id="no-internet">
            <img src="https://cdn-icons-png.flaticon.com/512/254/254613.png" alt="wi-fi" height="20px" width="25px" />
            <span style="font-size: 20; padding: 5px; padding-right: 0px">Low Internet.</span
      >
      <span style="font-size: 15; padding: 5px; padding-left: 0px"
        >Check data connection and refresh</span
      >
    </div>`);

            animationOnInternet(60, 600);
            animationOnInternet(52, 300);
        }
    } else if (navigator.onLine && $("#no-internet").length > 0) {
        animationOnInternet(60, 300);
        animationOnInternet(2, 600);
        setTimeout(() => {
            $("#no-internet").remove();
        }, 900);
    }
}
setInterval(function() {
    checkInternetConnected();
}, 100);

function handleDarkMode() {
    let toggle = $(".toggle-container");
    let toggleBtn = $(".toggle-btn");
    $(toggle).click((e) => {
        let type = $(toggle).prop("type");
        $("body").toggleClass("darkMode");
        $(toggle).toggleClass(" toggle-container-active");
        $(toggleBtn).toggleClass(" toggle-btn-active");
    });
}
handleDarkMode();