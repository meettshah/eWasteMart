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
        // Optional because Google OAuth users won't have a password
        required: false,
    },
    role: {
        type: String,
        enum: ["pending", "user", "bulk_seller", "recycler", "enterprise"],
        default: "pending",
    },
<<<<<<< HEAD
    tokenBalance: {
        type: Number,
        min: 0,
        default: 100000,
    },
=======
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    verifyToken: String,
    verifyTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    companyName: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    paymentDetails: {
        upiId: { type: String, default: "" },
        bankAccount: { type: String, default: "" }
    },
    preferences: {
        email: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true }
    }
>>>>>>> 7b313d6bd5c597c85af9548a1948d498a8b8bb86
},
{
    timestamps: true,
}
);

const Login = models.Login || model('Login', LoginSchema);

export default Login;
