

const PokeUserSocket = async (socket, data, cb, channelList) => {
    try {

        const user_to_poke = await channelList.get(`${data.channel_id}/${socket.current_server}`).getPeersSocketByUsername(data.username);

        if (!user_to_poke) return cb({error: true, errorMessage: "error poking user"});

        socket.to(user_to_poke).emit('poke');

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error poking user"});
    }
}

module.exports = PokeUserSocket;