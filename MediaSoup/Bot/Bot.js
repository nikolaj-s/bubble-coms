

module.exports = class Bot {
    constructor(channel_id = "", socket, updateStatus) {

        this.song_queue = [];

        this.timer = 0;

        this.socket = socket;

        this.channel_id = channel_id;

        this.server_id = channel_id.split('/')[0];

        this.local_channel_id = channel_id.split('/')[1];

        this.playing = false;

        this.interval = null;

        this.sendUpdate = (data) => {
            console.log(data)
            updateStatus(data)
        }

    }

    removeSongFromQueue(song, user) {
        const index = this.song_queue.findIndex(s => s._id === song._id);

        if (index === -1) return;

        this.song_queue.splice(index, 1);

        this.socket.to(this.channel_id).emit('music-widget/song-removed', {song: song, user: user});
    }

    togglePlaying(bool, user) {
        if (this.song_queue.length === 0) return;

        this.playing = bool;

        this.socket.to(this.channel_id).emit('music-widget/toggle-playing', {playing: this.playing, user: user})
        
        if (bool === false && this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        } else if (bool === true) {
            this.initTimer();
        }

    }

    pushNewSong(data, user) {

        if (this.song_queue.length === 0 && this.playing === false) {
            this.playing = true;    
        }

        if (this.song_queue.length === 0) {
            this.sendUpdate(`Playing: ${data.title}`);
        }

        this.song_queue.push(data);

        this.socket.to(this.channel_id).emit('music-widget/new-song', {song: data, user: user})

        if (!this.interval) {
            this.initTimer();
        }
    }

    skipSong(user) {

        this.song_queue.shift();

        this.socket.to(this.channel_id).emit('music-widget/skipped-song', {skipped: true, user: user})

        this.timer = 0

        if (this.song_queue.length === 0) {

            this.sendUpdate(false);

            clearInterval(this.interval);
            this.interval = null;
        } else {
            this.sendUpdate(`Playing: ${this.song_queue[0].title}`)
        }
    
    }

    returnCurrentTime() {
        return this.timer;
    }

    trackTime() {
        try {
            this.timer = this.timer += 5;

            console.log(this.timer)

            if (this.timer >= (this.song_queue[0]?.duration + 10)) {

                console.log(this.timer, 'skipping song')

                this.skipSong();

                this.timer = 0;
            }

            if (this.song_queue.length === 0) {

                clearInterval(this.interval);
                
                this.interval = null;
            }
        } catch (error) {
            console.log(error);

            clearInterval(this.interval);

            this.interval = null;

            this.timer = null;
        }
    }

    initTimer() {
        if (this.interval) {
            clearInterval(this.interval);

            this.interval = null;
        }

        this.interval = setInterval(this.trackTime.bind(this), 5100);
    }

    returnCurrentMusicInfo() {

        const queue = this.song_queue.map((song, i) => {
            if (i === 0) {
                return {...song, current: this.timer + 2}
            } else {
                return song;
            }
        })

        return {
            queue: queue,
            playing: this.playing,
        }
    }

}