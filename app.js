if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const path = require("path");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const expressError = require("./utils/expressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");

const session = require("express-session");

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const userRouter = require("./routes/user.js"); 

const MongoStore = require("connect-mongo");
let dbUrl = process.env.ATLASDB_URL;

main();

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, 
});

store.on("error", () => {
    console.log("Error in Mongo Session, ", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // In milli seconds days*hours*minutes*seconds*milliseconds
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }

};

app.use(session(sessionOptions));
app.use(flash());

// Authentication
app.use(passport.initialize()); // Only after session middleware is written 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser" , async (req , res) => {
//     let fakeUser = new User({
//         email : "demo0@gmail.com",
//         username : "demoUser",
//     });

//     let registeredUser = await User.register(fakeUser , "fakePass");
//     res.send(registeredUser);

// });

app.listen(8080);

// app.get("/" , (req , res) => {
//     res.send("<h1>Welcome to Abode!</h1>")
// });

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

// app.get("/testListing" , async (req , res) => {
//     let sampleListing = new Listing({
//         title: "My Home",
//         description: "Non furnished house.",
//         price: 10000,
//         location: "Dnyaneshwar Apartment, Kharalwadi",
//         country: "India",
//     });
//     await sampleListing.save();
//     res.send("Success!");
// });

app.use((req , res , next) => {
    next(new expressError(404 , "Page Not Found"));
});

app.use((err , req , res , next) => {
    let {status = 500, message = "Something went wrong!"} = err;
    res.status(status).render("error.ejs" , {err});
});