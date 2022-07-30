const mongoose = require('mongoose');
try{
    mongoose.connect(process.env.MongoDB_URL)
} catch(e){
    mongoose.connect(process.env.MongoDB_URL)
}
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 60,
        required: [true, "A suitable unique title is required"],
        unique: true
    },
    description: {
        type: String,
        maxlength: 5000,
        required: [true, "Description is required"]
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})
const Task = mongoose.model('Task', taskSchema);
module.exports = Task