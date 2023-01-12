const jwt = require('jsonwebtoken')
const User = require('../models/User')
exports.isAuthenticated = async(req,res,next)=>{
    const token = req.cookies.token

    if(!token){
        res.status(401).json({
            message:'you are not authorized user'
        })
    }
    const decoded = await jwt.verify(token,process.env.JWT_SEC_KEY)
    req.user = await User.findById(decoded._id)
    next()
}