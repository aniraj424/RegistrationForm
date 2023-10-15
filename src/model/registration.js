const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const studentSchema = mongoose.Schema({
    firstname : {
        type:String,
        require:true
    },
    lastname : {
        type:String,
        require:true
    },
    mothername : {
        type:String,
        require:true
    },
    fathername : {
        type:String,
        require:true
    },
    addess : {
        type:String,
        require:true
    },
    gender : {
        type:String,
        require:true
    },
    dob : {
        type:Date,
        require:true
    },
    phone : {
        type:Number,
        require:true,
        unique:true
    },
    pincode : {
        type:Number,
        require:true,
    },
    course : {
        type:String,
        require:true
    },
    email : {
        type:String,
        require:true,
        unique:true
    },
    password : {
        type:String,
        require:true
    },
    cpassword : {
        type:String,
        require:true
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
})

//Generating token 
studentSchema.methods.generateAuthToken = async function(){
    try {
       const token = await jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY) ;
       this.tokens = this.tokens.concat({token:token});
       await this.save();
       return token;
    } catch (error) {
        console.log(error);
    }
}

//Encrypting code before save into database
studentSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);  
        //don't need to store confirm password into database
        this.cpassword = undefined;     
    }
    next();
})

const Registration = new mongoose.model("Registration",studentSchema)
module.exports = Registration;