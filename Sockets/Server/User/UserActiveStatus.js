

const UserActiveStatus = (socket, data, cb, serverList) => {
    try {

        serverList.get(socket.current_server).update_user_status(socket.id, data.value);

        const memeber = serverList.get(socket.current_server).get_user_by_socket_id(socket.id);

        cb({status: data.value, user_id: memeber._id});

        socket.to(socket.current_server).emit('user status update', {status: data.value, user_id: memeber._id, username: memeber.username});

    } catch (error) {
        console.log(error);
        cb({error: true, error: error.message})
    }
}

module.exports = UserActiveStatus;