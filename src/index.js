const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;
  const user = users.find( user => user.username === username);
  
  if(!user){
    return response.status(404).json({ error: "Mensagem de erro" });
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const customerAlreadyExists = users.some((user)=> user.username === username);

  if (customerAlreadyExists){
    return response.status(400).json({ error:"Mensagem de erro"});
  }
  const newUser ={
     id: uuidv4(),
     username,
     name,
     todos:[]
   }
  users.push(newUser);
  
  return response.status(201).json(newUser);
});

app.use(checksExistsUserAccount);

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const user = request.user;

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const{ title, deadline } = request.body;
  const user = request.user;
  const newTodo ={
    title,
    deadline,
    done: false,
    created_at: new Date(),
    deadline: new Date(deadline),
    id: uuidv4(),
  }
  user.todos.push(newTodo); 
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title , deadline} = request.body;
  const { id } = request.params;
  const user = request.user;
  let todoIndex = user.todos.findIndex( todo => {
    return todo.id === id
  });
  if(todoIndex < 0){
    return response.status(404).json({error: 'Mensagem do erro'});
  }

  user.todos[todoIndex] = {...user.todos[todoIndex] , title, deadline: new Date(deadline) }
  return response.status(201).json(user.todos[todoIndex] );

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  let todoIndex = user.todos.findIndex( todo => {
    return todo.id === id
  });
  if(todoIndex < 0){
    return response.status(404).json({error: 'Mensagem do erro'});
  }
  user.todos[todoIndex] = {...user.todos[todoIndex] , done: true }
  return response.status(201).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const user  = request.user;

  const { id } = request.params;
  console.log('request.params', request.params)

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({error: 'Mensagem do erro'});
  }
  user.todos.splice( todo , 1);

  return response.status(204).json(user.todos);
});

module.exports = app;