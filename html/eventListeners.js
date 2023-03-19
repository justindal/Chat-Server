document.addEventListener('DOMContentLoaded', function() {
    messageInput.addEventListener('keydown', handleKeyDown)
    connectButton.addEventListener('click', connect)
    sendButton.addEventListener('click', sendMessage)
    clearButton.addEventListener('click', clearChat)
})