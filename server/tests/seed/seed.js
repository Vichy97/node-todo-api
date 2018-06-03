const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


const todos = [{
    _id: new ObjectID(),
    text: 'test todo',
    completed: false
}, {
    _id: new ObjectID(),
    text: 'test todo 21344',
    completed: true
}];

const user1Id = new ObjectID();
const user2Id = new ObjectID();
const users = [{
    _id: user1Id,
    email: 'vincent@test.com',
    password: 'user1Password',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: user1Id, access: 'auth'}, '123abc').toString()
    }]
}, {
    _id: user2Id,
    email: 'vwilliams@test.com',
    password: 'user1Password'
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {
    todos,
    users,
    populateTodos,
    populateUsers
};