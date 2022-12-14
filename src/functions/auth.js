const jwt = require('jsonwebtoken')
const User = require('../db/user')
const auth = async(req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id})
        if(!user){
            throw new Error()
        }
        const isExistingToken = user.tokens.includes(token);
        if(!isExistingToken){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch(e){
        res.status(400).send({error: "Please Login First to access this protected route"})
    }
}
module.exports = auth