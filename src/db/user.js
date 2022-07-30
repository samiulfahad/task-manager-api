const mongoose = require('mongoose');
try{
    mongoose.connect(process.env.MongoDB_URL)
} catch(e){
    mongoose.connect(process.env.MongoDB_URL)
}
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        default: 'User',
        validate(value) {
            if(value.length === 0){
                throw new Error("Name should not be Empty")
            }
        }
    },
    mobile_number:{
        type: Number,
        trim: true,
        //required: [true, "11 digit Phone number is required"],
        // unique: true,
        min: [1000000000, 'Min Error Enter a 11 digit phone number'],
        max: [10000000000, 'Max error Enter a 11 digit phone number'],
    },
    email:{
        type: String,
        required: [true, "Email Address is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [isEmail, 'Enter a valid email address']
        // validate:[(val)=>val.length >=8, 'Password Must be 8 character long']
    },
    password:{
        type: String,
        required: [true, "8 Character Password is required"],
        minlength: [8, 'Password Must be 8 character long'],
    },
    avatar: {
        type: Buffer
    },
    tokens:[{
        type: String,
        required: true
    }]
}, {
    timestamps: true
})

// Adding a virtual property (Link two databases)
userSchema.virtual('tasks', {
    ref:'Task',
    localField: '_id',
    foreignField: 'owner'
})
// Run a function before 'save' event in userSchema
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        const hashedPass = await bcrypt.hash(user.password, 8)
        user.password = hashedPass
    }
    next()
});

// Run a function after 'remove' event in userSchema
userSchema.post('remove', async function(){
    const _id = this._id
    await Task.deleteMany({owner: _id})
})
// Login Function on userSchema
userSchema.statics.login = async (email, password) => {
   try{
    const user = await User.findOne({email})
    if(!user){
        return { error: 'Login Criteria did not match'}
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return { error: 'Login Criteria did not match'}
    }
    return user

   } catch(e){
       throw new Error({error: "Internal Server error"})
   }
}

// Generate Token for a user
userSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
    user.tokens.push(token)
    try{
        await user.save()
        return token
    } catch(e){
        throw Error({error: 'JWT Token error '})
    }
}

// Hide Private Data
userSchema.methods.toJSON = function(){
    let userObj = this.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}
const User = mongoose.model('User', userSchema)
module.exports = User