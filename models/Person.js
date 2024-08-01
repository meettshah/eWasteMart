import mongoose, { Schema, model, models } from "mongoose";

const PersonSchema = new Schema({
    name: { type: String, required: true, },
    birthdate: { type: String, required: true },
    height: { type: Number, required: true },
    aadhar: { type: String, required: true },
    pan: { type: String, required: true },
    images: [{ type: String }],
    act: { type: String, required: true },
    section: { type: String, required: true },
    crime: { type: String, required: true },
    address: { type: String, required: true, },
    parent_name: { type: String, required: true },
    identification_mark: { type: String, required: true },
    educational_qualification: { type: String, required: true },
    gender: { type: String, required: true },
}, {
    timestamps: true,
})

PersonSchema.index({name: 'text', section: 'text', crime: 'text'});

export const Person = models.Person || model('Person', PersonSchema);