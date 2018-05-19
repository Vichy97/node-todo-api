const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('error connecting to database server', err);
        return;
    }
    console.log('connected to database server');

    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text: 'do laundry',
        completed: false
    }, (err, res) => {
        if (err) {
            console.log('error inserting data', err);
            return;
        }
        console.log(JSON.stringify(res.ops, undefined, 2));
    });

    db.collection('Users').insertOne({
        name: 'Vincent',
        age: 20,
        location: 'San Francisco'
    }, (err, res) => {
        if (err) {
            console.log('error inserting data', err);
            return;
        }
        console.log(res.ops[0]._id);
    });

    client.close();
});