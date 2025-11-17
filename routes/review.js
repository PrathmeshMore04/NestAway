const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Create Route
router.post("/" , isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Route
router.delete("/:reviewId" , isLoggedIn , isReviewAuthor , wrapAsync(reviewController.destroyReview));

module.exports = router;