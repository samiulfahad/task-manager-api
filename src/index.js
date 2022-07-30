const express = require('express');
const userRouter = require('./Router.js/UserRouter')
const taskRouter = require('./Router.js/TaskRouter')
const app = express();
app.use(express.json())
const port = process.env.PORT || 3000

const instruction = `
endpoint /sign-up (POST) to create a user with email and password field.
endpoint /login (POST) to login using a valid email and password. A token will be provided.
endpoint /profile (GET) to read own profile
endpoint /profile (PATCH) to update profile
endpoint /profile/avatar (POST/GET/DELETE, ##field name=> avatar) to interact with profile Picrure
endpoint /profile/delete (DELETE) to delete own profile
endpoint /logout (POST) to logout and delete a jwt token
endpoint /logoutall (POST) to expire all active sessions
endpoint /task (POST) to create a task with Title, Description and Completed (Boolean) field
endpoint /task/:id (POST) to update a Task
endpoint /task/:id (GET/DELETE) to read and delete a task
endpoint /tasks (GET) to read all tasks of the logged in user`


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