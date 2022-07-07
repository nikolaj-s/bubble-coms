
const mediasoup = require('mediasoup');

const config = require("../../Config/config");

const createWorkers = async () => {

    const workers = [];

    let { numWorkers } = config.mediasoup;

    for (let i = 0; i < numWorkers; i++) {

        let worker = await mediasoup.createWorker({
            logLevel: config.mediasoup.worker.logLevel,
            logTags: config.mediasoup.worker.logTags,
            rtcMinPort: config.mediasoup.worker.rtcMinPort,
            rtcMaxPort: config.mediasoup.worker.rtcMaxPort
        })

        worker.on('died', () => {
            setTimeout(() => process.exit(1), 2000)
        })

        workers.push(worker)
        
    }

    return workers;
}

const getWorker = (workers, workerIndx) => {

    if (++workerIndx === workers.length) workerIndx = 0

    return workers[workerIndx]
}


module.exports = {
    createWorkers,
    getWorker
}

