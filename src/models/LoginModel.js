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
        enum: ["user", "bulk_seller", "recycler", "enterprise"],
        default: "user",
    },
    tokenBalance: {
        type: Number,
        min: 0,
        default: 100000,
    },
},
{
    timestamps: true,
}
);

const Login = models.Login || model('Login', LoginSchema);

export default Login;
