let express = require('express');
let bodyParser = require('body-parser');
let {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

let app = express();
let port = process.env.port || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (err) => {
        res.status(400).send();
    })
});

app.listen(port, () => {
    console.log('started on port 3000');
});

module.exports = {
    app
};
