const socket = io()

const connectedStatus = document.getElementById('connectedStatusText')
const usernameInput = document.getElementById('username')
const connectInput = document.getElementById('connectInputs')
const connectButton = document.getElementById('connectButton')
const messageBox = document.getElementById('chatMessages')
const messageInput = document.getElementById('messageInputBox')
const sendButton = document.getElementById('sendButton')
const clearButton = document.getElementById('clearButton')

socket.on('message', function (data) {
    let msgDiv = document.createElement('div')
    msgDiv.style.padding = '5px'
    msgDiv.innerText = data.message
    if (data.userid === socket.id) {
        if (data.groupMsg || data.privateMsg) {
            msgDiv.style.color = 'red'
            msgDiv.style.backgroundColor = 'lightpink'
        } else {
            msgDiv.style.color = 'blue'
            msgDiv.style.backgroundColor = 'lightblue'
        }
    } else if (data.privateMsg || data.groupMsg) {
        msgDiv.style.color = 'red'
        msgDiv.style.backgroundColor = 'lightpink'
    } else {
        msgDiv.style.color = 'black'
        msgDiv.style.backgroundColor = 'grey'
    }
    messageBox.appendChild(msgDiv)
})

function connect() {
    let regex = /^[a-zA-Z][a-zA-Z0-9]*$/
    let username = usernameInput.value.trim()
    if (!username.match(/^[a-zA-Z][a-zA-Z0-9]*$/) || username.length < 0) {
        usernameInput.value = '';
        return;
    }
    socket.emit('connectToServer', usernameInput.value)
    connectedStatus.innerText = 'You have connected to the Chat Server as: ' + usernameInput.value
    messageInput.disabled = false
    sendButton.disabled = false
    connectInput.style.display = 'none'
    messageBox.style.visibility = 'visible'
}

function sendMessage() {
    let data = {}
    data.username = usernameInput.value
    data.message = messageInput.value
    data.userid = socket.id
    if (data.message === '') return
    if (data.message.indexOf(':') > -1) {
        if (data.message.substring(0, data.message.indexOf(':')).includes(',')) {
            data.groupMsg = true
            data.privateMsg = false
        } else {
            data.groupMsg = false
            data.privateMsg = true
        }
    } else {
        data.groupMsg = false
        data.privateMsg = false
    }
    socket.emit('message', data)
    messageInput.value = ''
}

function handleKeyDown(event) {
    const ENTER_KEY = 13
    if (event.keyCode === ENTER_KEY) {
        sendMessage()
        return false
    }
}

function clearChat() {
    messageBox.innerHTML = ''
}