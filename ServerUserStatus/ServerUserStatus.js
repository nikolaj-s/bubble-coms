

module.exports = class ServerUserStatus {
    constructor(server_id) {

        this.server_id = server_id;

        this.users = new Map();

    }

    user_leaves_server(member_id) {

        let u = this.users.get(member_id);
        // prevent memory issues
        URL.revokeObjectURL(u?.status_icon);

        this.users.delete(member_id);
    }

    user_joins_server(id, member, io) {

        // check if user exists to avoid dupes
        try {
            for (let [key, value] of this.users) {
                if (value._id === member._id) {
                    this.users.delete(key);

                    let socket = io.sockets.sockets.get(key);

                    if (socket) {
                        socket.off();
                    }

                    break;
                }
            }
        } catch (e) {
        }

        this.users.set(id, member);
    }

    update_member_data(id, member) {
        const user = this.users.get(id);

        this.users.set(id, {status: user.status, ...member});
    }

    update_user_status(id, new_status, icon) {

        const user = this.users.get(id);

        this.users.set(id, {...user, status: new_status, status_icon: icon});

    }

    get_user_by_socket_id(id) {
        return this.users.get(id);
    }

    get_user_by_member_id(member_id) {
        
        let user;

        for (let [key, value] of this.users) {
            if (value._id === member_id) {
                user = value;
                break;
            }
        }
        
        return user;
    }

    get_socket_id_by_member_id(id) {

        let socket_id;

        for (let [key, value] of this.users) {
            if (value._id === id) {
                socket_id = key;
                break;
            }
        }

        return socket_id;

    }

    get_socket_id_by_username(username) {
        let socket_id;

        for (let [key, value] of this.users) {
            if (value.username === username) {
                socket_id = key;
                break;
            }
        }

        return socket_id;


    }
}