
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const DeleteCategory = async (socket, data, cb) => {
    try {
        const server = await ServerSchema.findOne({_id: socket.current_server})

        if (!data.category_id) return cb({error: true, errorMessage: "Invalid Category"});

        const user = await server.get_member(socket.AUTH.username);

        if (user === -1) return cb({error: true, errorMessage: "validation error"});

        const server_group = await server.get_server_group(user.server_group)

        if (server_group === -1) return cb({error: true, errorMessage: "validation error"});

        if (server_group.user_can_manage_channels === false) return cb({error: true, errorMessage: "you do not have permissions to perform this action"})

        await server.delete_category(data.category_id);

        cb({category_id: data.category_id});

        socket.to(socket.current_server).emit('delete category', {category_id: data.category_id});

        return;

    } catch (error) {
        cb({error: true, errorMessage: "Fatal Error Deleting Category"});
    }
}

module.exports = DeleteCategory;