const jwt = require("jsonwebtoken");
const Registration = require("../model/registration");

const auth = async(req,res,next)=>{
    try {
       const token = req.cookies.jwt;
       const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
       const user = await Registration.findOne({_id:verifyUser._id});
       req.token = token;
       req.user = user;
       next();
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports = auth;