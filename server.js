const path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const chatHistory = require('./models/chatHistory');
const {
  userJoin,
  getRoomUsers,
  getCurrentUser,
  userLeave,
  valUsername,
  users
} = require('./utils/users');
const formatMessage = require('./utils/messages');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Declare MongoDB Schemas
var Message = mongoose.model('Message', {
  name: String,
  message: String
});

var dbUrl =
  'mongodb+srv://hyunjun:wjstjf1443@cluster0.7abhc.mongodb.net/gbc_full_stack?retryWrites=true&w=majority';

// Run when user connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    users.map(user => {
      if (user.username === username) {
        console.log('smae');
        socket.disconnect();
      }
    });
    //console.log(valUsername(username));
    // if (valUsername(username)) {
    //   console.log(valUsername(username));
    // }
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
  });

  // Listen for chatMessage & Save to DB
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    const users = getRoomUsers(user.room);
    const record = new chatHistory({
      from_user: user.username,
      to_user: users.map(user => {
        return user.username;
      }),
      room: user.room,
      message: msg
    });
    record.save().then(() => {
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage('Admin', `${user.username} has left the chat`)
      );
    }
  });

  // Typing
  socket.on('typing', status => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('show-typing', {
      name: user.username,
      status: status
    });
  });
});

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save(err => {
    if (err) {
      //sendStatus(500);
      console.log(err);
    }

    //Send Message to all users
    io.emit('message', req.body);
    res.sendStatus(200);
  });
});

mongoose.connect(
  dbUrl,
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    if (err) {
      console.log('mongodb connected', err);
    } else {
      console.log('Successfully mongodb connected');
    }
  }
);

var server = http.listen(3001, () => {
  console.log('server is running on port', server.address().port);
});
