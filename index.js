
const express = require('express');

const mediasoup = require('mediasoup');

const https = require('httpolyglot');

const App = express();

const cors = require('cors');

const dotenv = require('dotenv');

const bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');

const mongoose = require('mongoose');

const morgan = require('morgan');

const fs = require('fs');

const path = require('path');

dotenv.config();

const config = require('./Config/config');

const { createWorkers } = require('./MediaSoup/Worker/Worker');

const { onConnection } = require('./Sockets/SocketMain');

const options = {
    key:   fs.readFileSync(path.join(__dirname + "/server/", config.sslKey), 'utf-8'),
    cert: fs.readFileSync(path.join(__dirname + "/server/", config.sslCrt), 'utf-8')
}

const server = https.createServer(options, App);

// establish connection with database
mongoose.connect(
    process.env.DB_KEY,
    () => {
        console.log('DB Connected');
    }
).catch(error => {
    console.log(error)
})


// workers
let workers = [];
let workerIndex = 0;

;(async () => {
    workers = await createWorkers(workers, workerIndex)
    console.log("Initializing Worker's")
})().then(() => {
    // initialize websocket
    onConnection(server, workers, workerIndex, getMediasoupWorker);
})

function getMediasoupWorker() {
    const worker = workers[workerIndex];

    if (++workerIndex === workers.length) workerIndex = 0;

    return worker;
}

App.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

App.use(morgan('dev'));

App.use(fileUpload({}));

// handle cors

App.set('trust proxy', true);

App.use(bodyParser.json({type: "application/json"}));

App.use(bodyParser.urlencoded({ extended: true }));

// sub routes
const signUp = require('./Routes/Account/SignUp/SignUpRoute');

App.use('/sign-up', signUp);

const signIn = require('./Routes/Account/SignIn/SignInRoute');

App.use('/sign-in', signIn);

const fetchAccount = require('./Routes/Account/FetchAccount/FetchAccountRoute');

App.use('/fetch-account', fetchAccount);

const updateAccount = require('./Routes/Account/UpdateAccount/UpdateAccountRoute');

App.use('/update-account', updateAccount);

const fetchServerList = require('./Routes/Server/FetchServerList/FetchServerListRoute');

App.use('/fetch-server-list', fetchServerList);

const queryServerList = require('./Routes/Server/QueryServerList/QueryServerList');

App.use('/query-server-list', queryServerList);

const fetchServer = require('./Routes/Server/FetchServer/FetchServerRoute');

App.use('/fetch-server', fetchServer);

const joinNewServer = require('./Routes/Server/JoinNewServer/JoinNewServerRoute');

App.use('/join-new-server', joinNewServer);

const createServer = require('./Routes/Server/CreateServer/CreateServerRoute');

App.use('/create-server', createServer);

const FetchReleaseNotes = require('./Routes/Misc/FetchReleaseNotes');

App.use('/fetch-release-notes', FetchReleaseNotes);

const UploadImage = require('./Routes/Misc/UploadImage');

App.use('/upload-image', UploadImage);

const ImageSearchRoute = require('./Routes/ImageSearch/ImageSearchRoute');

App.use('/search-for-images', ImageSearchRoute);

const VideoSearchRoute = require('./Routes/VideoSearch/VideoSearchRoute');

App.use('/search-for-videos', VideoSearchRoute);

const FetchMemberDetails = require('./Routes/Account/FetchMemberDetails/FetchMemberDetails');

App.use('/fetch-member-details', FetchMemberDetails);

const PinMessageToAccount = require('./Routes/Account/PinMessageToAccount/PinMessageToAccount');

App.use('/pin-message', PinMessageToAccount);

const ReorderServers = require('./Routes/Server/ReOrderServers/ReOrderServers');

App.use('/re-order-servers', ReorderServers);

const VerifyAccount = require('./Routes/Account/VerifyAccount/VerifyAccount');

App.use('/verify-account', VerifyAccount);

server.listen(config.listenPort, () => {
    console.log(`server is running on ${config.listenPort}`)
})






