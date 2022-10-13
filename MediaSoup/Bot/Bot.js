

module.exports = class Bot {
    constructor(channel_id, socket) {

        this.song_queue = [];

        this.timer = 0;

        this.socket = socket;

        this.channel_id = channel_id;

        this.playing = false;

        this.interval = null;

    }

    togglePlaying(bool) {
        if (this.song_queue.length === 0) return;

        this.playing = bool;

        this.socket.to(this.channel_id).emit('music-widget/toggle-playing', {playing: this.playing})

        if (bool === false && this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        } else if (bool === true) {
            this.initTimer();
        }

    }

    pushNewSong(data) {

        if (this.song_queue.length === 0 && this.playing === false) {
            this.playing = true;
        }

        this.song_queue.push(data);

        this.socket.to(this.channel_id).emit('music-widget/new-song', {song: data})

        if (!this.interval) {
            this.initTimer();
        }
    }

    skipSong() {

        this.song_queue.shift();

        this.socket.to(this.channel_id).emit('music-widget/skipped-song', {skipped: true})

        this.timer = 0

        if (this.song_queue.length === 0) {
            clearInterval(this.interval);
            this.interval = null;
        }
    
    }

    returnCurrentTime() {
        return this.timer;
    }

    trackTime() {
        try {
            this.timer = this.timer += 1;

            if (this.timer === (this.song_queue[0]?.duration + 3)) {
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
        this.interval = setInterval(this.trackTime.bind(this), 1000);
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