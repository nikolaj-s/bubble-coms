

module.exports = class ServerUserStatus {
    constructor(server_id) {

        this.server_id = server_id;

        this.users = new Map();

    }

    user_leaves_server(member_id) {
        this.users.delete(member_id);
    }

    user_joins_server(member) {
        this.users.set(member._id, member);
    }

    update_user_status(member_id, new_status) {

        const user = this.users.get(member_id);

        this.users.set(member_id, {...user, status: new_status});

    }

    get_user_by_member_id(member_id) {
        
        return this.users.get(member_id);
    
    }
}