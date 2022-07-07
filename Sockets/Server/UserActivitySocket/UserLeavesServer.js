

const UserLeavesServer = async (socket, data) => {
    try {

        socket.leave(data.server_id);

        socket.emit({success: true, message: "Successfully left server"});

        socket.disconnect();

        console.log('user has disconnected')

    } catch(error) {
        console.log(error);
        return {error: true, errorMessage: "server error"}
    }
}

module.exports = UserLeavesServer;