
const UserStatusSocket = async (socket, data, cb) => {
    try  {

        if (data.action) {
            socket.to(socket.current_server).emit({username: data.username, action: data.action})
        } else {
            cb({error: true, errorMessage: "not a valid status"})
        }

    } catch (error) {
        console.log(error)
        cb({error: true, errorMessage: "an action error has occurred"})
    }
}

module.exports = UserStatusSocket;