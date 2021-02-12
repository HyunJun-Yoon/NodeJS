const chatForm = document.getElementById('chat-form');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Kick user out
socket.on('disconnect', () => {
  console.log('user disconnected');
  window.history.back();
  alert('User exists');
});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Message from server
socket.on('message', message => {
  outputMessage(message);
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username}</p><p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Show Typing
function sendTyping(status) {
  socket.emit('typing', status);
}

socket.on('show-typing', data => {
  var typingStatus = document.getElementById('typing-status');
  typingStatus.innerHTML = '';
  if (data.status) {
    typingStatus.innerHTML = `${data.name} is Typing...`;
  }
});
