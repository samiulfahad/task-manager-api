const express = require('express');
const userRouter = require('./Router.js/UserRouter')
const taskRouter = require('./Router.js/TaskRouter')
const app = express();
app.use(express.json())
const port = process.env.PORT || 3000

const instruction = `<h3 style="text-color:green; margin-top:50px; margin-left:200px">Use Postman to interact with the API. A JWT token will be provided to authorise certain routes.</h3>
<p style="text-color:green; margin-left:200px">
<b>Technologies Used:</b> Node.js, Express.js, MongoDB, Mongoose, JSON Web Token, Bcrypt.js, Multer and more
</p>
<h4 style="margin-left:200px">endpoint /sign-up (POST) to create a user with email and password field<br>
endpoint /login (POST) to login using a valid email and password. A token will be provided <br>
endpoint /profile (GET) to read own profile<br>
endpoint /profile (PATCH) to update profile<br>
endpoint /profile/avatar (POST/GET/DELETE, ##field name=> avatar) to interact with profile Picrure<br>
endpoint /profile/delete (DELETE) to delete own profile<br>
endpoint /logout (POST) to logout and delete a jwt token<br>
endpoint /logoutall (POST) to expire all active sessions<br>
endpoint /task (POST) to create a task with Title, Description and Completed (Boolean) field<br>
endpoint /task/:id (POST) to update a Task<br>
endpoint /task/:id (GET/DELETE) to read and delete a task<br>
endpoint /tasks (GET) to read all tasks of the logged in user</h4>`


// Adding User Router
app.use(userRouter)
// Adding Task Router
app.use(taskRouter)

// Home Page
app.get('/', (req, res)=>{
    res.status(200).send(instruction)
})
// Adding 404 Page
app.get('*', (req, res)=>{
    res.status(404).send(`Page NOT Found
    ${instruction}`)
})
// App Listening
app.listen(port, ()=>{
    console.log(`Listening on Port ${port}`)
})