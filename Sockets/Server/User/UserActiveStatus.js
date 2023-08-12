const { StatusIcon } = require("../../../Schemas/StatusIcon/StatusIcon");
const GetIcon = require("../../../Util/Image/GetIcon");


const UserActiveStatus = async (socket, data, cb, serverList) => {
    try {

        let icon = "";

        const saved_icons = data.value.toLowerCase() !== 'online' && data.value.toLowerCase() !== 'offline' && data.value.toLowerCase() !== 'away' ? await StatusIcon.findOne({status: data.value}) : null;
        
        const new_icon = !saved_icons && data.value.toLowerCase() !== 'online' && data.value.toLowerCase() !== 'offline' && data.value.toLowerCase() !== 'away' ? await GetIcon(`${data.value} icon png`) : ""

        if (new_icon !== "") {
            const save_new_icon = await new StatusIcon({
                status: data.value,
                icon: new_icon
            })

            await save_new_icon.save();
        }

        icon = (saved_icons?.icon || new_icon);
        
        serverList.get(socket.current_server).update_user_status(socket.id, data.value, icon);

        const memeber = serverList.get(socket.current_server).get_user_by_socket_id(socket.id);

        cb({status: data.value, user_id: memeber._id, icon: icon});

        socket.to(socket.current_server).emit('user status update', {status: data.value, user_id: memeber._id, username: memeber.username, icon: icon});

    } catch (error) {
        console.log(error);
        cb({error: true, error: error.message})
    }
}

module.exports = UserActiveStatus;