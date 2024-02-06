const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const ReOrderCategories = async (socket, data, cb) => {
    try {
        const server = await ServerSchema.findOne({_id: socket.current_server})

        if (!data.new_order) return cb({error: true, errorMessage: "Invalid Category"});

        const user = await server.get_member(socket.AUTH.username);

        if (user === -1) return cb({error: true, errorMessage: "validation error"});

        const server_group = await server.get_server_group(user.server_group)

        if (server_group === -1) return cb({error: true, errorMessage: "validation error"});

        if (server_group.user_can_manage_channels === false) return cb({error: true, errorMessage: "you do not have permissions to perform this action"})

        await server.re_order_categories(data.new_order);

        cb({new_order: data.new_order});

        socket.to(socket.current_server).emit('new category order', {new_order: data.new_order});

        return;
    } catch (error) {
        cb({error: true, errorMessage: "Fatal Error Reordering Categories"});
    }
}

module.exports = ReOrderCategories;