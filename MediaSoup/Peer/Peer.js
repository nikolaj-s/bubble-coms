
module.exports = class Peer {
    constructor(socket_id, username, user) {
        this.id = socket_id
        this.username = username
        this.user = user
        this.transports = new Map()
        this.consumers = new Map()
        this.producers = new Map()
    }

    addTransport(transport) {
        this.transports.set(transport.id, transport)
    }

    async connectTransport(transport_id, dtlsParameters) {
        // avoid duplicate transports
        if (!this.transports.has(transport_id)) return;

        await this.transports.get(transport_id).connect({
            dtlsParameters: dtlsParameters
        })
    }

    async createProducer(producerTransportId, rtpParameters, kind) {
        let producer = await this.transports.get(producerTransportId).produce({
            kind,
            rtpParameters
        })

        producer["user"] = this.user.username;

        this.producers.set(producer.id, producer)

        producer.on(
            'transportclose',
            function() {
                console.log('Users producer transport has closed')
                producer.close()
                this.producers.delete(producer.id)
            }.bind(this)
        )

        return producer;
    }

    async createConsumer(consumer_transport_id, producer_id, rtpCapabilities) {
        let consumerTransport = this.transports.get(consumer_transport_id)

        let consumer = null;

        try {
            consumer = await consumerTransport.consume({
                producerId: producer_id,
                rtpCapabilities,
                paused: false
            })
        } catch (error) {
            console.log(error)
            
            return;
        }

        if (consumer.type === 'simulcast') {
            await consumer.setPreferredLayers({
                spatialLayer: 2,
                temporalLayer: 2
            })
        }

        this.consumers.set(consumer.id, consumer)

        consumer.on(
            'transportclose',
            function() {
                console.log('users consumer transport has closed')
                this.consumers.delete(consumer.id)
            }.bind(this)
        )

        return  {
            consumer,
            params: {
                producerId: producer_id,
                id: consumer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
                producerPaused: consumer.producerPaused
            },
            username: this.user.username
        }
    }

    closeProducer(producer_id) {
        try {
            this.producers.get(producer_id).close()
        } catch(error) {
            console.log(error)
        }

        this.producers.delete(producer_id)
    }

    getProducer(producer_id) {
        return this.producers.get(producer_id)
    }

    close() {
        this.transports.forEach((transport) => transport.close())
    }

    removeConsumer(consumer_id) {
        this.consumers.delete(consumer_id);
    }

    returnUser() {
        return this.user;
    }
}