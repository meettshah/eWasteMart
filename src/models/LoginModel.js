import mongoose, { Schema, model, models } from "mongoose"

const LoginSchema = new Schema({
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

const Login = models.Login || model('Login', LoginSchema);

export default Login;