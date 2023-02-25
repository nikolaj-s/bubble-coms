

module.exports = class ServerUserStatus {
    constructor(server_id) {

        this.server_id = server_id;

        this.users = new Map();

    }

    user_leaves_server(member_id) {
        this.users.delete(member_id);
    }

    user_joins_server(id, member) {

        // check if user exists to avoid dupes
        for (let [key, value] of this.users) {
            if (value._id === member._id) {
                this.users.delete(key);
                break;
            }
        }

        this.users.set(id, member);
    }

    update_member_data(id, member) {
        const user = this.users.get(id);

        this.users.set(id, {status: user.status, ...member});
    }

    update_user_status(id, new_status) {

        const user = this.users.get(id);

        this.users.set(id, {...user, status: new_status});

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
}