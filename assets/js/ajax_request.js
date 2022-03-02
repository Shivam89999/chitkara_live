//console.log("ajax script loaded &&&&&&&&&&&&&& ******************* ");
// //add new comment using ajax
// let handleAddnewComment = function() {
//     //console.log("add comment running");
//     // e.preventDefault();
//     //console.log("dff && ", $(".some"));
//     document.querySelectorAll(".some_spex").forEach((form) => {
//         //console.log("form is ", form);
// loadMorePostbtn;
// let localUser = <%= localUser %>;

//         form.submit(function(e) {
//             e.preventDefault();
//             //console.log("serialize %% ", form[0].serialize());
//         });
//     });

//     // //console.log("e is ", e.target.serialize());
//     // $.ajax({
//     //     type: "POST",
//     //     url: e.target.getAttribute("action"),
//     //     data: form.serialize(),
//     //     success: function(data) {
//     //         //console.log("data is ", data.data);
//     //     },
//     //     error: function(err) {
//     //         //console.log("err is ", err.responseText());
//     //     },
//     // });
// };

// handleAddnewComment();

// //console.log("hhjv ", $('.some'));
var allowedNotificationType = ["success", "error", "normal"];

function getNotification(type, message) {
    return $(`<div class='notification ${type}_notification'>
    <div class='message'>${message}</div>
            
            <div class='indicator'></div>
        </div>`);
}

function removeNotification(notification) {
    notification.css("pointer-events", "none");
    notification.css("transform", "translateX(-105%)");
    window.setTimeout(function() {
        notification.css("transform", "translateX(0)");
        window.setTimeout(() => {
            notification.remove();
        }, 250);
    }, 250);
}

function setRemoveTime(notification) {
    $(".indicator", notification).animate({
            width: "0",
        },
        1500,
        "linear"
    );
    return window.setTimeout(function() {
        removeNotification(notification);
    }, 1500);
}

function handleNotification(type, message) {
    if (message.length == 0) {
        //console.log("empty notification not allowed");
        return;
    }
    if (!allowedNotificationType.includes(type)) {
        //console.log("given type is not allowed ", type);
        return;
    }
    let notificationOutline = $("#notifications");
    let notification = getNotification(type, message);
    notificationOutline.append(notification);

    //add notification to screen
    window.setTimeout(function() {
        notification.css("transform", "translateX(-105%)");
        window.setTimeout(function() {
            notification.css("transform", "translateX(-100%)");
        }, 250);
    }, 10);
    //remove notification from screen
    let removeId = setRemoveTime(notification);
    notification.hover(
        function() {
            clearInterval(removeId);
            $(".indicator", notification).stop();
            $(".indicator", notification).css("width", "100%");
        },
        function() {
            removeId = setRemoveTime(notification);
        }
    );
}

// function handleNotification(type, text) {
//     new Noty({
//         theme: "relax",
//         text: text,
//         type: type,
//         layout: "topRight",
//         timeout: 1500,
//     }).show();
// }

// handle loader
function domLoader() {
    return $(`<div class="loader">
                        <div class="loading">
                            <div class="loading-box"></div>
                            <div class="loading-box"></div>
                            <div class="loading-box"></div>
                            <div class="loading-box"></div>
                        </div>
                        <span class='loader-content'>processing....</span>
                    </div>`);
}

function addLoader(Domloader) {
    let loading = $(".loading", Domloader);
    let box = $(".loading-box", loading);

    //console.log("loader is ", loading);
    //console.log("box is ", box);
    let i = 0;
    let intervalId = setInterval(() => {
        $(box[i]).toggleClass("active-loading");
        i = (i + 1) % 4;
    }, 100);
    return intervalId;
}

function removeLoader(Domloader, intervalId) {
    clearInterval(intervalId);
    $(Domloader).remove();
}

//handle commenting
function listenerToAddNewComment() {
    $(".some").each((i, itm) => {
        addNewComment(itm);
    });
}
listenerToAddNewComment();

function addNewComment(itm) {
    // //console.log("itm is ***** ", itm);
    $(itm).submit(function(e) {
        e.preventDefault();
        // //console.log("itm is ", itm);
        let dom_loader = domLoader();
        dom_loader.insertAfter($(itm).parent());
        let intervalId = addLoader(dom_loader);
        // //console.log("interval is ", intervalId);
        $(itm).toggleClass(" disable_btn_without_back");
        $(itm).toggleClass(" lock_form_without_background");
        $.ajax({
            type: "POST",
            url: $(itm).prop("action"),
            data: $(itm).serialize(),
            success: function(data) {
                //console.log("data is ", data.data);
                let domComment = addNewCommentToDOM(data.data.comment, data.data.post);

                $(`#all-comment-${data.data.post._id}`).prepend(domComment);
                $(`#all-comment-${data.data.post._id}>.no-comment`).remove();
                $(`#comment-head-${data.data.post._id}`).text(
                    data.data.post.comments.length + "  Comments"
                );
                $(`#comment-length-${data.data.post._id}`).text(
                    data.data.post.comments.length + "  comments"
                );
                //  reset is a js function not jquery to use jquery use below commented
                // $(itm).trigger('reset');
                handleToggleCommentLike(
                    $(`#toggle-comment-like-link-${data.data.comment._id}`, domComment)
                );
                //$(`#comment-${data.data.post._id}`).show();

                if ($(`#comment-${data.data.post._id}`).css("display") == "none") {
                    //  //console.log("%%%%%%%%%% ", data.data.post._id);
                    toggleComment(
                        data.data.post._id,
                        data.data.post.photos ? "Post" : "Text"
                    );
                }
                handleNotification("success", data.message);
                // itm.reset();
                $(itm).trigger("reset");
                removeLoader(dom_loader, intervalId);
                $(itm).toggleClass(" disable_btn_without_back");
                $(itm).toggleClass(" lock_form_without_background");
            },
            error: function(xhr, err) {
                removeLoader(dom_loader, intervalId);
                $(itm).toggleClass(" disable_btn_without_back");
                $(itm).toggleClass(" lock_form_without_background");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                // handleNotification("error", xhr.responseJSON.err);
                //console.log("err is ^^^^^^^^^ ", xhr.responseJSON.err);
                $(itm).trigger("reset");
            },
        });
    });
}
addNewComment();

function addNewCommentToDOM(comment, post) {
    return $(`<div class="comment" id="comment-id-${comment._id}">
                        <div class="upper-div-1">
                            <a href="/user/profile?user_id=${
                              comment.creator._id
                            }" style="text-decoration: none">
                                <div>
                                    <img src="${
                                      comment.creator.pic
                                    }" alt="img" height="30px" width="30px" style="border-radius: 50%" />
                                </div>
                            </a>
                            <div>
                                <a href="/user/profile?user_id=${
                                  comment.creator._id
                                }" style="text-decoration: none; color: rgb(117, 112, 112)">
                                    <span>${comment.creator.name}</span>
                                </a>
                                <span class="comment-content">${
                                  comment.content
                                }</span>
                            </div>
                        </div>
                        <div class="upper-div-2">
                            <div>
                                <span><a href="/user/toggle-like?id=${
                                  comment._id
                                }&type=Comment"
                                class="toggle-comment-like-link"
              id="toggle-comment-like-link-${comment._id}"
              ><span id="toggle-comment-like-span-${comment._id}">
                
                <img
                  src="https://cdn-icons-png.flaticon.com/512/151/151910.png"
                  alt=""
                  height="25px"
                  width="25px"
                />
              
              </span></a>
                                </span><span id="comment-like-count-${
                                  comment._id
                                }">${comment.likes.length}</span>
                            </div>

                                <div>
                                    <span onClick="handleEditCommentOption(event)"  class="edit-comment" link="/user/delete-comment?comment=${
                                      comment._id
                                    }&post=${post._id}&type=${
    post.photos ? "Post" : "TextPost"
  }">&vellip;</span
          >
        </div>
        
                        </div>
                    </div>`);
}

function handleLikeIconAndCount(target, liked, name) {
    let toggle = $(`#toggle-${name}-like-span-${target._id}`);
    let likeCount = $(`#${name}-like-count-${target._id}`);
    toggle.html("");
    likeCount.html("");
    if (liked) {
        toggle.html(`<img
                  src="/uploads/icons/3.liked.png"
                  alt="yes likes"
                  height="25px"
                  width="25px"
                 style='color:red;'
                />`);
    } else {
        toggle.html(`<img
                  src="/uploads/icons/4.not_liked.png"
                  alt="no"
                  height="25px"
                  width="25px"
                
                />`);
    }

    likeCount.html(`${target.likes.length}`);
    if (name == "post") {
        likeCount.html(`${target.likes.length} likes`);
    }
}

