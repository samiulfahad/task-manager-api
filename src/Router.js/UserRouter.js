const express = require('express');
const User = require('../db/user')
const multer = require ('multer')
const sharp = require('sharp')
const {userCheckPost, userFields} = require('../functions/user_task_checkpost')
const sendMail = require('../functions/nodeMailer')
const auth = require('../functions/auth')
const router = express.Router();

//Create a user
router.post('/signup', async(req, res)=>{
    if(!userCheckPost(req)){
        return res.status(406).send({error: `Enter Valid Fields Only => ${userFields}`});
    }
    const user = new User(req.body);
    try{
        await user.save()
        sendMail(user.email, user.name, 'Welcome to Task Manager', '<h3>Congratulation!!!!</h3><p1>Your account has been created successfully. You can add and manage your task from your profile</p1>')
        const token = await user.generateToken()
        res.status(201).send({user, token})
    } catch(e){
        if(e.code===11000) {
           return res.status(400).send({error: `This ${Object.keys(e.keyPattern)[0]} has already been taken`})
        }
        res.status(400).send({error: e})
    }
})

//Login
router.post('/login', async(req, res)=>{
    try{
        const user = await User.login(req.body.email, req.body.password)
        if(user.error){
            return res.status(404).send(user)
        }
        const token = await user.generateToken()
        res.status(200).send({user, token})

    } catch(e) {
        res.status(500).send(e.message)
    }
})

//Logout
router.post('/logout', auth, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token => token !== req.token)
        await req.user.save()
        res.status(200).send({msg: "Logout Successful"})
    } catch(e){
        res.status(500).send(e)
    }
})

//Logout All
router.post('/logoutAll', auth, async(req, res)=>{
    try{
        req.user.tokens = [];
        await req.user.save()
        res.status(200).send(req.user)
    } catch(e){
        res.status(500).send(e)
    }
})

//Read own Profile
router.get('/profile', auth, (req, res)=>{
    res.status(200).send(req.user)
})

//Read all users
router.get('/users', auth, async(req, res)=>{
    try{
        const users = await User.find({});
        const count = await User.count({});
        if(users.length>=1){
            return res.status(200).send(`Total User: ${count}
        ${users}`);
        }
        res.status(404).send('User list is empty')
    } catch(e) {
        res.status(500).send(`Internal Server Error.
        Error Message: 
        ${e}`);
    }
})

//Update a User
router.patch('/profile', auth, async(req, res)=>{
    if(!userCheckPost(req)){
            return res.status(400).send({error: `Enter valid fields to update user profile=> ${userFields}`});
    }
    try{
        const given = Object.keys(req.body)
        given.forEach(field=>req.user[field]=req.body[field])
        const updatedUser = await req.user.save()
        sendMail(updatedUser.email, updatedUser.name, 'Profile Updated', '<p1>Your profile has been updated</p1>')
        res.status(200).send(updatedUser)
    } catch(e){
        console.log(e.errors.mobile_number)
        if(e.errors.mobile_number){
           return res.status(400).send({error: 'Please enter correct Mobile Number'})
        }
        res.status(400).send(e)
    }
})

// Upload Avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload a JPG or JPEG ot PNG file'))
        }else {
            cb(undefined, true)
        }
    }
})
router.post('/profile/avatar', auth, upload.single('avatar'), async(req, res)=>{
    req.user.avatar = await sharp(req.file.buffer).resize({height: 250, width: 250}).png().toBuffer()
    await req.user.save()
    res.status(200).send({msg: 'Profile picture uploaded successfully with RESIZED Version (250x250)'})
}, (error, req, res, next)=>{
    res.status(400).send(error)
})

// GET Avatar
router.get('/profile/avatar', auth, (req, res)=>{
    if(!req.user.avatar){
        return res.status(404).send({error: 'No Avatar set yet'})
    }
    res.set('Content-Type', 'image/png')
    res.status(200).send(req.user.avatar)
})

// Delete Avatar
router.delete('/profile/avatar', auth, async (req, res)=>{
    try{
        if(!req.user.avatar){
           return res.status(404).send({error: "There is no user avatar"})
        }
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send({error: 'User avatar deleted'})
    }catch(e){
        res.status(500).send(e)
    }
})

//Delete a user
router.delete('/profile/delete', auth, async(req, res)=>{
    try{
        await req.user.remove()
        sendMail(req.user.email, req.user.name, 'Account Deleted', '<p1>We are sorry to see you go</p1>')
        return res.status(200).send({msg: 'Your profile has been deleted successfully'});
    } catch(e) {
        res.status(500).send(`Internal Server Error.
        Error Message: 
        ${e}`)
    }
})

// 404 Page for user route
router.get('/user/*', (req, res)=>{
    res.status(404).send('This User Route is NOT available')
})

module.exports = router