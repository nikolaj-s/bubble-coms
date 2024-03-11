const { StatusIcon } = require("../../../Schemas/StatusIcon/StatusIcon");
const GetIcon = require("../../../Util/Image/GetIcon");

const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");

const UserActiveStatus = async (socket, data, cb, serverList) => {
    try {

        let icon = "";

        let status;

        const user = await AccountSchema.findOne({username: socket.AUTH.username});

        if (!user) return cb({error: true, errorMessage: "Validation Error"});

        let lower_cased_data = data.value.toLowerCase();

        if (lower_cased_data.includes('devtools')) {
            status = "DevTools";
        } else if (lower_cased_data.includes('war thunder')) {
            status = 'War Thunder';
        } else if (lower_cased_data.includes('escapefromtarkov')) {
            status = "Escape From Tarkov";
        } else if (lower_cased_data.includes('league of legends')) {
            status = 'League of Legends';
        } else if (lower_cased_data.includes('edge')) {
            status = 'Microsoft Edge';
        } else {
            status = data.value;
        }

        const current_status = serverList.get(socket.current_server).get_current_user_status(socket.id);

        if (current_status.status === status) return cb({status: current_status.status, icon: current_status.status_icon});

        const server = await ServerSchema.findOne({_id: socket.current_server});

        const saved_icons = status.toLowerCase() !== 'online' && status.toLowerCase() !== 'offline' && status.toLowerCase() !== 'away' ? await StatusIcon.findOne({status: new RegExp(status, 'i')}).collation({locale: `en`, strength: 2}) : null;
        
        const new_icon = !saved_icons && status.toLowerCase() !== 'online' && status.toLowerCase() !== 'offline' && status.toLowerCase() !== 'away' ? await GetIcon(`${status} icon`) : ""

        if (new_icon !== "") {
            const save_new_icon = await new StatusIcon({
                status: status,
                icon: new_icon
            })

            await save_new_icon.save();
        }

        icon = (saved_icons?.icon || new_icon);
        
        serverList.get(socket.current_server).update_user_status(socket.id, status, icon);

        const memeber = serverList.get(socket.current_server).get_user_by_socket_id(socket.id);

        const status_msg = {
            channel_id: String(server._id),
            content: {
                text: `Started Playing ${status}`,
                date: new Date,
                time: Date.now(),
            },
            pinned: false,
            username: socket.AUTH.username,
            server_id: String(server._id),
        }

        if (status.toLowerCase() !== 'online' && status.toLowerCase() !== 'offline' && status.toLowerCase() !== 'away') {

            await user.update_recent_activity({state: status, icon: icon});

        }

        cb({status: status, user_id: memeber._id, icon: icon, status_msg: status_msg});

        socket.to(socket.current_server).emit('user status update', {status: status, user_id: memeber._id, username: memeber.username, icon: icon, status_msg: status_msg});

    } catch (error) {
        console.log(error);
        cb({error: true, error: error.message})
    }
}

module.exports = UserActiveStatus;