function handleToggleCommentLike(toggleLikeOfComment) {
    //  //console.log("toggle comment like &&&&&&&&&&&&&&&&&&&&&&&&& &&&&&&&&&&&&&&");
    $(toggleLikeOfComment).click(function(e) {
        e.preventDefault();
        $(toggleLikeOfComment).toggleClass(" disable_btn_without_back");
        $.ajax({
            type: "GET",
            url: $(toggleLikeOfComment).prop("href"),
            success: function(data) {
                //console.log("data is ", data);
                let comment = data.data.comment;
                handleLikeIconAndCount(
                    comment,
                    data.data.like ? true : false,
                    "comment"
                );
                $(toggleLikeOfComment).toggleClass(" disable_btn_without_back");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(toggleLikeOfComment).toggleClass(" disable_btn_without_back");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", err.responseText);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function addLikesUserBar(post) {
    var string = ` <div class="first-div"><span>${
    post.likes.length
  } people are liked this post</span> <span><a href="/user/likes?post=${
    post._id
  }&type=${post.photos ? "Post" : "TextPost"}">View All</a></span></div>
                            <div>`;
    for (let i = 0; i < 7 && i < post.likes.length; i++) {
        string += `<img src="${post.likes[i].creator.pic}" alt="pic" height="40px" width="40px" style="border-radius: 50%; padding:0px 7px 0px 7px;">`;
    }

    string += `</div>`;
    return $(string);
}

function tooggleCommentLikes() {
    $(".toggle-comment-like-link").each((i, toggleLikeOfComment) => {
        handleToggleCommentLike(toggleLikeOfComment);
    });
}
tooggleCommentLikes();

function togglePostLike() {
    $(".post-like-toggle").each((i, toggleLikeOfPost) => {
        handleTogglePostLike(toggleLikeOfPost);
    });
}

function handleTogglePostLike(toggleLikeOfPost) {
    $(toggleLikeOfPost).click((e) => {
        e.preventDefault();
        $(toggleLikeOfPost).toggleClass(" disable_btn_without_back");
        $.ajax({
            type: "GET",
            url: $(toggleLikeOfPost).prop("href"),
            success: function(data) {
                let post = data.data.post;
                handleLikeIconAndCount(post, data.data.like ? true : false, "post");
                let bar = $(`#likes-detail-${post._id}`);
                bar.html("");
                if (post.likes.length > 0) {
                    bar.append(addLikesUserBar(post));
                }
                $(toggleLikeOfPost).toggleClass(" disable_btn_without_back");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(toggleLikeOfPost).toggleClass(" disable_btn_without_back");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", err.responseText);
                handleNotification("error", xhr.responseJSON.err);
            },
            // statusCode: {
            //     401: function(res, textStatus, xhr) {
            //         //console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            //         //console.log(
            //             "res is ",
            //             res.status,
            //             " text status is ",
            //             textStatus,
            //             " xhr is ",
            //             xhr
            //         );
            //     },
            // },
        });
    });
}
togglePostLike();

function handleSaveImgDisplay(type) {
    if (type) {
        return $(`<img
          src="/uploads/icons/33.saved.png"
          height="25px"
          width="20px"
          alt=""
      />`);
    } else {
        return $(`<img
          src="/uploads/icons/34.not-saved.png"
          height="25px"
          width="20px"
          alt=""
      />`);
    }
}

function handleToggleSave(saveToggle) {
    $(saveToggle).click((e) => {
        e.preventDefault();
        $(saveToggle).toggleClass(" disable_btn_without_back");
        $.ajax({
            type: "GET",
            url: $(saveToggle).prop("href"),
            success: function(data) {
                //console.log("data is ", data);
                let parent = $(`#save-toggle-link-${data.data.target._id}`);
                parent.html("");
                parent.append(handleSaveImgDisplay(data.data.state ? true : false));
                handleNotification("success", data.message);
                $(saveToggle).toggleClass(" disable_btn_without_back");
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                //console.log("err is ", err.responseText);
                $(saveToggle).toggleClass(" disable_btn_without_back");
            },
        });
    });
}

function toggleSavePost() {
    $(".save-toggle-link").each((i, saveToggle) => {
        handleToggleSave(saveToggle);
    });
}

toggleSavePost();

function deleteComment(deleteCommentLink) {
    $(deleteCommentLink).click((e) => {
        e.preventDefault();
        $(deleteCommentLink).toggleClass(" disable_btn_without_back");
        $.ajax({
            type: "GET",
            url: $(deleteCommentLink).prop("href"),
            success: function(data) {
                //console.log("data is ^^ ", data);
                $(`#comment-id-${data.data.commentId}`).remove();
                $(`#comment-head-${data.data.postId}`).text(
                    data.data.commentLength + "  Comments"
                );
                $(`#comment-length-${data.data.postId}`).text(
                    data.data.commentLength + "  comments"
                );

                if (data.data.commentLength == 0) {
                    $(`#all-comment-${data.data.postId}`).append(
                        $(`<div class="comment no-comment" style="text-align: center; color: rgb(31, 29, 29); box-shadow: none">
                No comments for this post
            </div>`)
                    );
                }
                $(deleteCommentLink).toggleClass(" disable_btn_without_back");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(deleteCommentLink).toggleClass(" disable_btn_without_back");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is", err);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function handleDeleteComment() {
    $(".delete-comment-link").each((i, deleteCommentLink) => {
        deleteComment(deleteCommentLink);
    });
}
handleDeleteComment();

function handleEditCommentOption(event) {
    let classs = "toUpdateComment";

    let ele = event.target;
    //console.log("targte ele is ", ele);
    // let id = ele.getAttribute("id");
    // //console.log("event.target is ", ele);
    // //console.log("comment id is *************** ", id);

    let D = document.createElement("div");
    // D.id = classs + "-" + id;
    D.className = classs;
    D.className += " clickDisappear";

    let addr = ele.getAttribute("link");
    var link = document.createElement("a");
    link.innerHTML =
        "<img src='/uploads/icons/41.delete.png' alt='delete' height='30px' width='22px' />";
    link.href = addr;
    // link.id = id;
    link.className = "delete-comment-link";
    D.appendChild(link);
    //console.log("D is ", D);
    //console.log("paren t ************** ", ele.parentNode.parentNode);
    ele.parentNode.parentNode.parentNode.appendChild(D);
    deleteComment($(link));
}

function handleEditPostOption(event) {
    let classs = "toUpdate";

    let ele = event.target;

    // let id = parseInt($(ele).attr("id"));
    let id = parseInt(ele.getAttribute("id"));

    // //console.log("event.target is ", ele);
    // //console.log("id is *************** ", id);

    let D = document.createElement("div");
    D.id = classs + "-" + id;
    D.className = classs;
    D.className += " clickDisappear";

    let addr = ele.getAttribute("link");
    var link = document.createElement("a");

    link.innerHTML =
        "<img src='/uploads/icons/41.delete.png' alt='delete' style='padding-left:5px;padding-top:4px;' height='30px' width='22px' />";
    link.href = addr;
    link.id = id;
    link.className = "delete-post-link";
    D.appendChild(link);
    //console.log("D is ", D);
    //console.log("to add is ");
    // // //console.log("D is &&&&&&&&&&&&&&&&&&&&&&& ", D);
    // //console.log("mrfn  ", document.getElementsByClassName("day-menu"));
    document.getElementById("post-" + id).appendChild(D);
    deletePost($(link));
}

function handleDeletePost() {
    $(".delete-post-link").each((deletePostLink) => {
        //console.log("delete post links are ", deletePostLink);
        deletePost(deletePostLink);
    });
}
handleDeletePost();

function deletePost(deletePostLink) {
    //console.log("%%%%%%%%%%%%%%5 66  : ", $(deletePostLink));
    $(deletePostLink).click((e) => {
        //console.log("$$$$$$$$$$$$$$$$$$$$$$  ^^^^^^ ");
        e.preventDefault();
        $(deletePostLink).toggleClass(" disable_btn_without_back");
        let id = $(deletePostLink).prop("id");

        $.ajax({
            type: "GET",
            url: $(deletePostLink).prop("href"),
            success: function(data) {
                //console.log("data is ", data);
                $(`#post-${id}`).remove();
                //console.log("data postId ", data.data.postId);
                $(`#comment-${data.data.postId}`).remove();
                $(deletePostLink).toggleClass(" disable_btn_without_back");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                $(deletePostLink).toggleClass(" disable_btn_without_back");
                //console.log("err is ", xhr.responseJSON.err);
            },
        });
    });
}

// handle sign-in/up
function getLoginForm() {
    return $(`<form action="/create-session" id="login-form-page" method="POST">
          <input
            class="input login"
            required
            type="text"
            name="email"
            oninput="handleInputChange(event)"
            onfocus="handleInputChange(event)"
            placeholder="Email*"
          />

          <input
            class="input login"
            required
            type="password"
            name="password"
            id=""
            placeholder="Password*"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
          />
          
         <span class='forgot-link' >forgot password</span>
         

          <button style="margin-left: 45px">Sign in</button>
        </form>
          <a href="/auth/google" id="google-with">
          <img
            src="https://www.transparentpng.com/thumb/google-logo/google-logo-png-icon-free-download-SUF63j.png"
            alt="logo"
            height="40px"
            width="40px"
          />
          <span>Google continue</span>
        </a>

        `);
}

function showSignInPage() {
    slidedown("vmk");
    let loginOutline = $("#login-form");
    loginOutline.html("");
    loginOutline.append(getLoginForm());
    forgotPasswordListener($(".forgot-link", loginOutline));
}
showSignInPage();

function forgotPasswordListener(forgotLink) {
    forgotLink.click(function(e) {
        e.preventDefault();
        //console.log("some %%%%%%%%%%%%%%%%%%% 00");
        slidedown("jhcdh");
        let loginOutline = $("#login-form");
        loginOutline.html("");
        let form = getOtpForm("/forgot-password-send-otp");
        loginOutline.append(form);
        getOtp(form);
    });
}

function getOtp(form) {
    form.submit((e) => {
        e.preventDefault();
        $(form).toggleClass(" disable_btn_without_back");
        $("button", form).toggleClass(" disable_btn");
        $.ajax({
            method: "POST",
            url: form.prop("action"),
            data: form.serialize(),
            success: function(data) {
                //console.log("message is ", data);
                if (data.data.type == "signUp") {
                    show_email_verification_page(
                        data.data.email,
                        "/sign-up-email-verification",
                        `/resend-sign-up-otp-email?email=${data.data.email}`
                    );
                } else if (data.data.type == "forgotPassword") {
                    show_email_verification_page(
                        data.data.email,
                        "/forgot-password-email-verification",
                        `/resend-forgot-password-otp-email?email=${data.data.email}`
                    );
                }
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
                //console.log("err is ", xhr.responseJSON.err);
            },
        });
    });
}

function getOtpForm(action) {
    return $(`<form action="${action}"  method="POST">
          <input
            class="input get-otp"
            required
            type="text"
            name="email"
            oninput="handleInputChange(event)"
            onfocus="handleInputChange(event)"
            placeholder="Email*"
            style="margin-top: 10px"
          
          />

          <button>Get otp</button>
        </form>
        
         <a href="/auth/google" id="google-with">
          <img
            src="https://www.transparentpng.com/thumb/google-logo/google-logo-png-icon-free-download-SUF63j.png"
            alt="logo"
            height="40px"
            width="40px"
          />
          <span>Google continue</span>
        </a>
        
        
        `);
}

function showSignUpGetOtpPage() {
    slidedown("jhcdh");
    let loginOutline = $("#login-form");
    loginOutline.html("");
    let form = getOtpForm("/sign-up-send-otp");
    loginOutline.append(form);
    // getOtpForSignUp(form);
    getOtp(form);
}

function otp_email_verification_form(email, action, resendLink) {
    return $(`<form action="${action}" id="sign-up-email-verification-form" method="POST">
          <input
            class="input otp-verify"
            required
            type="text"
            name="email"
            oninput="handleInputChange(event)"
            onfocus="handleInputChange(event)"
            placeholder="Email*"
            value="${email}"
            style="pointer-events: none; opacity: 0.5"
            autocomplete='off'
          />

          <input
            class="input otp-verify"
            required
            type="password"
            name="otp"
            id=""
            placeholder="Otp *"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
            autocomplete='off'
          />
          <div style="text-align: center; margin-top: 7px">
            <a
              href="${resendLink}"
              class="resend-link"
              >Resend Otp</a
            >
          </div>
          <button>Verify email</button>
        </form>`);
}

function show_email_verification_page(email, action, resendLink) {
    slidedown("jhcdh");
    let loginOutline = $("#login-form");
    loginOutline.html("");
    let emailVerificationForm = otp_email_verification_form(
        email,
        action,
        resendLink
    );
    loginOutline.append(emailVerificationForm);
    verifyEmail(emailVerificationForm);
    otp_resend_option($(" .resend-link", emailVerificationForm));
}

function show_SignUp_intial_dataForm(secret) {
    slidedown("jhcdh");
    let loginOutline = $("#login-form");
    loginOutline.html("");
    let form = get_sign_up_initial_data_form(secret);
    loginOutline.append(form);
    sendIntialData(form);
}

function show_Set_Password_Form(secret) {
    slidedown("jhcdh");
    let loginOutline = $("#login-form");
    loginOutline.html("");
    let form = getSetPasswordForm(secret);
    loginOutline.append(form);
    sendIntialData(form);
}

function sendIntialData(intialDataForm) {
    //console.log("intialdataform is ~~~~~~~~~~~~~~~~~~~~~~ ", intialDataForm);
    intialDataForm.submit((e) => {
        e.preventDefault();
        $(intialDataForm).toggleClass(" disable_btn_without_back");
        $("button", intialDataForm).toggleClass(" disable_btn");
        $.ajax({
            method: "POST",
            url: intialDataForm.prop("action"),
            data: intialDataForm.serialize(),
            success: function(data) {
                //console.log("data is ", data.message);
                showSignInPage();
                handleNotification("success", data.message);
                $(intialDataForm).toggleClass(" disable_btn_without_back");
                $("button", intialDataForm).toggleClass(" disable_btn");
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                //console.log("err is ", xhr.responseJSON.err);
                $(intialDataForm).toggleClass(" disable_btn_without_back");
                $("button", intialDataForm).toggleClass(" disable_btn");
            },
        });
    });
}
//handle sign-up through link  form of submission
function handleSignUpThroughLink() {
    let container = $("#sign-up-link-container");
    sendIntialData($("form", container));
}
handleSignUpThroughLink();

//handle set new password through link  form of submission
function handleSetNewPasswordThroughLink() {
    let container = $("#set-new-password-link-container");
    sendIntialData($("form", container));
}
handleSetNewPasswordThroughLink();

function getSetPasswordForm(secret) {
    return $(`<form action="/update-password-with-secret" method="POST">
          <input type="hidden" value="${secret}" name="secret" required />
        
          <input
            class="input sign-up"
            required
            type="password"
            name="password"
            id=""
            placeholder="New Password *"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
            autocomplete='off'
          />
          <input
            class="input sign-up"
            required
            type="password"
            name="confirm_password"
            id=""
            placeholder="Confirm Password *"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
            autocomplete='off'
          />
          <button>Update</button>
        </form>`);
}

function get_sign_up_initial_data_form(secret) {
    return $(`<form action="/sign-up-with-secret" method="POST" >
          <input type="hidden" value="${secret}" name="secret" required />
          <input
            class="input sign-up"
            required
            type="text"
            name="name"
            placeholder="Name"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
            autocomplete='off'
          />
          <input
            class="input sign-up"
            required
            type="password"
            name="password"
            id=""
            placeholder="Password *"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
            autocomplete='off'
          />
          <input
            class="input sign-up"
            required
            type="password"
            name="confirm_password"
            id=""
            placeholder="Confirm Password *"
            onfocus="slideup(event)"
            onfocusout="slidedown(event)"
            autocomplete='off'
          />
          <button>Sign-Up</button>
        </form>`);
}

function verifyEmail(emailVerificationForm) {
    emailVerificationForm.submit((e) => {
        e.preventDefault();
        $(emailVerificationForm).toggleClass(" disable_btn_without_back");
        $("button", emailVerificationForm).toggleClass(" disable_btn");
        $.ajax({
            method: "POST",
            url: emailVerificationForm.prop("action"),
            data: emailVerificationForm.serialize(),
            success: function(data) {
                //console.log("data is ", data.message);
                let secret = data.data.secret;
                if (data.data.type == "signUp") {
                    show_SignUp_intial_dataForm(secret);
                } else if (data.data.type == "forgotPassword") {
                    show_Set_Password_Form(secret);
                }
                handleNotification("success", data.message);
                $(emailVerificationForm).toggleClass(" disable_btn_without_back");
                $("button", emailVerificationForm).toggleClass(" disable_btn");
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                //console.log("error is ", err.responseText);
                $(emailVerificationForm).toggleClass(" disable_btn_without_back");
                $("button", emailVerificationForm).toggleClass(" disable_btn");
            },
        });
    });
}

function getOtpForSignUp(form) {
    form.submit((e) => {
        e.preventDefault();
        $(form).toggleClass(" disable_btn_without_back");
        $("button", form).toggleClass(" disable_btn");
        $.ajax({
            method: "POST",
            url: form.prop("action"),
            data: form.serialize(),
            success: function(data) {
                //console.log("message is ", data.message);
                show_sign_up_email_verification_page(data.data.email);
                handleNotification("success", data.message);
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                //console.log("err is ", xhr.responseJSON.err);
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
            },
        });
    });
}

function otp_resend_option(link) {
    link.click(function(e) {
        e.preventDefault();
        $(link).toggleClass(" disable_btn_without_back");
        $.ajax({
            method: "GET",
            url: link.prop("href"),
            success: function(data) {
                //console.log("message is ", data.message);
                handleNotification("success", data.message);
                $(link).toggleClass(" disable_btn_without_back");
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                //console.log("err is ", xhr.responseJSON.err);
                $(link).toggleClass(" disable_btn_without_back");
            },
        });
    });
}

//******* handle notice actions  **********

function handleNoticeLike(link) {
    $(link).click((e) => {
        e.preventDefault();
        $(link).toggleClass(" disable_btn_without_back");
        //console.log("href is ^^^^^^^ ", $(link).prop("href"));
        $.ajax({
            type: "GET",
            url: $(link).prop("href"),
            success: function(data) {
                $(link).toggleClass(" disable_btn_without_back");
                //console.log("data is ", data.data.notice._id);
                let notice = data.data.notice;
                handleLikeIconAndCount(notice, data.data.like ? true : false, "notice");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(link).toggleClass(" disable_btn_without_back");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", xhr.responseText);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function handleNotices() {
    //console.log("handle notices running ");
    $(".notice").each((i, itm) => {
        handleNoticeLike($(".notice-like-link", itm));
    });
}
handleNotices();

// handle edit poll option
function deleteByType(typeDeleteLink) {
    $(typeDeleteLink).click((e) => {
        e.preventDefault();

        $(typeDeleteLink).toggleClass(" disable_btn_without_back");
        //console.log("prevent by me ^^^^^^^^^^ ");
        $.ajax({
            type: "GET",
            url: $(typeDeleteLink).prop("href"),
            success: function(data) {
                //console.log("req successfull, message is ", data.message);
                $(typeDeleteLink).toggleClass(" disable_btn_without_back");
                //console.log("data is ", data.data);
                const typeId = data.data.typeId;
                const type = data.data.type;
                //console.log("^^^^^^^^^^^^^^ ", $(`#${type}-${typeId}`));
                $(`#${type}-${typeId}`).remove();
                let Container = $(`#${type}s`);
                //console.log("dc ^^^ ", $(Container).children().length);
                if ($(Container).children().length == 0) {
                    if (type == "notice")
                        $(Container)
                        .after(`<div id="no-notice" style="margin: auto; font-size: 35; width: fit-content; margin-top: 50px">
        No Notice Found
    </div>`);
                    Container.remove();
                }
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(typeDeleteLink).toggleClass(" disable_btn_without_back");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", xhr.responseJSON.err);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function handleEditOptionByType(link, type) {
    $(link).click(function(event) {
        event.preventDefault();
        let classs = "toUpdate" + type;

        let ele = event.target;
        //console.log("targte ele is ", ele);
        // let id = ele.getAttribute("id");
        // //console.log("event.target is ", ele);
        // //console.log("comment id is *************** ", id);

        let D = document.createElement("div");
        // D.id = classs + "-" + id;
        D.className = classs;
        D.className += " clickDisappear";

        let addr = ele.getAttribute("link");
        var link = document.createElement("a");
        link.innerHTML =
            "<img src='/uploads/icons/41.delete.png' alt='delete' height='39px' width='31px' />";
        link.href = addr;
        // link.id = id;
        // link.className = "delete-comment-link";
        D.appendChild(link);
        //console.log("D is ", D);
        //console.log("paren t ************** ", ele.parentNode.parentNode);
        if (type == "alert") {
            ele.parentNode.appendChild(D);
        } else if (type == "poll" || type == "notice") {
            ele.parentNode.parentNode.appendChild(D);
        }
        deleteByType($(link));
    });
}

// function handleDeleteNotice(link) {
//     $(link).click((e) => {
//         $.ajax({
//             type: "GET",
//             url: $(link).prop("href"),
//             success: function(data) {},
//             error: function(xhr, err) {},
//         });
//     });
// }

function addListenerToEdit() {
    $(".poll-edit-link").each((i, itm) => {
        //console.log("handle poll deletion: ", itm);
        handleEditOptionByType(itm, "poll");
    });

    $(".alert-edit-link").each((i, itm) => {
        //console.log("handle alert deletion: ", itm);
        handleEditOptionByType(itm, "alert");
    });
    $(".notice-edit-link").each((i, itm) => {
        //console.log("handle notice deletion");
        handleEditOptionByType(itm, "notice");
    });
}
addListenerToEdit();

function handlePollVoting(itm) {
    $(itm).click((e) => {
        e.preventDefault();
        $(itm).parent().toggleClass(" disable_btn");
        $.ajax({
            type: "GET",
            url: $(itm).prop("href"),
            success: function(data) {
                let pollId = data.data.pollId;
                // //console.log("pollId is ", pollId);
                let yes_voting = $(`#yes-voting-${pollId}`);
                let no_voting = $(`#no-voting-${pollId}`);
                let pollVoteLength = $(`#poll-votes-length-${pollId}`);
                $(yes_voting).css("pointer-events", "none");
                $(no_voting).css("pointer-events", "none");
                // //console.log("cddd^^^^^ ", $(".yes-option", yes_voting));
                $(".yes-option", yes_voting).text(data.data.yesPercent + "%");
                $(".no-option", no_voting).text(data.data.noPercent + "%");

                if (pollVoteLength.length > 0) {
                    //console.log("running ^^^^^^^^^^^^^^^^^^ ");
                    $(pollVoteLength).text(data.data.totalVotes + " votes");
                }
                $(itm).parent().toggleClass(" disable_btn");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(itm).parent().toggleClass(" disable_btn");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", xhr.responseJSON.err);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}
//handle vote for poll
function handleListenerToPollVote() {
    $(".vote_for_no").each((i, itm) => {
        handlePollVoting(itm);
    });
    $(".vote_for_yes").each((i, itm) => {
        handlePollVoting(itm);
    });
}
handleListenerToPollVote();

//handle requests using ajax
function makeLinkButton(type, profileId) {
    let newButtonType = null;
    if (type == "connect") newButtonType = "withdraw";
    else if (type == "accept") newButtonType = "remove";
    else if (type == "ignore" || type == "withdraw" || type == "remove")
        newButtonType = "connect";
    if (newButtonType == "connect") {
        return $(` <a
          class="request-link"
          href="/user/send-request?target=${profileId}"
          ><button>Connect</button></a
        >`);
    }
    if (newButtonType == "remove")
        return $(` <a
          class="request-link"
          href="/user/remove-membership?target=${profileId}"
          ><button>Remove</button></a
        >`);
    return $(`  <a
          class="request-link"
          href="/user/withdraw-request?target=${profileId}"
          ><button>Withdraw</button></a
        >
`);
}

function handleRequests(itm) {
    $(itm).click((e) => {
        e.preventDefault();
        $(itm).toggleClass(" disable_btn");
        $.ajax({
            type: "GET",
            url: $(itm).prop("href"),
            success: function(data) {
                //console.log("data is ", data.message);
                handleNotification("success", data.message);
                let type = data.data.type;
                let profileId = data.data.profileId;
                let newButton = makeLinkButton(type, profileId);
                // let container = $(`#buttons`);
                let container = $(itm).parent();
                $(`.request-link`, container).each((i, itm) => {
                    itm.remove();
                });
                $(container).prepend(newButton);
                handleRequests(newButton);
            },
            error: function(xhr, err) {
                $(itm).toggleClass(" disable_btn");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page
                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", xhr.responseJSON.err);

                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function addListenerToRequestButtons() {
    $(".request-link").each((i, itm) => {
        handleRequests(itm);
    });
}
addListenerToRequestButtons();

//handle create new like post, event, textpost, alert ......
function handleNewCreateContent(form) {
    $(form).submit((e) => {
        e.preventDefault();
        let dom_loader = domLoader();
        dom_loader.insertBefore($("button", form));
        let intervalId = addLoader(dom_loader);
        $(form).toggleClass(" disable_btn_without_back");
        $("button", form).toggleClass(" disable_btn");

        $.ajax({
            type: "POST",
            url: $(form).prop("action"),
            data: $(form).serialize(),
            // processData: false,

            // data: data,
            success: function(data) {
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
                //console.log("data is ", data);

                removeLoader(dom_loader, intervalId);
                handleNotification("success", data.message);
                window.location = "/";
            },
            error: function(xhr, textStatus, message) {
                removeLoader(dom_loader, intervalId);
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page
                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                // //console.log(
                //     "err textStatus is ^^ ",
                //     textStatus,
                //     " err message is ",
                //     message
                // );
                // //console.log("res is ", xhr.responseJSON.err);
                if (textStatus == "timeout") {
                    handleNotification("error", "Request " + message);
                } else handleNotification("error", xhr.responseJSON.err);
            },
            timeout: 10000,
        });
    });
}

function addListenerToNewCreateContent() {
    $(".create-new-form").each((i, itm) => {
        handleNewCreateContent(itm);
    });
}
addListenerToNewCreateContent();

//k

document.addEventListener("mouseup", function(e) {
    // //console.log("yes detected *************");
    let classs = "clickDisappear";
    // let not = document.getElementsByClassName("tem-member-edit-option");
    // let no = document.getElementsByClassName(classs);
    let no = $("." + classs)[0];
    // if (!no[0].contains(e.target)) {
    //     // //console.log("yes mfvnjvjfv ****** ");
    //     document.querySelectorAll("." + classs).forEach((item) => {
    //         item.remove();
    //     });
    // }
    if (no && !no.contains(e.target)) {
        // //console.log("yes mfvnjvjfv ****** ");
        // document.querySelectorAll("." + classs).forEach((item) => {
        //     item.remove();
        // });
        $("." + classs).remove();
    }
});

//handle realtime comment loading
function makeCommentDom(comment, localUser, post_id, postCreatorId, postType) {
    let res = `
                    <div class="comment" id="comment-id-${comment._id}">
                        <div class="upper-div-1">
                            <a href="/user/profile?user_id=${comment.creator._id}" style="text-decoration: none">
                                <div>
                                    <img src="${comment.creator.pic}" alt="img" height="30px" width="30px" style="border-radius: 50%;" />
                                </div>
                            </a>
                            <div>
                                <a href="/user/profile?user_id=${comment.creator._id}" style="text-decoration: none; color: rgb(117, 112, 112)">
                                    <span>${comment.creator.name}</span>
                                </a>
                                <span class="comment-content">${comment.content}</span>
                            </div>
                        </div>
                        <div class="upper-div-2">
                            <div>
                                <span>
                                <a
              class="toggle-comment-like-link"
              id="toggle-comment-like-link-${comment._id}"
              href="/user/toggle-like?id=${comment._id}&type=Comment"
              ><span id="toggle-comment-like-span-${comment._id}">`;
    var existLike = false;
    if (localUser) {
        for (lik of comment.likes) {
            if (lik.creator == localUser._id) {
                existLike = true;
                break;
            }
        }
    }
    if (!existLike) {
        res += `<img
                  src="https://cdn-icons-png.flaticon.com/512/151/151910.png"
                  alt="no-like"
                  height="25px"
                  width="25px"
                />`;
    } else {
        res += `<img
                  src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
                  alt="yes-like"
                  height="25px"
                  width="25px"
                />`;
    }
    res += `
     </span></a
            >
                                </span><span id="comment-like-count-${comment._id}">${comment.likes.length}</span
          >
        </div>
`;

    if (
        localUser &&
        (comment.creator._id == localUser._id || localUser._id == postCreatorId)
    ) {
        res += `<div>
          <span
            onClick="handleEditCommentOption(event)"
            class="edit-comment"
            link="/user/delete-comment?comment=${comment._id}&post=${post_id}&type=${postType}"
            >&vellip;</span
          >
        </div>`;
    } else {
        res += `<div style="visibility: hidden">
          <span style="width: 12px"></span>
                            </div>`;
    }

    res += `</div>
                    </div>`;
    return $(res);
}

function addCommentdToDom(
    target,
    comments,
    post_id,
    postCreatorId,
    localUser,
    postType
) {
    for (let comment of comments) {
        let domComment = makeCommentDom(
            comment,
            localUser,
            post_id,
            postCreatorId,
            postType
        );
        $(target).append(domComment);
        handleToggleCommentLike(
            $(`#toggle-comment-like-link-${comment._id}`, domComment)
        );
    }
}

function loadMoreButton(post_id, lastTime, type) {
    //console.log("post_id ", post_id, " time is ", lastTime, "Type is ", type);
    return $(
        `<button class='load-comment load-on-demand' id='load-comment-${post_id}' time=${lastTime} type=${type} postId=${post_id}>Load More</button>`
    );
}

// function loadMorePostButton(lastTime) {
//     //console.log(" time is ", lastTime);
//     return $(
//         `<button class='load-post'  time=${lastTime} >Load More Post</button>`
//     );
// }

function toggleComment(post_id, type) {
    //console.log("post_id ^^^^^^^^^^^^^^ ", post_id);
    let loadLimit = 6;
    //console.log("type is ############ %%%%%%%%% ", type);
    let comment = $("#comment-" + post_id);
    let styyle = $(comment).css("display");
    let newStyle = styyle === "none" ? "block" : "none";
    //console.log("newStyle ", newStyle, "  prev Style ", styyle);
    // comment.style.display = newStyle;
    $(comment).css("display", newStyle);
    if (newStyle == "none") return;
    let dom_loader = domLoader();
    $(`#all-comment-${post_id}`).html("");
    $(comment).append(dom_loader);
    let intervalId = addLoader(dom_loader);

    $.ajax({
        type: "GET",
        url: `/get-comments-of-post?id=${post_id}&type=${type}`,
        success: async function(data) {
            //console.log("data is ", data.data);
            removeLoader(dom_loader, intervalId);
            addCommentdToDom(
                $("#all-comment-" + post_id, comment),
                data.data.comments,
                post_id,
                data.data.postCreatorId,
                data.data.localUser,
                data.data.postType
            );

            $(`#comment-head-${post_id}`).text(data.data.noOfComments + " Comments");
            $(`#comment-length-${post_id}`).text(
                data.data.noOfComments + " comments"
            );
            if (data.data.comments.length >= loadLimit) {
                let loadMore = loadMoreButton(
                    post_id,
                    data.data.lastTime,
                    data.data.postType
                );
                await $("#all-comment-" + post_id, comment).append(loadMore);
                handleLoadingCommentVisiblity(loadMore);
            }
            if (data.data.comments.length == 0) {
                $("#all-comment-" + post_id, comment)
                    .append(`<div class="comment no-comment" style="text-align: center; color: rgb(31, 29, 29); box-shadow: none">
                No comments for this post
            </div>`);
            }
        },
        error: function(xhr, err) {
            //console.log("err in loading comments plzz refresh the page");
            handleNotification("error", xhr.responseJSON.err);
            removeLoader(dom_loader, intervalId);
        },
    });
}

//add listener to load more comment
function loadMoreComment(itm) {
    let loadLimit = 6;
    // $(itm).click((e) => {
    //     e.preventDefault();
    let time = $(itm).attr("time");
    let type = $(itm).attr("type");
    //console.log("type is 1667 @@@@@@@@ $$$$$$$$$$$$  ", type);
    let post_id = $(itm).attr("postId");
    $(itm).css("backgroundColor", "red");
    //console.log("time is ", time, " postId is ", post_id);
    //load more comment
    //add loader
    let dom_loader = domLoader();
    $(dom_loader).insertAfter(itm);
    //remove this button
    $(itm).remove();
    let intervalId = addLoader(dom_loader);

    $.ajax({
        type: "GET",
        url: `/load-more-comments-of-post?id=${post_id}&time=${time}&type=${type}`,
        success: async function(data) {
            removeLoader(dom_loader, intervalId);
            //console.log("data is ", data);
            addCommentdToDom(
                $("#all-comment-" + post_id),
                data.data.comments,
                post_id,
                data.data.postCreatorId,
                data.data.localUser,
                data.data.postType
            );
            if (data.data.comments.length >= loadLimit) {
                //console.log("data.data.postType is @@@@@@@@@ ", data.data.postType);
                let loadMore = loadMoreButton(
                    post_id,
                    data.data.lastTime,
                    data.data.postType
                );
                await $("#all-comment-" + post_id).append(loadMore);
                handleLoadingCommentVisiblity(loadMore);
            }
        },
        error: function(xhr, err) {
            removeLoader(dom_loader, intervalId);
            //console.log("err in loading more comment is ", xhr.responseJSON.err);
            handleNotification("error", xhr.responseJSON.err);
        },
    });
    // });
}

function callpostIntialFunctions(domEle) {
    handlePostLikeUsingDoubleClick($(".post-main-section", domEle), "Post");
    intialImageDisplay();
    handleTogglePostLike($(".post-like-toggle", domEle));
    addListenerToallNextPrevBtn($(".button", domEle));
    handleToggleSave($(".save-toggle-link", domEle));
    addNewComment($(".some", domEle));
    handleEvents($(".type-detail", domEle));
    handleEventHeadText($(".event-head", domEle));
    eventDetailToggle($(".type-detail", domEle));
    setEventDate($(".event-time", domEle));
    //handleBack(".event-back-btn", item);
    // handleBack($(".event-back-btn", domEle));
    handleBack($(".event-back-btn", domEle));

    setCreatedTime($(".created-time", domEle));
}

function addPostsToDom(localUser, posts) {
    let count = $(".post-class").length;
    //console.log("count is ^^^^^^^^^^^^^^^ ", count);
    for (let post of posts) {
        let domEle = addPostToDom(localUser, post, count);
        $("#post-container").append(domEle);
        callpostIntialFunctions(domEle);
        // handleEvents($(".type-detail", domEle));
        count++;
    }
}

function addPostsEventToEventDomPage(type, localUser, posts) {
    let count = $(".post-class").length;
    //console.log("count is ^^^^^^^^^^^^^^^ ", count);
    for (let post of posts) {
        let domEle = addPostToDom(localUser, post, count);
        $("." + type + "-post-container").append(domEle);
        callpostIntialFunctions(domEle);
        // handleEvents($(".type-detail", domEle));
        count++;
    }
}

function addPostToDom(localUser, post, count) {
    let res = `            <div class="post-class  post-some-${post._id}" id="post-${count}">
                <div class="post-header">
                    <a class="post-creator-link" href="/user/profile?user_id=${post.creator._id}" style="text-decoration: none;">
                        <div>
                            <img src="${post.creator.pic}" alt="creator" />
                            <div>
                                <span>${post.creator.name}</span>
                                <span style="font-size: 12; color: lightslategray;padding-left: 5px;">${post.creator.onModel}</span
          >
        </div>
      </div>
                </a>`;
    if (localUser && post.creator._id == localUser._id) {
        res += `    <div class="post-edit-option">
                
        <span
        onClick="handleEditPostOption(event)"
        link="/creator/delete-post?post=${post._id}&type=${
      post.photos ? "Post" : "TextPost"
    }"
        id="${count}"
        >&vellip;</span
      >
      </div>`;
    }
    res += "</div>";
    if (post.eventStartTime) {
        res += `<div  targetId="${post._id}-event" class="type-detail" start="${post.eventStartTime}" end="${post.eventEndTime}" location="${post.venu}" postId="${post._id}">
        <div>  <img height="25px" width="25px" src="/uploads/icons/31.upcoming-event.png" alt="">
      </div>
                            <abbr title="See/Hide Event Detail" >  <img height="25px" width="25px" src="/uploads/icons/13.detail.png" alt="detail">
</abbr>

                            </div>`;
    }
    res += `<div style="padding: 5px; margin: 5px">
                                    <span style="font-size: 15">${post.caption}</span>
                            </div>`;
    if (post.photos) {
        res += ` <div class="post-main-section" postId="${post._id}">


                                    <div id="displayCount-post-${post._id}">1/${post.photos.length}
                                    </div>

                                    <span class="button back" type="back" id="post-${post._id}">&#10094</span>
                                    <span class="button next" type="next" id="post-${post._id}">&#10095</span>
`;
        let i = 0;
        for (let photo of post.photos) {
            //     //console.log(
            //     "phot o ################### ",
            //     i,
            //     " jrhjvf ######### ",
            //     photo
            // );
            res += `<img src="${photo}"  alt="post-pic" class="post-${post._id} post" current_no="${i}" max_no="${post.photos.length}" />
                                            `;

            i = i + 1;
        }
        res += `
                                </div>`;
    }
    if (!post.photos) {
        res += `<div class="main-text-section" postId="<%=post.id%>">
                                            ${post.content}
                                        </div>`;
    }
    res += `
                           <div class="post-footer">
                                                <span>
                <a class="post-like-toggle" postId="${
                  post._id
                }" href="/user/toggle-like?id=${post._id}&type=${
    post.photos ? "Post" : "TextPost"
  }">
                                 <span id="toggle-post-like-span-${post._id}">
                                  `;
    let existLike = false;
    if (localUser) {
        for (lik of post.likes) {
            //console.log("lik is ", lik);
            if (lik.creator && lik.creator._id == localUser._id) {
                existLike = true;
                break;
            }
        }
    }
    if (existLike) {
        res += `                                     <img height="25px" width="25px" src="/uploads/icons/3.liked.png" alt="like" />
`;
    } else {
        res += `        <img src="/uploads/icons/4.not_liked.png" height="25px" width="25px" alt="">
`;
    }
    res += ` 
                                    </span>
                    </a>

                    <span id="post-like-count-${post._id}">${
    post.likes.length
  } likes</span>


                    </span>
                    <span class="comment-button" style="text-align: center"><span onclick="toggleComment('${
                      post._id
                    }','${post.photos ? "Photo" : "Text"}')" >
          <img
            src="/uploads/icons/5.comment_toggle.png"
            alt="comment"
            height="25px"
            width="25px"
          /> </span
        ><span id="comment-length-${post._id}">${
    post.comments.length
  } comments</span></span>

                    <span class="save-toggle-span" id="save-toggle-${
                      post._id
                    }">`;
    let isSave = false;
    if (localUser) {
        for (itm of localUser.saveItems) {
            if (post._id == itm.refItem) {
                isSave = true;
                break;
            }
        }
    }
    res += `
                              <a class="save-toggle-link" id="save-toggle-link-${
                                post._id
                              }" href="/user/toggle-to-save?refId=${
    post._id
  }&type=${post.photos ? "Post" : "TextPost"}"> 
                            `;
    if (isSave) {
        res += `                        <img
          src="/uploads/icons/33.saved.png"
          height="25px"
          width="20px"
          alt=""
      /> `;
    } else {
        res += `<img
          src="/uploads/icons/34.not-saved.png"
          height="25px"
          width="20px"
          alt=""
      /> `;
    }
    res += `</a>         
             </span>
                    </div>
                    <div class="likes-detail" id="likes-detail-${post._id}">`;
    if (post.likes.length > 0) {
        res += ` <div class="first-div"><span style="color: black;">${
      post.likes.length
    } people are liked this post</span> <span><a href="/user/likes?post=${
      post._id
    }&type=${post.photos ? "Post" : "TextPost"}">View All</a></span></div>
                            <div>`;
        for (let i = 0; i < 7 && i < post.likes.length; i++) {
            if (post.likes[i].creator) {
                res += `                                        <img src="${post.likes[i].creator.pic}" alt="pic" height="40px" width="40px" style="border-radius: 50%; padding:0px 7px 0px 7px;">
`;
            }
        }
        res += `
                            </div>`;
    }
    res += `
                        
                    </div>

                    <div class="new-comment">`;
    if (localUser) {
        res += `                            <img src="${localUser.pic}" alt="pic" height="35px" width="35px" style="border-radius: 50%" />
`;
    }
    res += `
                                <form action="/user/add-comment" method="POST" class='some'>
                                    <input type="text" name="comment" required placeholder="Type Your Comment" id="comment-input" />
                                    <input type="hidden" name="postId" value="${
                                      post._id
                                    }">
                                    <input type="hidden" name="type" value="${
                                      post.photos ? "Post" : "TextPost"
                                    }">

                                    <button style="cursor: pointer;">
          <img
            height="20px"
            width="35px"
            src="/uploads/icons/7.send-message.webp"
            alt=""
          />
        </button>
                                </form>
                    </div>

                    <div style="width: 100%; position: absolute; bottom: 0px; display: flex;flex-flow: row-reverse; color:royalblue; font-size: 13;" createdTime="${
                      post.createdAt
                    }" class="created-time">Post created date & time</div>

                    </div>`;
    res += `<div class="comment-container" id="comment-${post._id}">
    <div class="comment-head" id="comment-head-${post._id}">
        ${post.comments.length} Comments
    </div>
    <div class="comments" id="all-comment-${post._id}"></div>
</div>`;
    return $(res);
}

function loadMorePost(itm) {
    //console.log("running @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ");
    let loadLimit = 2;
    // $(itm).click((e) => {
    //     e.preventDefault();
    $(itm).css("backgroundColor", "red");
    let photoTime = $(itm).attr("photoTime");
    let textTime = $(itm).attr("textTime");
    let photo = $(itm).attr("photo");
    let text = $(itm).attr("text");
    //add loader
    let dom_loader = domLoader();
    $(dom_loader).insertAfter(itm);

    let intervalId = addLoader(dom_loader);
    //remove this itm
    $(itm).remove();
    $.ajax({
        type: "GET",
        url: `/load-more-post?photoTime=${photoTime}&textTime=${textTime}&photo=${photo}&text=${text}`,
        success: function(data) {
            //console.log("data is ", data);
            addPostsToDom(data.data.localUser, data.data.posts);
            removeLoader(dom_loader, intervalId);
            //console.log("length of loading ", data.data.posts.length);
            if (data.data.posts.length >= loadLimit) {
                let loadMorePostbtn = loadMorePostButton(
                    data.data.lastPhotoTime,
                    data.data.lastTextTime,
                    data.data.loadMorePhotoPost,
                    data.data.loadMoreTextPost
                );
                $("#post-container").append(loadMorePostbtn);
                handleLoadingPostVisiblity(loadMorePostbtn);
            }
        },
        error: function(xhr, err) {
            removeLoader(dom_loader, intervalId);
            //console.log("err in loading more post is ", xhr.responseJSON.err);
            handleNotification("error", xhr.responseJSON.err);
        },
    });
    // });
}
async function handleLoadingPostVisiblity(btn) {
    // $(btn).css("border", "2px solid yellow");
    //console.log("running ########################## ");
    let inView = await checkIntoView(btn);
    if (inView) loadMorePost(btn);
    $(window).scroll(async() => {
        let inView = await checkIntoView(btn);
        if (inView) loadMorePost(btn);
    });
    $(window).resize(async() => {
        let inView = await checkIntoView(btn);
        if (inView) loadMorePost(btn);
    });
}

//add listener to load more button
function listenerToAddMorePost() {
    $(".load-post").each((i, itm) => {
        handleLoadingPostVisiblity(itm);
    });
}
listenerToAddMorePost();
async function handleLoadingCommentVisiblity(btn) {
    // $(btn).css("border", "2px solid yellow");
    ////console.log("running ########################## ");
    let inView = await checkIntoView(btn);
    if (inView) loadMoreComment(btn);
    $(window).scroll(async() => {
        let inView = await checkIntoView(btn);
        if (inView) loadMoreComment(btn);
    });
    $(window).resize(async() => {
        let inView = await checkIntoView(btn);
        if (inView) loadMoreComment(btn);
    });
}

function listenerToLoadMoreComment() {
    $(".load-comment").each((i, itm) => {
        handleLoadingCommentVisiblity(itm);
        //loadMoreComment(itm);
    });
}

// function loadMorePostButton(lastTime) {
//   //console.log(" time is ", lastTime);
//   return $(
//     `<button class='load-post'  time=${lastTime} >Load More Post</button>`
//   );
// }
listenerToLoadMoreComment();

//handle loading likes of post
function likeNode(like, localUser) {
    let res = `        <div class="like-by">`;
    if (like.creator) {
        res += `
                        <a class="liked-user-link" href="/user/profile?user_id=${like.creator._id}" style="text-decoration: none">
                            <div>
                                <div>
                                    <img src="${like.creator.pic}" alt="image" height="50px" width="50px" style="border-radius: 50%" />
                                </div>
                                <div>
                                    <span>${like.creator.name} </span>
                                    <span style="font-size: 14; color: rgb(129, 121, 121)">${like.creator.onModel}</span
          >
        </div>
      </div>
    </a>
    <div>`;
        if (
            localUser &&
            ((localUser.onModel == "Student" && like.creator.onModel != "Student") ||
                (localUser.onModel != "Student" && like.creator.onModel == "Student"))
        ) {
            if (localUser.related.members.includes(like.creator._id)) {
                res += `<a
        class="request-link"
        href="/user/remove-membership?target=${like.creator._id}"
        ><button>Remove</button></a
      >`;
            } else if (localUser.related.sendRequest.includes(like.creator._id)) {
                res += `      <a
        class="request-link"
        href="/user/withdraw-request?target=${like.creator._id}"
        ><button>Withdraw</button></a
      >
`;
            } else if (localUser.related.comingRequest.includes(like.creator._id)) {
                res += `<a
        class="request-link"
        href="/user/accept-request?target=${like.creator._id}"
        ><button>Accept</button></a
      >
      <a
        class="request-link"
        href="/user/ignore-request?target=${like.creator._id}"
        ><button>Ignore</button></a
      >`;
            } else {
                res += `<a
        class="request-link"
        href="/user/send-request?target=${like.creator._id}"
        ><button>Connect</button></a
      >`;
            }
        }
        res += `
    </div>
    `;
    }
    res += `
  </div>`;
    return $(res);
}

function addLikesToPage(likes, localUser) {
    for (let lik of likes) {
        let likeHtmlNode = likeNode(lik, localUser);
        handleRequests($(".request-link", likeHtmlNode));

        $("#likes-page").append(likeHtmlNode);
    }
}

function addMoreLikes(btn) {
    ////console.log("fn running @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22 ");
    const likeLoadingLimit = 4;
    // $(btn).click((e) => {
    //     e.preventDefault();
    let postId = $(btn).attr("postId");
    let time = $(btn).attr("time");
    ////console.log("postId is ", postId, " time is ", time);
    let type = $(btn).attr("type");
    //add loader
    let dom_loader = domLoader();
    $(dom_loader).insertAfter(btn);
    //remove this btn
    $(btn).remove();
    let intervalId = addLoader(dom_loader);

    $.ajax({
        type: "GET",
        url: `/user/load-more-post-likes?type=${type}&time=${time}&postId=${postId}`,
        success: function(data) {
            //console.log("like added successfully ", data);
            addLikesToPage(data.data.likes, data.data.localUser);
            // //console.log("localuser is ########## ", localUser);
            removeLoader(dom_loader, intervalId);
            if (data.data.likes.length >= likeLoadingLimit) {
                let loadMoreLikeBtn = loadMoreLikeButton(
                    data.data.lastTime,
                    data.data.postId,
                    data.data.type
                );
                $("#likes-page").append(loadMoreLikeBtn);
                handleLoadingLikeVisiblity(loadMoreLikeBtn);
            }
        },
        error: function(xhr, err) {
            //console.log("err in loading likes of post is : ", xhr.responseJSON.err);
            removeLoader(dom_loader, intervalId);
            handleNotification("error", xhr.responseJSON.err);
        },
    });
    // });
}
async function handleLoadingLikeVisiblity(btn) {
    // $(btn).css("border", "2px solid yellow");
    //console.log("running ########################## ");
    let inView = await checkIntoView(btn);
    if (inView) addMoreLikes(btn);
    $(window).scroll(async() => {
        let inView = await checkIntoView(btn);
        if (inView) addMoreLikes(btn);
    });
    $(window).resize(async() => {
        let inView = await checkIntoView(btn);
        if (inView) addMoreLikes(btn);
    });
}

function addListenerToMoreLike() {
    $(".load-like").each((i, btn) => {
        // //console.log("itm added ########## ");
        handleLoadingLikeVisiblity(btn);
        // addMoreLikes(btn);
    });
}
addListenerToMoreLike();

//handle load notices
//add all notices to page
function noticeDom(notice, localUser) {
    let res = `                <div class="notice" id="notice-${notice._id}">
                    <a href="/user/profile?user_id=${notice.creator._id}" style="text-decoration: none; color: black">
                        <div class="head">
                            <div>
                                <img src="${notice.creator.pic}" alt="" height="30px" width="30px" style="border-radius: 50%" />
                            </div>
                            <div style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          ">
                                <span> ${notice.creator.name}</span>
                                <sub> ${notice.creator.onModel}</sub>
                            </div>
                        </div>
                    </a>
                    <div class="caption">
                        ${notice.caption}
                    </div>
                    <div class="content-area">
                        <!-- <img src="https://cdn.slidesharecdn.com/ss_thumbnails/sscnoticepdf-130208033612-phpapp01-thumbnail-4.jpg?cb=1360294651" alt="" height="150px" width="100px" /> -->
                        <img src="${notice.image}" alt="" height="150px" width="120px" />
                    </div>

                    <div class="name">
                        ${notice.originalFileName}
                    </div>
                    <div class="footer">
                        <div>
                            <a id="toggle-notice-like-span-${notice._id}" class="notice-like-link" href="/user/toggle-like?id=${notice._id}&type=Notice">
                                `;
    var existLike = false;
    if (localUser) {
        for (lik of notice.likes) {
            if (lik.creator == localUser._id) {
                existLike = true;
                break;
            }
        }
    }
    if (existLike) {
        res += `                                                                        <img height="25px" width="25px" class="like" alt="like" src="https://cdn-icons-png.flaticon.com/512/833/833472.png" alt="like" />
`;
    } else {
        res += `   <img class="like" alt="like" src="https://cdn-icons-png.flaticon.com/512/151/151910.png" height="25px" width="25px" alt="" />
`;
    }
    res += `
                            </a>
                            <span id="notice-like-count-${notice._id}">${notice.likes.length}</span
        >
      </div>
      <div>
        <a
          class="notice-download-link"
          href="/user/notice-download?notice=${notice._id}"
        >
          <img
            height="25px"
            class="download"
            width="25px"
            src="https://cdn-icons-png.flaticon.com/512/892/892634.png"
            alt="download"
          />
        </a>
        <span>${notice.downloads.length}</span>
                        </div>`;
    if (localUser && notice.creator._id == localUser._id) {
        res += `                <div style="
          height: fit-content;
          width: fit-content;
          padding: 0px;
          margin-top: 0px;
        ">
                                <span class="notice-edit-link" link="/user/delete-by-type?typeId=${notice._id}&type=notice">&vellip;</span
        >
      </div>`;
    }
    res += `
            
    </div>
  </div>`;
    return $(res);
}

function addAllNoticesToPage(notices, localUser) {
    for (let notice of notices) {
        let notice_dom = noticeDom(notice, localUser);
        // //console.log("notice_dom is ", notice_dom);
        handleNoticeLike($(".notice-like-link", notice_dom));
        handleEditOptionByType($(".notice-edit-link", notice_dom), "notice");
        $("#notices").append(notice_dom);
    }
}

function addMoreNotices(btn) {
    ////console.log("fn running @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22 ");
    const noticeLoadingLimit = 1;
    // $(btn).click((e) => {
    //     e.preventDefault();
    let time = $(btn).attr("time");
    // //console.log("noticeId is ", noticeId, " time is ", time);

    //add loader
    let dom_loader = domLoader();
    $(dom_loader).insertAfter(btn);
    //remove this btn
    $(btn).remove();
    let intervalId = addLoader(dom_loader);

    $.ajax({
        type: "GET",
        url: `/load-more-notice?time=${time}`,
        success: function(data) {
            //console.log("notice  loaded successfully ", data);
            addAllNoticesToPage(data.data.notices, data.data.localUser);
            // //console.log("localuser is ########## ", localUser);
            removeLoader(dom_loader, intervalId);
            if (data.data.notices.length >= noticeLoadingLimit) {
                let loadMoreNoticeBtn = loadMoreNoticeButton(data.data.lastTime);
                $("#notices").append(loadMoreNoticeBtn);
                handleLoadingNoticeVisiblity(loadMoreNoticeBtn);
            }
        },
        error: function(xhr, err) {
            //console.log("err in loading notices of post is : ", xhr.responseJSON.err);
            removeLoader(dom_loader, intervalId);
            handleNotification("error", xhr.responseJSON.err);
        },
    });
    // });
}
async function handleLoadingNoticeVisiblity(btn) {
    // $(btn).css("border", "2px solid yellow");
    //console.log("running ########################## ");
    let inView = await checkIntoView(btn);
    if (inView) addMoreNotices(btn);
    $(window).scroll(async() => {
        let inView = await checkIntoView(btn);
        if (inView) addMoreNotices(btn);
    });
    $(window).resize(async() => {
        let inView = await checkIntoView(btn);
        if (inView) addMoreNotices(btn);
    });
}

function addListenerToNoticesLoading() {
    $(".load-notice").each((i, btn) => {
        handleLoadingNoticeVisiblity(btn);
    });
}

addListenerToNoticesLoading();
//handle home event toggle
function eventHomeDom(event) {
    return $(`<div class="event-detail">
                            <div style="background-color: rgb(238, 237, 235)">
                                <div>
                                    <img src="${event.creator.pic}" alt="" height="25px" width="25px" style="border-radius: 50%" />
                                </div>
                                <div style="display: flex; flex-direction: column;align-items: flex-start;">
                                    <span>${event.creator.name}</span>
                                    <span style="color:rgb(26, 25, 25); font-size: 12;padding-left: 0px;">${event.creator.onModel}</span>

                                </div>
                            </div>
                            <a href="/user/events">
                                <div class="event-type">
                                    <div>
                                        <img height="25px" width="25px"  src="/uploads/icons/31.upcoming-event.png"  alt="" />
                                        <span style="color: hsl(93, 100%, 49%)" class="event-head" startTime="${event.eventStartTime}">Upcoming Event</span
            >
          </div>
          <abbr title="See Event Detail">
            <img
              height="25px"
              width="25px"
              src="/uploads/icons/13.detail.png"
              alt="detail"
            />
          </abbr>
        </div>
      </a>
      <div style="position: relative">
        <img src="${event.photos[0]}" alt="" height="150px" width="50%" style="margin:auto;" />
        <abbr title="event have more photos"
          ><img
            height="25px"
            width="25px"
            style="position: absolute; right: 3px; top: 3px"
            src="/uploads/icons/25.more-images.png"
            alt="more-photo"
        /></abbr>
      </div>
        <div style="font-size: 14; color: black; margin-top: 5px;">
                                ${event.caption}
                            </div>
      <div
        style="
          font-size: 14;
          color: rgb(54, 53, 53);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div>
           

                                </div>

                                <div class="event-time" style="font-size: 13; color: rgb(37, 190, 241)" timing="${event.eventStartTime}">
                                    Date and Time of Event
                                </div>
                            </div>
                          
                    </div>`);
}

function addAllUpcomingHome(container, events) {
    for (let event of events) {
        //console.log("event is ", event);
        let eventDom = eventHomeDom(event.postRef);
        handleEventHeadText($(".event-head", eventDom));
        setEventDate($(".event-time", eventDom));
        $(container).append(eventDom);
    }
}

function toggleEventsVisibality(id_name) {
    let obj = document.querySelector("#" + id_name);
    let currentMaxHeight = getComputedStyle(obj).maxHeight;
    // //console.log("off-set-height is ", obj.offsetHeight);
    obj.style.maxHeight = currentMaxHeight != "0px" ? "0px" : "600px";

    // let newStyle = currentStyle === "none" ? "block" : "none";
    // //console.log("newStyle ", newStyle, "  prev Style ", currentStyle);
    // obj.style.display = newStyle;
    let arrowUp = document.getElementById("arrow-up");
    // let arrowDown = document.getElementById("arrow-down");
    // arrowDown.style.display = obj.style.maxHeight != "0px" ? "inline" : "none";
    arrowUp.style.transform =
        obj.style.maxHeight == "0px" ?
        "rotate3d(1,0,0,0deg)" :
        "rotate3d(1,0,0,180deg)";
    if (obj.style.maxHeight == "0px") {
        return;
    }
    let container = $("#all_event");
    $(container).html("");
    let dom_loader = domLoader();
    $(container).append(dom_loader);

    let intervalId = addLoader(dom_loader);
    $.ajax({
        type: "GET",
        url: `/load-upcoming-or-running-events?time=${Date.now()}`,
        success: function(data) {
            removeLoader(dom_loader, intervalId);
            $(container).html("");
            if (data.data.events.length > 0)
                addAllUpcomingHome(container, data.data.events);
            else
                $(container).append(`<div style="
        border-top: 1px solid black;
        color: tomato;
        text-align: center;
        padding: 10px;
        margin: 15px;
      ">
                    No Upcoming or Runnning Event
                </div>`);
            //console.log("data is ", data);
        },
        error: function(xhr, err) {
            //     //console.log(
            //     "err in loading current or upcoming events  is : ",
            //     xhr.responseJSON.err
            // );
            removeLoader(dom_loader, intervalId);
            handleNotification("error", xhr.responseJSON.err);
        },
    });
}

//handle loading  event on  event page
function MakeEventPageLoadBtn(time, type) {
    return $(
        ` <button time="${time}" type="${type}" class="load-event load-on-demand">Load more ${type}</button>`
    );
}

function noEventFind(type) {
    return $(
        `<div class="no-event-box">${
      type == "upcoming"
        ? "No Upcoming or Current Event Found"
        : "No Passed Event Found"
    }</div>`
    );
}
async function handleLoadingEventVisiblity(btn) {
    // $(btn).css("border", "2px solid yellow");
    //console.log("running ########################## ");
    let inView = await checkIntoView(btn);
    if (inView) {
        handleLoadingEvent(btn);
    }
    $(window).scroll(async() => {
        let inView = await checkIntoView(btn);
        if (inView) {
            handleLoadingEvent(btn);
        }
    });
    $(window).resize(async() => {
        let inView = await checkIntoView(btn);
        if (inView) {
            handleLoadingEvent(btn);
        }
    });
    //  //console.log("btn is ");
}

async function handleLoadingEvent(btn) {
    let time = $(btn).attr("time");
    let type = $(btn).attr("type");
    const loadLimit = 2;
    // //console.log("callling @@@@@@@@@@@@@@@@@@@@@@@@@@@@@ hhhhhhhhhhhhhhhhhhhhhh ");
    //       e.preventDefault();
    let dom_loader = domLoader();
    let container = $("#" + type);
    $(container).append(dom_loader);

    let intervalId = addLoader(dom_loader);
    //let type = $(btn).attr("type");
    $(btn).remove();
    await $.ajax({
        type: "GET",
        url: `/user/load-event-for-event-page?type=${type}&time=${time}`,
        success: async function(data) {
            // await $(btn).remove();
            removeLoader(dom_loader, intervalId);
            //console.log("data is ", data);
            // addPostsToDom(localUser, data.data.events);
            addPostsEventToEventDomPage(type, data.data.localUser, data.data.events);

            let targetContainer = $("." + type + "-post-container");
            if (data.data.events.length >= loadLimit) {
                let newBtn = MakeEventPageLoadBtn(data.data.lastTime, type);
                $(targetContainer).append(newBtn);
                handleLoadingEventVisiblity(newBtn);
            } else {
                let noOfChildren = $(targetContainer).children().length;
                // //console.log("no of childrens are @@@@@@@@@@@@@22 ", noOfChildren);
                if (noOfChildren == 0) {
                    $(targetContainer).append(noEventFind(type));
                }
            }
            // handleNotification("success", data.message);
        },
        error: function(xhr, err) {
            //console.log("err in loading  events  is : ", xhr.responseJSON.err);
            removeLoader(dom_loader, intervalId);
            handleNotification("error", xhr.responseJSON.err);
        },
    });
}

function handleFullEventLoading() {
    //console.log("length is ######### ", $(".load-event").length);
    $(".load-event").each((i, itm) => {
        handleLoadingEventVisiblity(itm);
    });
}

handleFullEventLoading();

//toggleComment
async function checkIntoView(btn) {
    //  //console.log("btn type @@@@@@@@@@@@@@@@@ ^^^^^^ ", $(btn).attr("type"));
    let rect = $(btn).get(0).getBoundingClientRect();
    ////console.log("rect is ", rect);
    //$($(".auto-load")[0]).css("border", "5px solid yellow");
    // //console.log("inner height is ", document.documentElement.clientHeight);
    //window.innerHeight is viewport height without scrollbar including
    if (rect.bottom > 0 && rect.top < window.innerHeight) return true;
    return false;
}

// function handleAllAutoLoadBtn() {
//     // $(".auto-load").each((i, itm) => {
//     let rect = $(".auto-load")[0].getBoundingClientRect();
//     //console.log("rect is ", rect);
//     $($(".auto-load")[0]).css("border", "5px solid yellow");
//     //console.log("inner height is ", document.documentElement.clientHeight);

//     if (
//         rect.bottom > 0 &&
//         rect.top < $(window).innerHeight() &&
//         rect.top > -rect.height
//     ) {
//         //console.log("yes in view ############## ");
//     }
//     // });
// }
// $(window).resize((e) => {
//     //console.log("resizing @@@@@@@@@@@@@@@@@ ");
//     handleAllAutoLoadBtn();
// });
// $(window).scroll((e) => {
//     //console.log("scrolling @@@@@@@@@@@@@@@@@ ");
//     handleAllAutoLoadBtn();
// });

//handle request for new creator acc.
function handleNewCreatorRequest(form) {
    $(form).submit((e) => {
        e.preventDefault();
        // //console.log("itm is ", itm);
        let dom_loader = domLoader();
        dom_loader.insertAfter($(form));
        let intervalId = addLoader(dom_loader);
        // //console.log("interval is ", intervalId);
        $(form).toggleClass(" disable_btn_without_back");
        $("button", form).toggleClass(" disable_btn");
        $.ajax({
            type: "POST",
            url: $(form).prop("action"),
            data: $(form).serialize(),
            success: function(data) {
                //console.log("data is ", data.data);
                // form.reset();
                $(form).trigger("reset");
                handleNotification("success", data.message);
                removeLoader(dom_loader, intervalId);
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
            },
            error: function(xhr, textStatus, message) {
                removeLoader(dom_loader, intervalId);
                $(form).toggleClass(" disable_btn_without_back");
                $("button", form).toggleClass(" disable_btn");
                if (xhr.status == 401) {
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page
                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);
                    return;
                }
                if (textStatus == "timeout") {
                    handleNotification("error", "Request " + message);
                } else handleNotification("error", xhr.responseJSON.err);
                //  $(form).trigger("reset");
            },
            timeout: 10000,
        });
    });
}

handleNewCreatorRequest($("#new-creator-request-form"));

//handle creator page handling

function handleActiveCreatorPage() {
    $("#request-new-creator-account-container").toggleClass(" active_display");
}

function disappearCreatorRequestPage() {
    $("#request-new-creator-account-container").removeClass(" active_display");
}

//handle post like using double click
function likeImg() {
    return $(`
<span style=" background-color: transparent; margin: auto;position: absolute; top:50%; left:50%; transform:translate(-50%,-50%); height:50px; width:50px; overflow:hidden; transition:0.2s linear;">
                                       <img src="/uploads/icons/3.liked.png" height="inherit" style="display:block" width="inherit" alt="like">
                                    </span>`);
}

function displayLikeImg(post) {
    let image = likeImg();
    $(post).append(image);
    setTimeout(() => {
        $(image).css("height", "220px");
        $(image).css("width", "220px");
    }, 30);
    setTimeout(() => {
        $(image).css("height", "90px");
        $(image).css("width", "90px");
    }, 170);
    setTimeout(() => {
        $(image).remove();
    }, 1000);
}

function handlePostLikeUsingDoubleClick(post, type) {
    $(post).dblclick((e) => {
        let postId = $(post).attr("postId");
        displayLikeImg(post);
        console.log("double click @@@@2222 %%%%% ");
        let toggle = $(`#toggle-post-like-span-${postId}`);
        toggle.html("");
        toggle.html(`<img
                  src="/uploads/icons/3.liked.png"
                  alt="yes likes"
                  height="25px"
                  width="25px"
                 style='color:red;'
                />`);

        $.ajax({
            type: "Get",
            url: "/user/add-post-like/" + postId,
            success: function(data) {
                console.log("double click success response !!!!!!!!! ", data);
                if (data.data.prevLike) return;
                let post = data.data.post;
                handleLikeIconAndCount(post, true, "post");
                let bar = $(`#likes-detail-${post._id}`);
                bar.html("");
                if (post.likes.length > 0) {
                    bar.append(addLikesUserBar(post));
                }

                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("in !!!!!!!!!!!!!!!!!!!!!!!!!!!!11 ");
                    //console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                //console.log("err is ", err.responseText);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function addListenerToDoubleClickLike() {
    $(".post-main-section").each((i, itm) => {
        handlePostLikeUsingDoubleClick(itm, "Post");
    });
    // $(".main-text-section").each((i, itm) => {
    //     handlePostLikeUsingDoubleClick(itm, "TextPost");
    // });
}
addListenerToDoubleClickLike();