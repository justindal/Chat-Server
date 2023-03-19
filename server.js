const http = require('http')
const url = require('url')
const app = require('http').createServer(handler)
const io = require('socket.io')(app)
const fs = require('fs')
const PORT = process.env.PORT || 3000
app.listen(PORT)

const ROOT_DIR = 'html'

const MIME_TYPES = {
    css: "text/css",
    gif: "image/gif",
    htm: "text/html",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    txt: "text/plain"
}

function get_mime(filename) {
    for (let ext in MIME_TYPES) {
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return MIME_TYPES[ext]
        }
    }
    return MIME_TYPES["txt"]
}

let users = {}

function handler(request, response) {
    //handler for http server requests including static files
    let urlObj = url.parse(request.url, true, false)
    console.log('\n============================')
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let filePath = ROOT_DIR + urlObj.pathname
    if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

    fs.readFile(filePath, function (err, data) {
        if (err) {
            //report error to console
            console.log('ERROR: ' + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404);
            response.end(JSON.stringify(err))
            return
        }
        response.writeHead(200, {
            'Content-Type': get_mime(filePath)
        })
        response.end(data)
    })

}

//Socket Server
io.on('connection', function (socket) {
    console.log('Client Connected: ' + socket.id)

    socket.on('connectToServer', function (username) {
        console.log('Client Connected: ' + socket.id)
        socket.username = username
        socket.emit('connected')
        users[username] = socket.id
        console.log(users)
    })

    socket.on('message', function (data) {
        console.log('Message Received: ' + data.message)
        console.log('Sender ID: ' + data.userid)

        if (data.privateMsg) {
            // log recipient name:
            let recipient = data.message.substring(0, data.message.indexOf(':'))
            console.log('Recipient: ' + recipient)
            // log recipient id:
            let recipientId = users[recipient]
            console.log('Recipient ID: ' + recipientId)
            // remove recipient name from message
            data.message = data.message.substring(data.message.indexOf(':') + 1)
            data.message = 'PM from ' + data.username + ': ' + data.message
            socket.to(recipientId).emit('message', data)
            // show recipient name with message in sender's chat window
            data.message = 'PM to ' + recipient + ': ' + data.message.substring(data.message.indexOf(':') + 1)
            socket.emit('message', data)
        } else if (data.groupMsg) {
            let recipients = data.message.substring(0, data.message.indexOf(':'))
            data.message = data.message.substring(data.message.indexOf(':') + 1)
            recipients = recipients.split(',')
            for (let i = 0; i < recipients.length; i++) {
                let recipient = recipients[i].trim()
                console.log('Recipient: ' + recipient)
                let recipientId = users[recipient]
                console.log('Recipient ID: ' + recipientId)
                data.message = 'Group PM from ' + data.username + ' with ' + recipients + ': ' + data.message.substring(data.message.indexOf(':') + 1)
                socket.to(recipientId).emit('message', data)
            }
            data.message = 'Group PM to ' + recipients + ': ' + data.message.substring(data.message.indexOf(':') + 1)
            socket.emit('message', data)
        } else {
            data.message = data.username + ': ' + data.message
            io.emit('message', data)
        }
    })

    socket.on('disconnect', function () {
        console.log('Client Disconnected')
        delete users[socket.username]
    })
})

console.log("Server Running at PORT: 3000  CNTL-C to quit")
console.log("To Test:")
console.log("http://localhost:3000/index.html")