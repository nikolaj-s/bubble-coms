const { ReleaseNotes } = require('../../Schemas/ReleaseNotes/ReleaseNotesSchema');
const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.get('/', ValidationMiddleWare, async (req, res) => {
    try {

        const release_notes = await ReleaseNotes.find();

        res.send({success: true, release_notes: release_notes.reverse()});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "fatal error fetching release notes"})
    }
})

module.exports = route;