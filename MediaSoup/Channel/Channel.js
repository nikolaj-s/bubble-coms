
const config = require('../../Config/config');
const Bot = require('../Bot/Bot');

module.exports = class Channel {
    constructor(channel_id, worker, io) {
        this.id = channel_id
        
        const mediaCodecs = config.mediasoup.router.mediaCodecs;
        
        worker.createRouter({
            mediaCodecs
        }).then(function (router) {
            
            this.router = router;

        }.bind(this)
        )
        
        this.peers = new Map();

        this.io = io;

        this.social = []

        this.songs = []

        this.bot = new Bot(channel_id, io);
    }

    cleanUp() {
        if (this.peers.size === 0 || this.bot.song_queue.length === 0) {
            clearInterval(this.bot.interval);
        }
    }

    getPeersSocketByUsername(username) {
        for (const peer of this.peers) {
            if (peer[1].username === username) {
                return peer[1].id;
            }
        }
    }

    addPeer(peer) {
        
        this.peers.set(peer.id, peer)
    
    }

    getProducerListForPeer() {

        let producerList = [];

        this.peers.forEach((peer) => {
            peer.producers.forEach((producer) => {
                producerList.push({
                    producer_id: producer.id,
                    user: peer.returnUser()
                })
            })
        })
        
        return producerList;
    }
    getUserDetails() {
        const users = [];

        for (const [key, user] of this.peers.entries()) {
            users.push(user.returnUser());
        }
        
        return users;
        
    }
    getRtpCapabilities() {
        return this.router.rtpCapabilities;
    }

    async createWebRtcTransport(socket_id) {

        const { maxIncomingBitrate, initialAvailableOutgoingBitRate } = config.mediasoup.webRtcTransport;

        const transport = await this.router.createWebRtcTransport({
            listenIps: config.mediasoup.webRtcTransport.listenIps,
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitRate
        })

        if (maxIncomingBitrate) {
            try {
                await transport.setMaxIncomingBitrate(maxIncomingBitrate);
            } catch (error) {
                console.log(error)
            }
        }


        transport.on(
            'dtlsstatechange',
            function (dtlsState) {
                if (dtlsState === 'closed') {
                    console.log("transport closed");
                    transport.close();
                }
            }.bind(this)
        )

        transport.on(
            'close',
            () => {
                // add functionality to alert disconnection from transport
                console.log("disconnection from transport")
            }
        )

        this.peers.get(socket_id).addTransport(transport);

        return {
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        }
    }

    async connectPeerTransport(socket_id, transport_id, dtlsParameters) {
        // if user is already in the channel dont add him again
        if (!this.peers.has(socket_id)) return;

        await this.peers.get(socket_id).connectTransport(transport_id, dtlsParameters);
    }

    async produce(socket_id, producerTransportId, rtpParameters, kind) {
        // handle undefined errors
        return new Promise(
            async function(resolve, reject) {
                let producer = await this.peers.get(socket_id).createProducer(producerTransportId, rtpParameters, kind)
                
                resolve(producer.id)

                this.broadCast(socket_id, 'newProducers', [
                    {
                        producer_id: producer.id,
                        producer_socket_id: socket_id,
                        user: this.peers.get(socket_id).returnUser()
                    }
                ])
            }.bind(this)

        )
    }

    async consume(socket_id, consumer_transport_id, producer_id, rtpCapabilities) {
        // handle null values
        console.log(producer_id, rtpCapabilities)
        if (!this.router.canConsume({producerId: producer_id, rtpCapabilities})) {
            console.error('can not consume')

            return {error: true, errorMessage: "Receiving Error"}
        }

        let { consumer, params } = await this.peers
        .get(socket_id)
        .createConsumer(consumer_transport_id, producer_id, rtpCapabilities)

        consumer.on(
            'producerclose',
            function() {

                console.log('Consumer closed due to producerclose event')

                this.peers.get(socket_id).removeConsumer(consumer.id)
                // tell client consumer has died
                this.io.to(this.id).emit('consumerclosed', {
                    consumer_id: consumer.id
                })

            }.bind(this)    
        )


        return params;
    }

    async removePeer(socket_id) {
        try {
            this.peers.get(socket_id).close()

            this.peers.delete(socket_id)

            this.io.to(socket_id).emit('removedfromchannel', {
                message: "You have been disconnected"
            })
        } catch (error) {
            console.log("User Not In Channel")
            
            this.io.to(socket_id).emit('removedfromchannel', {
                message: "You have been disconnected"
            })
        }
    }

    closeProducer(socket_id, producer_id) {
        this.peers.get(socket_id).closeProducer(producer_id)
    }

    broadCast(socket_id, name, data) {
        for (let otherID of Array.from(this.peers.keys()).filter((id) => id !== socket_id)) {
            this.send(otherID, name, data)
        }
    }

    send(socket_id, name, data) {
        this.io.to(socket_id).emit(name, data)
    }

    getPeers() {
        return this.peers;
    }

    toJson() {
        return {
            id: this.id,
            peers: JSON.stringify([...this.peers])
        }
    }

    pushMessage(message) {
        this.social.unshift(message);
    }

}