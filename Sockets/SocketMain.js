

const AddWidgetToChannel = require('./Server/ChannelSocket/AddWidgetToChannel');
const CloseProducer = require('./Server/ChannelSocket/CloseProducer');
const ConnectTransport = require('./Server/ChannelSocket/ConnectTransport');
const Consume = require('./Server/ChannelSocket/Consume');
const CreateWebRtcTransport = require('./Server/ChannelSocket/CreateWebRtcTransport');
const DeleteChannel = require('./Server/ChannelSocket/DeleteChannel');
const DeleteMessage = require('./Server/Social/DeleteMessage');
const getChannelInfo = require('./Server/ChannelSocket/GetChannelInfo');
const GetProducers = require('./Server/ChannelSocket/GetProducers');
const GetRouterRtpCapabilities = require('./Server/ChannelSocket/GetRouterRtpCapabilities');
const MessageSocket = require('./Server/Social/MessageSocket');
const MoveUserSocket = require('./Server/ChannelSocket/MoveUserSocket');
const Produce = require('./Server/ChannelSocket/Produce');
const ReOrganizeChannels = require('./Server/ChannelSocket/ReOrganizeChannels');
const UpdateChannel = require('./Server/ChannelSocket/UpdateChannel');
const UserCreatesChannel = require('./Server/ChannelSocket/UserCreatesChannel');
const UserJoinsChannelSocket = require('./Server/ChannelSocket/UserJoinsChannelSocket');
const UserLeavesChannel = require('./Server/ChannelSocket/UserLeavesChannelSocket');
const checkConnection = require('./Server/Connection/CheckConnection');
const ConnectionDropped = require('./Server/Connection/ConnectionDropped');
const AddSongToQueue = require('./Server/MusicWidget/AddSongToQueue');
const FetchCurrentMusic = require('./Server/MusicWidget/FetchCurrentMusic');
const SkipSong = require('./Server/MusicWidget/SkipSong');
const TogglePlayingMusic = require('./Server/MusicWidget/TogglePlayingMusic');
const WidgetOverlaySocket = require('./Server/RoomOverlayActions/WidgetOverlaySocket');
const UpdateServer = require('./Server/Settings/UpdateServer');
const UpdateServerGroups = require('./Server/Settings/UpdateServerGroups');
const KickUserSocket = require('./Server/User/KickUserSocket');
const PokeUserSocket = require('./Server/User/PokeUserSocket');
const UserActiveStatus = require('./Server/User/UserActiveStatus');
const UserStatusSocket = require('./Server/User/UserStatusSocket');
const assignServerGroup = require('./Server/UserActivitySocket/AssignServerGroup');
const Disconnect = require('./Server/UserActivitySocket/Disconnect');
const userJoinsServer = require('./Server/UserActivitySocket/UserJoinsServerSocket');
const UserLeavesServer = require('./Server/UserActivitySocket/UserLeavesServer');
const SocketValidation = require('./Validation/SocketValidation');
const TogglePinMessage = require('./Server/Social/TogglePinMessage');
const PauseConsumer = require('./Server/ChannelSocket/PauseConsumer');
const ResumeConsumer = require('./Server/ChannelSocket/ResumeConsumer');
const DeleteImageSearchData = require('./Server/Social/DeleteImageSearchData');
const BanUserSocket = require('./Server/User/BanUserSocket');
const UnBanUserSocket = require('./Server/User/UnBanUserSocket');
const LikeSong = require('./Server/MusicWidget/LikeSong');
const UnLikeSong = require('./Server/MusicWidget/UnLikeSong');
const RemoveSongFromQueue = require('./Server/MusicWidget/RemoveSongFromQueue');
const UserUpdatesAccount = require('./Server/User/UserUpdatesAccount');
const SearchSongs = require('./Server/MusicWidget/SearchSongs');
const DirectMessage = require('./Server/User/DirectMessage');
const FetchMessages = require('./Server/Social/FetchMessages');
const FetchPinnedMessages = require('./Server/Social/FetchPinnedMessages');
const FetchScreenShots = require('./Server/Social/FetchScreenShots');
const FetchActivityFeed = require('./Server/ActivityFeed/FetchActivityFeed');

const channelList = new Map();

const serverList = new Map();

