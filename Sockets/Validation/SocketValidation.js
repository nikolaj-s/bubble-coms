
const jwt = require('jsonwebtoken');

const SocketValidation = async (socket, next) => {
    try {
        if (!socket.handshake.query && !socket.handshake.query.token) return socket.emit("error", {error: true, errorMessage: "Validation Error"});

        const verify = jwt.verify(socket.handshake.query.TOKEN, process.env.SECRET)

        if (!verify) return socket.emit("error", {error: true, errorMessage: "Validation Error"});
        
        socket.AUTH = verify;

        return next();
    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "Validation Error"})
    }
}

module.exports = SocketValidation;