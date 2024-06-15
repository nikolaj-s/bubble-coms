const axios = require("axios");

const VimeoSearch = async (query) => {
    try {

        if (!query) return {error: true, errorMessage: "Query cannot be empty"};

        const response = await axios.get(`https://api.vimeo.com/videos?query=${query}`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return {error: true, errorMessage: err.message}
        })

        console.log(response);

        if (response.error) return response;

        return [];
    } catch (error) {
        console.log(error);

        return {error: true, errorMessage: "Fatal Error Finding Videos"}
    }
}

module.exports = VimeoSearch;