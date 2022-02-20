//request which need not to authenticate
const express = require("express");
const passport = require("passport");
const router = express.Router();

console.log("running g                ggggggggggggg    ");
const open_controller = require("../controller/open_controller");

const middleware = require("../config/middleware");
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/sign-in" }),
    open_controller.createSession
);
router.post(
    "/sign-up-with-secret",
    // middleware.passwordCheck,
    open_controller.signUpWithSecret
);
router.post(
    "/update-password-with-secret",
    // middleware.passwordCheck,
    open_controller.updatePasswordWithSecret
);

router.get(
    "/resend-sign-up-otp-email/",

    middleware.resendMail,
    open_controller.resendOtpMailForSignUp
);
router.get(
    "/resend-forgot-password-otp-email/",

    middleware.resendMail,
    open_controller.resendOtpMailForForgotPassword
);

router.post(
    "/sign-up-send-otp",
    middleware.checkOtpRequest,
    open_controller.signUpOtp
);
router.post(
    "/forgot-password-send-otp",
    middleware.checkOtpRequest,
    open_controller.forgotPasswordOtp
);
router.post(
    "/sign-up-email-verification",
    middleware.emailVerification,
    open_controller.signupEmailVerification
);
router.get(
    "/sign-up-page-using-link/",
    middleware.checkValidSignUpLink,
    open_controller.signUpPageForLink
);
router.post(
    "/forgot-password-email-verification",
    middleware.emailVerification,
    open_controller.forgotPasswordEmailVerification
);

router.get(
    "/set-new-password-using-link/",
    middleware.checkValidSetNewPasswordUpLink,
    open_controller.setNewPasswordPageForLink
);
router.get("/sign-up", open_controller.signUp);
router.get("/sign-in", open_controller.signIn);
router.post("/create", open_controller.create);
router.post(
    "/create-session",
    passport.authenticate("local", { failureRedirect: "/sign-in" }),
    open_controller.createSession
);

router.get("/", open_controller.homePage);
router.get("/options/", open_controller.findOptions);
router.post("/search", middleware.checkValidSearchReq, open_controller.search);
router.post(
    "/search_students",
    middleware.checkValidSearchReq,
    open_controller.searchStudents
);
router.get("/notices", open_controller.notices);
router.get("/home-option-page/", open_controller.homeOptionPage);
router.get("/post-for-location/", open_controller.postForLocation);
router.get("/get-comments-of-post/", open_controller.commentsOfPost);
router.get(
    "/load-more-comments-of-post",
    open_controller.loadMoreCommentOfPost
);
router.get("/load-more-post/", open_controller.loadMorePost);
router.get("/load-more-notice/", open_controller.loadMoreNotices);
router.get(
    "/load-upcoming-or-running-events/",
    open_controller.loadUpcomingOrRunningEvents
);
router.get(
    "/activate-creator-account-page-link/",
    open_controller.ActivateCreatorAccountUsingSecretPage
);
router.post(
    "/activate-creator-account-using-secret",
    open_controller.ActivateCreatorAccountUsingSecret
);
module.exports = router;