const onConnection = async (server, workers, workerIndex, getMediasoupWorker) => {

    const io = require('socket.io')(server, {cors: {origin: "*"}})

    io.use(function(socket, next) {
        return SocketValidation(socket, next)
    })
    .on('connection', async (socket) => {
        
        // server sockets
        socket.on('joined server', async (data, cb) => userJoinsServer(socket, data, channelList, serverList, cb, io));

        socket.on('left server', async (data, cb) => UserLeavesServer(socket, data, channelList, serverList, cb));

        socket.on('join channel', async (data, cb) => UserJoinsChannelSocket(socket, data, io, channelList, getMediasoupWorker, cb));
        
        socket.on('create channel', async (data, cb) => UserCreatesChannel(socket, data, cb));

        socket.on('disconnect', async (data, cb) => UserLeavesServer(socket, data, channelList, serverList, cb));
        
        socket.on('update server', async (data, cb) => UpdateServer(socket, data, cb));

        socket.on('update server groups', async (data, cb) => UpdateServerGroups(socket, data, cb));

        socket.on('assign server group', async (data, cb) => assignServerGroup(socket, data, cb));

        socket.on('clear image search data', async (data, cb) => DeleteImageSearchData(socket, data, cb));

        socket.on('update member file', async (data, cb) => UserUpdatesAccount(socket, data, cb, channelList, serverList));

        socket.on('fetch activity feed', async (data, cb) => FetchActivityFeed(socket, cb));

        // channel sockets
    
        socket.on('getProducers', async (data, cb) => GetProducers(socket, data, channelList, cb));

        socket.on('getRouterRtpCapabilities', async (data, cb) => GetRouterRtpCapabilities(socket, data, channelList, cb));

        socket.on('createWebRtcTransport', async (data, cb) => CreateWebRtcTransport(socket, data, channelList, cb));

        socket.on('connectTransport', async (data, cb) => ConnectTransport(socket, data, channelList, cb));

        socket.on('produce', async (data, cb) => Produce(socket, data, channelList, cb));

        socket.on('consume', async (data, cb) => Consume(socket, data, channelList, cb));

        socket.on('getChannelInfo', async (data, cb) => getChannelInfo(socket, data, channelList, cb));

        socket.on('leaves channel', async (data, cb) => UserLeavesChannel(socket, data, channelList, cb));

        socket.on('producerClosed', async (data, cb) => CloseProducer(socket, data, channelList, cb));

        socket.on('pauseConsumer', async (data, cb) => PauseConsumer(socket, data, cb, channelList));

        socket.on('resumeConsumer', async (data, cb) => ResumeConsumer(socket, data, cb, channelList));

        socket.on('add widget to channel', async (data, cb) => AddWidgetToChannel(socket, data, cb));

        socket.on('update channel', async (data, cb) => UpdateChannel(socket, data, cb));
        
        socket.on('delete channel', async (data, cb) => DeleteChannel(socket, data, cb));

        socket.on('move user', async (data, cb) => MoveUserSocket(socket, data, channelList, cb));
        
        socket.on('reorganize channels', async (data, cb) => ReOrganizeChannels(socket, data, cb));

        // social
        socket.on('message', async (data, cb) => MessageSocket(socket, data, channelList, cb));
        
        socket.on('delete message', async (data, cb) => DeleteMessage(socket, data, cb));

        socket.on('toggle pinned message', async (data, cb) => TogglePinMessage(socket, data, cb));

        socket.on('fetch messages', async (data, cb) => FetchMessages(socket, data, cb));

        socket.on('fetch pins', async (data, cb) => FetchPinnedMessages(socket, data, cb));

        socket.on('fetch screen shots', async (data, cb) => FetchScreenShots(socket, data, cb));

        // user status
        socket.on('user status', async (data, cb) => UserStatusSocket(socket, data, channelList, cb));
        
        socket.on('poke', async (data, cb) => PokeUserSocket(socket, data, cb, serverList));

        socket.on('kick', async (data, cb) => KickUserSocket(socket, data, cb, channelList));

        socket.on('update status', async (data, cb) => UserActiveStatus(socket, data, cb, serverList));

        socket.on('ban', async (data, cb) => BanUserSocket(socket, data, cb, serverList));

        socket.on('un ban', async (data, cb) => UnBanUserSocket(socket, data, cb));

        // music bot
        socket.on('remove song from queue', async (data, cb) => RemoveSongFromQueue(socket, data, cb, channelList));

        socket.on('add song to queue', async (data, cb) => AddSongToQueue(socket, data, cb, channelList));

        socket.on('fetch current music info', async (data, cb) => FetchCurrentMusic(socket, data, cb, channelList));

        socket.on('toggle playing music', async (data, cb) => TogglePlayingMusic(socket, data, cb, channelList));

        socket.on('skip song', async (data, cb) => SkipSong(socket, data, cb, channelList));

        socket.on('like song', async (data, cb) => LikeSong(socket, data, cb));

        socket.on('un like song', async (data, cb) => UnLikeSong(socket, data, cb));

        socket.on('search songs', async (data, cb) => SearchSongs(socket, data, cb));

        // widget overlay
        socket.on('widget overlay action', async (data, cb) => WidgetOverlaySocket(socket, data, cb));

        // connection
        socket.on('ping timeout', async (data, cb) => ConnectionDropped(socket, data, channelList, serverList));

        socket.on('transport close', async (data, cb) => ConnectionDropped(socket, data, channelList, serverList));

        socket.on('transport error', async (data, cb) => ConnectionDropped(socket, data, channelList, serverList));

        socket.on('check connection', async (data, cb) => checkConnection(socket, data, cb));
        
        // direct messaging
        socket.on('send direct message', async (data, cb) => DirectMessage(socket, data, serverList, cb));
    })
    
}

module.exports = {
    onConnection,
}



