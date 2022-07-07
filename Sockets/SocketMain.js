

const CloseProducer = require('./Server/ChannelSocket/CloseProducer');
const ConnectTransport = require('./Server/ChannelSocket/ConnectTransport');
const Consume = require('./Server/ChannelSocket/Consume');
const CreateWebRtcTransport = require('./Server/ChannelSocket/CreateWebRtcTransport');
const getChannelInfo = require('./Server/ChannelSocket/GetChannelInfo');
const GetProducers = require('./Server/ChannelSocket/GetProducers');
const GetRouterRtpCapabilities = require('./Server/ChannelSocket/GetRouterRtpCapabilities');
const Produce = require('./Server/ChannelSocket/Produce');
const UserCreatesChannel = require('./Server/ChannelSocket/UserCreatesChannel');
const UserJoinsChannelSocket = require('./Server/ChannelSocket/UserJoinsChannelSocket');
const UserLeavesChannel = require('./Server/ChannelSocket/UserLeavesChannelSocket');
const UserStatusSocket = require('./Server/ChannelSocket/UserStatusSocket');
const Disconnect = require('./Server/UserActivitySocket/Disconnect');
const userJoinsServer = require('./Server/UserActivitySocket/UserJoinsServerSocket');
const UserLeavesServer = require('./Server/UserActivitySocket/UserLeavesServer');
const SocketValidation = require('./Validation/SocketValidation');

const channelList = new Map();

const onConnection = async (server, workers, workerIndex, getMediasoupWorker) => {

    const io = require('socket.io')(server, {cors: {origin: "*"}})

    io.use(function(socket, next) {
        return SocketValidation(socket, next)
    })
    .on('connection', async (socket) => {
        
        // server sockets
        socket.on('joined server', async (data, cb) => userJoinsServer(socket, data.server_id, channelList, cb));

        socket.on('left server', async (data) => UserLeavesServer(socket, data));

        socket.on('join channel', async (data, cb) => UserJoinsChannelSocket(socket, data, io, channelList, getMediasoupWorker, cb));
        
        socket.on('create channel', async (data, cb) => UserCreatesChannel(socket, data, cb));

        socket.on('disconnect', async (data, cb) => Disconnect(socket, data, channelList, cb));

        // channel sockets
        socket.on('getActiveUsers', async (data, cb) => {});

        socket.on('getProducers', async (data, cb) => GetProducers(socket, data, channelList, cb));

        socket.on('getRouterRtpCapabilities', async (data, cb) => GetRouterRtpCapabilities(socket, data, channelList, cb));

        socket.on('createWebRtcTransport', async (data, cb) => CreateWebRtcTransport(socket, data, channelList, cb));

        socket.on('connectTransport', async (data, cb) => ConnectTransport(socket, data, channelList, cb));

        socket.on('produce', async (data, cb) => Produce(socket, data, channelList, cb));

        socket.on('consume', async (data, cb) => Consume(socket, data, channelList, cb));

        socket.on('getChannelInfo', async (data, cb) => getChannelInfo(socket, data, channelList, cb));

        socket.on('leaves channel', async (data, cb) => UserLeavesChannel(socket, data, channelList, cb));

        socket.on('producerClosed', async (data, cb) => CloseProducer(socket, data, channelList, cb));

        // user status
        socket.on('user status', async (data, cb) => UserStatusSocket(socket, data, cb));
        
    })
    
}

module.exports = {
    onConnection,
}



