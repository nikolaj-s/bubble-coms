
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const AddCategory = async (socket, data, cb) => {
    try {
        const server = await ServerSchema.findOne({_id: socket.current_server})

        if (server.categories.length > 20) return cb({error: true, errorMessage: "You have reached the servers maximum amount of categories."})

        if (!data.category_name) return cb({error: true, errorMessage: "Invalid Category Name"});

        if (data.category_name.length < 1) return cb({error: true, errorMessage: "Invalid Category Name"});

        const user = await server.get_member(socket.AUTH.username);

        if (user === -1) return cb({error: true, errorMessage: "validation error"});

        const server_group = await server.get_server_group(user.server_group)

        if (server_group === -1) return cb({error: true, errorMessage: "validation error"});

        if (server_group.user_can_manage_channels === false) return cb({error: true, errorMessage: "you do not have permissions to perform this action"})

        const category = {
            category_name: data.category_name
        }

        await server.add_category(category);

        cb({category: server.categories[server.categories.length - 1]});

        socket.to(socket.current_server).emit('new category', {category: server.categories[server.categories.length - 1]});

        return;

    } catch (error) {
        console.log(error);

        cb({error: true, errorMessage: "Fatal Error Creating Category"});
    }
}

module.exports = AddCategory;