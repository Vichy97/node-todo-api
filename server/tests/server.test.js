const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: '﻿5b0269f629fabd860ee29ffa',
    text: 'test todo'
}, {
    text: 'test todo 2'
}];

beforeEach((done) => {
   Todo.remove({}).then(() => {
       return Todo.insertMany(todos);
   }).then(() => done());
});

describe('POST /todos', () => {
   it('should create new todo', (done) => {
       let text = 'test todo';

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

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
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

               Todo.find().then((todos) => {
                   expect(todos.length).toBe(2);
                   done();
               }).catch((err) => done(err));
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
            .get('/todos/5b0269f629fabd860ee29ffa')
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.length).toBe(1);
            }).end(done);
    });

    it ('should return 404 with invalid id', (done) => {
        request(app)
            .get('/todos/5b0269f629fabd860ee29ffaasdasd')
            .expect(404)
            .end(done);
    });

    it('should return 404 with unknown todo id', (done) => {
        request(app)
            .get('/todos/6b0269f629fabd860ee29ffa')
            .expect(404)
            .end(done);
    });
});