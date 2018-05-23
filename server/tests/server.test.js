const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'test todo',
    completed: false
}, {
    _id: new ObjectID(),
    text: 'test todo 21344',
    completed: true
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create new todo', (done) => {
        let text = 'test todo 3';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(3);
                        expect(todos[2].text).toBe(text);
                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should not create todo with invalid data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(2);
                        done();
                    })
                    .catch((err) => done(err));
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            }).end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should find todo with valid id', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect((res) => {
                let todo = res.body.todo;
                expect(todo.text).toBe(todos[0].text);
            }).end(done);
    });

    it('should return 404 with invalid id', (done) => {
        request(app)
            .get('/todos/1234')
            .expect(404)
            .end(done);
    });

    it('should return 404 with unknown todo id', (done) => {
        let unknownId = new ObjectID();
        request(app)
            .get(`/todos/${unknownId}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete todo with valid id', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect((res) => {
                let todo = res.body.todo;
                expect(todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(todos[0]._id)
                    .then((todo) => {
                        expect(todo).toBeNull();
                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should return 404 with invalid id', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });

    it('should return 404 with unknown todo id', (done) => {
        let unknownId = new ObjectID();
        request(app)
            .delete(`/todos/${unknownId}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {

    it('should update the todo', (done) => {
        request(app)
            .patch(`/todos/${todos[0]._id}`)
            .send({
                text: 'updated text',
                completed: true
            })
            .expect(200)
            .expect((res) => {
                let todo = res.body.todo;
                expect(todo.text).toBe('updated text');
                expect(todo.completed).toBe(true);
                expect(typeof todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it('should clear completedAt when completed is updated to false', (done) => {
        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .send({
                completed: false
            })
            .expect(200)
            .expect((res) => {
                let todo = res.body.todo;
                expect(todo.completed).toBe(false);
                expect(todo.completedAt).toBeNull();
            })
            .end(done);
    });

    it('should return 404 with invalid id', (done) => {
        request(app)
            .patch('/todos/123')
            .expect(404)
            .end(done);
    });

    it('should return 404 with unknown todo id', (done) => {
        let unknownId = new ObjectID();
        request(app)
            .patch(`/todos/${unknownId}`)
            .expect(404)
            .end(done);
    });
});