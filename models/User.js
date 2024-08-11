import mongoose, { Schema, model, models } from "mongoose"

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Must provide a name."],
    },
    email: {
        type: String,
        required: [true, "Must provide an email."],
        unique: [true, "Must be unique."],
    },
    password: {
        type: String,
        required: [true, "Must provide a password."],
    },
    role: {
        type: String,
        enum: ["user", "recycler", "corporate"],
        default: "user",
    },
},
{
    timestamps: true,
}
);

const User = models.User || model('User', UserSchema);

export default User;