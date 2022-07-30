const express = require('express');
const Task = require('../db/task')
const auth = require('../functions/auth')
const {taskCheckPost, taskUpdate, taskFields} = require('../functions/user_task_checkpost')
const router = express.Router();

//Create a Task
router.post('/task', auth, async(req, res)=>{
    if(!taskCheckPost(req)){
            return res.status(406).send("Enter Valid Fields");
    }
    const task = await new Task({
            ...req.body,
            owner: req.user._id
        })
    try{
        await task.save()
        res.status(201).send({msg:'Task Created Successfully', task})
    } catch(e){
        if(e.code===11000){
            return res.status(400).send({error: 'Task can not be created. Title should be unique'})
        }
        res.status(400).send({error: e.errors.title.properties.message})
    }
})

//Read a task
router.get('/task/:id', auth, async(req,res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        if(task){
            return  res.status(200).send({found: true, task})
        }
        res.status(404).send({error: 'Task NOT Found'})
    } catch(e){
        res.status(400).send({error: 'Task NOT Found', msg:e.message}) 
    }
})

// Read all Task
// GET url?completed=true
// GET url?limit=10&skip=10
// GET url?sortBy=createdAt:desc
router.get('/tasks', auth, async(req,res)=>{
    try{
        let match = {}
        let sort = {}
        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }
        if(req.query.sortBy){
            let parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? 1 : -1
            }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        const tasks = req.user.tasks;
        if(tasks.length>=1){
            return  res.status(201).send({totalTask: tasks.length, tasks})
        }
        res.status(404).send({msg: 'Task list is empty'})
    } catch(e){
        res.status(400).send(e) 
    }
})

//Update a Task
router.patch('/task/:id', auth, async(req, res)=>{
    if(!taskCheckPost(req)){
        return res.status(400).send({error:`Enter Valid Fields => ${taskFields}`});
    }
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send({error: "Task Not Found"})
        }
        const given = Object.keys(req.body)
        given.forEach(field=>task[field]=req.body[field])
        const updatedTask = await task.save()
        res.status(200).send(updatedTask)
    }catch(e){
        res.status(400).send(e)
    }
})

//Delete a Task
router.delete('/task/:id', auth, async(req, res)=>{
    const _id = req.params.id;
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(task){
            return res.status(200).send({msg:'Task Deleted Successfully', deleted: task});
        }
        res.status(404).send({msg: 'Task NOT Found'})
    }catch(e) {
        res.status(400).send({msg: 'Task NOT Found'})
    }
})
module.exports = router