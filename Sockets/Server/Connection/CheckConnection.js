

const checkConnection = async (socket, data, cb) => {
    try {

        cb({success: true});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal error checking connection"})
    }
}

module.exports = checkConnection;