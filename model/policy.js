const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Health', 'Finance', 'Infrastructure', 'Emergency', 'Other']
    },
    status: {
        type: String,
        enum: ['active', 'draft', 'archived'],
        default: 'active'
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperAdmin'
    }
}, { timestamps: true });

module.exports = mongoose.model("Policy", policySchema);
