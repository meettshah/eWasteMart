const { Schema, models, model, default: mongoose } = require("mongoose");

const CrimeScheme = new Schema({
    act: [{type: String, required: true}],
    section: [{type: Number, required: true}],
    crime: {type: String, required: true},
    description: {type: String, required: true},
});

export const Crime = models.Crime || model('Crime', CrimeScheme);