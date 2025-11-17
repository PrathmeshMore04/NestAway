const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
// const upload = multer({ dest: 'uploads/' });

// Index Route
// Create Route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    // .post(isLoggedIn, upload.single("listing[image]") , validateListing , wrapAsync(listingController.createListing));
    .post( 
    isLoggedIn,
    
    // 1. Add a tiny middleware to log "Upload Starting"
    (req, res, next) => {
        console.log("1. Received POST request. Starting upload...");
        next();
    },
    
    upload.single("listing[image]"), 
    
    // 2. Add a log after upload
    (req, res, next) => {
        console.log("2. Upload finished! File info:", req.file);
        next();
    },
    
    validateListing, 
    wrapAsync(listingController.createListing)
);
// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show Route 
// Update Route
// Delete Route
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;