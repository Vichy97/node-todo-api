const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('error connecting to database server', err);
        return;
    }
    console.log('connected to database server');

    const db = client.db('TodoApp');

    db.collection('Todos').find().count().then((count) => {
        console.log(`Todos count: ${count}`);
    }, (err) => {
        console.log('unable to count todos', err);
    });

    client.close();
});