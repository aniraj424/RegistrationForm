const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/targetneet")
.then(()=>{
    console.log(`connection successfull...`);
}).catch((err)=>{
    console.log(err);
})