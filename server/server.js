const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

let Todo = mongoose.model(('Todo'), {
    text: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

let User = mongoose.model(('User'), {
    email: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    }
});

let newTodo = new Todo({
   text: 'do laundry'
});

newTodo.save().then((doc) => {
    console.log('model saved', doc);
}, (err) => {
    console.log('unable to save model', err);
});

let newUser = new User({
    email: 'VincentWilliams97@gmail.com'
});

newUser.save().then((doc) => {
    console.log('model saved', doc);
}, (err) => {
    console.log('unable to save model', err);
});