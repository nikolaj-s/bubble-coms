
const UserStatusSocket = async (socket, data, channelList, cb = () => {}) => {
    try  {

        if (data.action) {
            // update peer data
            channelList.get(socket.channel_id).peers.get(socket.id)?.updateUser(data.action);

            // send data to other users
            if (data.action.channel_specific === true) {
                socket.to(socket.channel_id).emit('user status', {username: data.username, action: data.action})
            } else {
                socket.to(socket.current_server).emit('user status', {username: data.username, action: data.action})
            }
            
        } else {
           // cb({error: true, errorMessage: "not a valid status"})
        }

        cb({success: true});

    } catch (error) {
        console.log(error)
        cb({error: true, errorMessage: "an action error has occurred"})
    }
}

module.exports = UserStatusSocket;