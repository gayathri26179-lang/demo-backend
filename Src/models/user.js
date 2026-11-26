const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["admin", "mentor", "user", "student"],
            default: "user",
            required: true
        },
        adminrole: {
            type: String,
            enum: [
                "Student",
                "Intern",
                "Technical Team",
                "Admin",
                "Manager",
                "Staff Member"
            ],
            default: "Student"
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        address: {
            type: String,
            trim: true,
            default: ""
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        companyName: {
            type: String,
            trim: true,
            default: ""
        },
        specialization: {
            type: String,
            trim: true,
            default: ""
        },
        assignedCourse: {
            type: String,
            trim: true,
            default: ""
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
