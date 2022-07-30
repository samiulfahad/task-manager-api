const express = require('express');
const userRouter = require('./Router.js/UserRouter')
const taskRouter = require('./Router.js/TaskRouter')
const app = express();
app.use(express.json())
const port = process.env.PORT || 3000
// Adding User Router
app.use(userRouter)
// Adding Task Router
app.use(taskRouter)
// Adding 404 Page
app.get('*', (req, res)=>{
    res.send('Page NOT Found')
})
// App Listening
app.listen(port, ()=>{
    console.log(`Listening on Port ${port}`)
})