
const { default: fetch } = require("node-fetch");

const { v4: uuidv4} = require('uuid');

const SearchSongs = async (socket, data, cb) => {
    try {

        const query = data.query;

        if (query.length === 0) return cb({error: true, errorMessage: "Cannot search an empty query"});

        const songs = await fetch(`http://10.0.0.38:8000/search-song?query=${query}`)
        .then(response => {
            return response.json();
        })
        .catch(error => {
            return {error: true, errorMessage: "Fatal Error"}
        })  

        if (songs.error) return cb({error: true, errorMessage: songs.errorMessage});

        const mapped = songs.map(song => {
            return {_id: uuidv4(), ...song}
        })

        cb({success: true, songs: mapped});

    } catch (error) {
        cb({error: true, errorMessage: 'No Song Results'})
    }
}

module.exports = SearchSongs;