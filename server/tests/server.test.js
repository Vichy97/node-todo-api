const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it ('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done)
    });
});

describe('POST /users', () => {

    it('should create a user', (done) => {
        let email = 'test@test.com';
        let password = "password123";

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeDefined();
                expect(res.body._id).toBeDefined();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then(user => {
                    expect(user).toBeDefined();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });

    it ('should return validation error with no request body', (done) => {
        request(app)
            .post('/users')
            .expect(400)
            .end(done);
    });

    it('should return validation error with invalid email', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'email',
                password: 'password'
            })
            .expect(400)
            .end(done);
    });

    it('should return validation error with invalid password', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'email@test.com',
                password: '123'
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email is in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: users[0].email,
                password: 'password123'
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {

   it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeDefined();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                   expect(user.tokens[0]).toHaveProperty('access', 'auth');
                   expect(user.tokens[0]).toHaveProperty('token', res.headers['x-auth']);
                   done();
                }).catch((err) => {
                    done(err);
                });
            })
   });

    it ('should return validation error with no request body', (done) => {
        request(app)
            .post('/users/login')
            .expect(400)
            .end(done);
    });

   it('should return validation error with invalid email', (done) => {
       request(app)
           .post('/users/login')
           .send({
               email: 'somefakeemail@test.com',
               password: 'password123'
           })
           .expect((res) => {
               expect(res.headers['x-auth']).not.toBeDefined();
           })
           .expect(400)
           .end(done);
   });

    it('should return validation error with invalid password', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[0].email,
                password: 'incorrectPassword'
            })
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeDefined();
            })
            .expect(400)
            .end(done);
    });

});