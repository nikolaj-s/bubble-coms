

const PokeUserSocket = async (socket, data, cb, serverList) => {
    try {

        const user = serverList.get(socket.current_server).get_user_by_socket_id(socket.id);

        const user_to_poke = await serverList.get(socket.current_server).get_socket_id_by_member_id(data.member_id);

        if (!user_to_poke) return cb({error: true, errorMessage: "error poking user"});

        socket.to(user_to_poke).emit('poke', {message: `${user.display_name} has poked you!`});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error poking user"});
    }
}

module.exports = PokeUserSocket;