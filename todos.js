/**
 * http://docs.mongodb.org/ecosystem/drivers/node-js/
  *
 */

var tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var TodosSchema = mongoose.Schema({
    id: Number,
    description: String,
    done: Boolean,
    time_date: String,
    time_from: String,
    time_to: String,
    addr_from: String,
    addr_to: String,
    prise: String,
    phone: String,
    email: String
});

var TodosEntry = mongoose.model('Todos',TodosSchema);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

});


// Escapes HTML so that evil people can't inject mean things into the page
function escapeHtml(str) {
    console.log("Replace:",str);
  return str.replace(/[&<>]/g, function (tag) {
    return tagsToReplace[tag] || tag;
  });
}
 
function TodoStore() {
    this.todos = [];
    TodosEntry.find(function(err,todoslist) {
        if (err) return console.error(err);
        console.log("TodoStore():"+todoslist);
    });
  this.lastId = 1;
}
 
// Returns a Todo by it's id
TodoStore.prototype.getById = function (id) {
  var currentTodo;

  for (var i = 0; i < this.todos.length; i++) {
    currentTodo = this.todos[i];
    if (currentTodo.id == id) {
      return currentTodo;
    }
  }
 
  return null;
}
 
TodoStore.prototype.find = function (params, callback) {
    console.log("TodoStore.prototype.find: "+this.todos);
  callback(null, this.todos);
}
 
TodoStore.prototype.get = function (id, params, callback) {
  var todo = this.getById(id);
  if (todo === null) {
    return callback(new Error('Заказ не найден'));
  }
 
  callback(null, todo);
}
 
TodoStore.prototype.create = function (data, params, callback) {
  // Create our actual Todo object so that we only get what we really want
  var newTodo = {
    id: this.lastId++,
    description: escapeHtml(data.description),
    done: !!data.done,
    time_date: escapeHtml(data.time_date),
    time_from: escapeHtml(data.time_from),
    time_to: escapeHtml(data.time_to),
    addr_from: escapeHtml(data.addr_from),
    addr_to: escapeHtml(data.addr_to),
    prise: escapeHtml(data.prise),
    phone: escapeHtml(data.phone),
    email: escapeHtml(data.email)
  };

  var newTodoEntry = new TodosEntry(newTodo);
 newTodoEntry.save(function (err, td) {
        if (err) return console.error(err);
        console.log(td);
    }
 );

  console.log("Новый заказ: \n id:",newTodo.id,"\n time_date:",newTodo.time_date,"\n time_from",newTodo.time_from,"\n time_to",newTodo.time_to,"\n addr_from",newTodo.addr_from);
  this.todos.push(newTodo);
 
  callback(null, newTodo);
}
 
TodoStore.prototype.update = function (id, data, params, callback) {
  var todo = this.getById(id);
  if (todo === null) {
    return callback(new Error('Заказ не существует'));
  }
 
  // We only want to update the `done` property
  // !! is used for sanitization turning everything into a real booelan
  todo.done = !!data.done;
 
  callback(null, todo);
}
 
TodoStore.prototype.remove = function (id, params, callback) {
  var todo = this.getById(id);
  if (todo === null) {
    return callback(new Error('Невозможно удалить заказ'));
  }
 
  // Just splice our todo out of the array
  this.todos.splice(this.todos.indexOf(todo), 1);
  callback(null, todo);
}
 
module.exports = TodoStore;