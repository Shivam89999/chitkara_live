// console.log("ajax script loaded &&&&&&&&&&&&&& ******************* ");
// //add new comment using ajax
// let handleAddnewComment = function() {
//     console.log("add comment running");
//     // e.preventDefault();
//     console.log("dff && ", $(".some"));
//     document.querySelectorAll(".some_spex").forEach((form) => {
//         console.log("form is ", form);

//         form.submit(function(e) {
//             e.preventDefault();
//             console.log("serialize %% ", form[0].serialize());
//         });
//     });

//     // console.log("e is ", e.target.serialize());
//     // $.ajax({
//     //     type: "POST",
//     //     url: e.target.getAttribute("action"),
//     //     data: form.serialize(),
//     //     success: function(data) {
//     //         console.log("data is ", data.data);
//     //     },
//     //     error: function(err) {
//     //         console.log("err is ", err.responseText());
//     //     },
//     // });
// };

// handleAddnewComment();

// console.log("hhjv ", $('.some'));
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
        console.log("empty notification not allowed");
        return;
    }
    if (!allowedNotificationType.includes(type)) {
        console.log("given type is not allowed ", type);
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

function addNewComment() {
    document.querySelectorAll(".some").forEach((itm) => {
        // console.log("itm is ***** ", itm);
        itm.addEventListener("submit", function(e) {
            console.log("e is ", e);
            e.preventDefault();

            console.log("itm is ", $(itm).prop("action"));
            $.ajax({
                type: "POST",
                url: $(itm).prop("action"),
                data: $(itm).serialize(),
                success: function(data) {
                    console.log("data is ", data.data);
                    let domComment = addNewCommentToDOM(
                        data.data.comment,
                        data.data.post
                    );

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
                    $(`#comment-${data.data.post._id}`).show();
                    handleNotification("success", data.message);
                    itm.reset();
                },
                error: function(xhr, err) {
                    if (xhr.status == 401) {
                        console.log("redirect to login");
                        handleNotification("error", "Unauthorized, Sign-In first");
                        //redirect to login-page

                        setTimeout(function() {
                            window.location.href = "/sign-in";
                        }, 600);

                        return;
                    }
                    handleNotification("error", xhr.responseJSON.err);
                    console.log("err is ^^^^^^^^^ ", xhr.responseJSON.err);
                    itm.reset();
                },
            });
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
                                <span>${comment.content}</span>
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
                  src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
                  alt="yes likes"
                  height="25px"
                  width="25px"
                 style='color:red;'
                />`);
    } else {
        toggle.html(`<img
                  src="https://cdn-icons-png.flaticon.com/512/151/151910.png"
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
    //  console.log("toggle comment like &&&&&&&&&&&&&&&&&&&&&&&&& &&&&&&&&&&&&&&");
    $(toggleLikeOfComment).click(function(e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: $(toggleLikeOfComment).prop("href"),
            success: function(data) {
                console.log("data is ", data);
                let comment = data.data.comment;
                handleLikeIconAndCount(
                    comment,
                    data.data.like ? true : false,
                    "comment"
                );
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is ", err.responseText);
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
    for (let i = 0; i < 8 && i < post.likes.length; i++) {
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
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is ", err.responseText);
                handleNotification("error", xhr.responseJSON.err);
            },
            // statusCode: {
            //     401: function(res, textStatus, xhr) {
            //         console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            //         console.log(
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
          src="https://cdn-icons.flaticon.com/png/512/5668/premium/5668020.png?token=exp=1643138956~hmac=7d0502f20d08da1260c26cf955f23cc2"
          height="25px"
          width="20px"
          alt=""
      />`);
    } else {
        return $(`<img
          src="https://cdn-icons-png.flaticon.com/512/84/84510.png"
          height="25px"
          width="20px"
          alt=""
      />`);
    }
}

function handleToggleSave(saveToggle) {
    $(saveToggle).click((e) => {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: $(saveToggle).prop("href"),
            success: function(data) {
                console.log("data is ", data);
                let parent = $(`#save-toggle-link-${data.data.target._id}`);
                parent.html("");
                parent.append(handleSaveImgDisplay(data.data.state ? true : false));
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                console.log("err is ", err.responseText);
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
        $.ajax({
            type: "GET",
            url: $(deleteCommentLink).prop("href"),
            success: function(data) {
                console.log("data is ", data);
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
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is", xhr.responseJSON.err);
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
    console.log("targte ele is ", ele);
    // let id = ele.getAttribute("id");
    // console.log("event.target is ", ele);
    // console.log("comment id is *************** ", id);

    let D = document.createElement("div");
    // D.id = classs + "-" + id;
    D.className = classs;
    D.className += " clickDisappear";

    let addr = ele.getAttribute("link");
    var link = document.createElement("a");
    link.innerHTML =
        "<img src='https://cdn-icons.flaticon.com/png/512/2907/premium/2907762.png?token=exp=1643364990~hmac=eb42056d272d1ecab1288e1eb07e9bbe' alt='delete' height='30px' width='22px' />";
    link.href = addr;
    // link.id = id;
    link.className = "delete-comment-link";
    D.appendChild(link);
    console.log("D is ", D);
    console.log("paren t ************** ", ele.parentNode.parentNode);
    ele.parentNode.parentNode.parentNode.appendChild(D);
    deleteComment($(link));
}

function handleEditPostOption(event) {
    let classs = "toUpdate";

    let ele = event.target;

    let id = parseInt(ele.getAttribute("id"));
    // console.log("event.target is ", ele);
    // console.log("id is *************** ", id);

    let D = document.createElement("div");
    D.id = classs + "-" + id;
    D.className = classs;
    D.className += " clickDisappear";

    let addr = ele.getAttribute("link");
    var link = document.createElement("a");

    link.innerHTML =
        "<img src='https://cdn-icons.flaticon.com/png/512/2907/premium/2907762.png?token=exp=1643364990~hmac=eb42056d272d1ecab1288e1eb07e9bbe' alt='delete' style='padding-left:5px;padding-top:4px;' height='30px' width='22px' />";
    link.href = addr;
    link.id = id;
    link.className = "delete-post-link";
    D.appendChild(link);
    console.log("D is ", D);
    console.log("to add is ");
    // // console.log("D is &&&&&&&&&&&&&&&&&&&&&&& ", D);
    // console.log("mrfn  ", document.getElementsByClassName("day-menu"));
    document.getElementById("post-" + id).appendChild(D);
    deletePost($(link));
}

function deletePost(deletePostLink) {
    $(deletePostLink).click((e) => {
        e.preventDefault();
        let id = $(deletePostLink).prop("id");
        $.ajax({
            type: "GET",
            url: $(deletePostLink).prop("href"),
            success: function(data) {
                console.log("data is ", data);
                $(`#post-${id}`).remove();
                console.log("data postId ", data.data.postId);
                $(`#comment-${data.data.postId}`).remove();
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                console.log("err is ", xhr.responseJSON.err);
            },
        });
    });
}

function handleDeletePost() {
    $(".delete-post-link").each((deletePostLink) => {
        console.log("delete post links are ", deletePostLink);
        deletePost(deletePostLink);
    });
}
handleDeletePost();
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
         
          <input type="radio" name="tick" value="Student" checked />
          <span>Student</span>
          <input type="radio" name="tick" value="Staff" />
          <span>Staff</span>
          <input type="radio" name="tick" value="Club" />
          <span>Club</span>
          <input type="radio" name="tick" value="Hostel" />
          <span>Hostel</span>

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
        console.log("some %%%%%%%%%%%%%%%%%%% 00");
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
        $.ajax({
            method: "POST",
            url: form.prop("action"),
            data: form.serialize(),
            success: function(data) {
                console.log("message is ", data);
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
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);

                console.log("err is ", xhr.responseJSON.err);
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
    console.log("intialdataform is ", intialDataForm);
    intialDataForm.submit((e) => {
        e.preventDefault();

        $.ajax({
            method: "POST",
            url: intialDataForm.prop("action"),
            data: intialDataForm.serialize(),
            success: function(data) {
                console.log("data is ", data.message);
                showSignInPage();
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                console.log("err is ", xhr.responseJSON.err);
            },
        });
    });
}

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
        $.ajax({
            method: "POST",
            url: emailVerificationForm.prop("action"),
            data: emailVerificationForm.serialize(),
            success: function(data) {
                console.log("data is ", data.message);
                let secret = data.data.secret;
                if (data.data.type == "signUp") {
                    show_SignUp_intial_dataForm(secret);
                } else if (data.data.type == "forgotPassword") {
                    show_Set_Password_Form(secret);
                }
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                console.log("error is ", err.responseText);
            },
        });
    });
}

function getOtpForSignUp(form) {
    form.submit((e) => {
        e.preventDefault();
        $.ajax({
            method: "POST",
            url: form.prop("action"),
            data: form.serialize(),
            success: function(data) {
                console.log("message is ", data.message);
                show_sign_up_email_verification_page(data.data.email);
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                console.log("err is ", xhr.responseJSON.err);
            },
        });
    });
}

function otp_resend_option(link) {
    link.click(function(e) {
        e.preventDefault();
        $.ajax({
            method: "GET",
            url: link.prop("href"),
            success: function(data) {
                console.log("message is ", data.message);
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                handleNotification("error", xhr.responseJSON.err);
                console.log("err is ", xhr.responseJSON.err);
            },
        });
    });
}

//******* handle notice actions  **********

function handleNoticeLike(link) {
    $(link).click((e) => {
        e.preventDefault();
        console.log("href is ^^^^^^^ ", $(link).prop("href"));
        $.ajax({
            type: "GET",
            url: $(link).prop("href"),
            success: function(data) {
                console.log("data is ", data.data.notice._id);
                let notice = data.data.notice;
                handleLikeIconAndCount(notice, data.data.like ? true : false, "notice");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is ", xhr.responseText);
                handleNotification("error", xhr.responseJSON.err);
            },
        });
    });
}

function handleNotices() {
    console.log("handle notices running ");
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
        console.log("prevent by me ^^^^^^^^^^ ");
        $.ajax({
            type: "GET",
            url: $(typeDeleteLink).prop("href"),
            success: function(data) {
                console.log("req successfull, message is ", data.message);
                $(typeDeleteLink).toggleClass(" disable_btn_without_back");
                console.log("data is ", data.data);
                const typeId = data.data.typeId;
                const type = data.data.type;
                console.log("^^^^^^^^^^^^^^ ", $(`#${type}-${typeId}`));
                $(`#${type}-${typeId}`).remove();
                let Container = $(`#${type}s`);
                console.log("dc ^^^ ", $(Container).children().length);
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
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is ", xhr.responseJSON.err);
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
        console.log("targte ele is ", ele);
        // let id = ele.getAttribute("id");
        // console.log("event.target is ", ele);
        // console.log("comment id is *************** ", id);

        let D = document.createElement("div");
        // D.id = classs + "-" + id;
        D.className = classs;
        D.className += " clickDisappear";

        let addr = ele.getAttribute("link");
        var link = document.createElement("a");
        link.innerHTML =
            "<img src='https://cdn-icons.flaticon.com/png/512/2907/premium/2907762.png?token=exp=1643364990~hmac=eb42056d272d1ecab1288e1eb07e9bbe' alt='delete' height='39px' width='31px' />";
        link.href = addr;
        // link.id = id;
        // link.className = "delete-comment-link";
        D.appendChild(link);
        console.log("D is ", D);
        console.log("paren t ************** ", ele.parentNode.parentNode);
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
        console.log("handle poll deletion: ", itm);
        handleEditOptionByType(itm, "poll");
    });

    $(".alert-edit-link").each((i, itm) => {
        console.log("handle alert deletion: ", itm);
        handleEditOptionByType(itm, "alert");
    });
    $(".notice-edit-link").each((i, itm) => {
        console.log("handle notice deletion");
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
                // console.log("pollId is ", pollId);
                let yes_voting = $(`#yes-voting-${pollId}`);
                let no_voting = $(`#no-voting-${pollId}`);
                let pollVoteLength = $(`#poll-votes-length-${pollId}`);
                $(yes_voting).css("pointer-events", "none");
                $(no_voting).css("pointer-events", "none");
                // console.log("cddd^^^^^ ", $(".yes-option", yes_voting));
                $(".yes-option", yes_voting).text(data.data.yesPercent + "%");
                $(".no-option", no_voting).text(data.data.noPercent + "%");

                if (pollVoteLength.length > 0) {
                    console.log("running ^^^^^^^^^^^^^^^^^^ ");
                    $(pollVoteLength).text(data.data.totalVotes + " votes");
                }
                $(itm).parent().toggleClass(" disable_btn");
                handleNotification("success", data.message);
            },
            error: function(xhr, err) {
                $(itm).parent().toggleClass(" disable_btn");
                if (xhr.status == 401) {
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page

                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is ", xhr.responseJSON.err);
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
                console.log("data is ", data.message);
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
                    console.log("redirect to login");
                    handleNotification("error", "Unauthorized, Sign-In first");
                    //redirect to login-page
                    setTimeout(function() {
                        window.location.href = "/sign-in";
                    }, 600);

                    return;
                }
                console.log("err is ", xhr.responseJSON.err);

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