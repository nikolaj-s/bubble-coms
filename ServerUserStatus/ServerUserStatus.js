

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

    update_user_status(id, new_status) {

        const user = this.users.get(id);

        this.users.set(member_id, {...user, status: new_status});

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
}