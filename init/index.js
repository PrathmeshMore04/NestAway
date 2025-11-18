const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main();

async function main(){
    mongoose.connect("mongodb://127.0.0.1:27017/abode");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map(obj => ({...obj, owner : '69174bb25c23b613eef07d52'}));
    await Listing.insertMany(initData.data);
};

initDB();