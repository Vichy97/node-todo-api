const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('error connecting to database server', err);
        return;
    }
    console.log('connected to database server');
    const db = client.db('TodoApp');

    db.collection('Todos').deleteOne({
        text: 'clean room'
    }).then((res) => {
        console.log('delete success');
    }, err => {
        console.log(err);
    });

    client.close();
});