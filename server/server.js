let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

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