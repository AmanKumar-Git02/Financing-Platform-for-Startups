const mongoose = require('mongoose');

const StartupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    industry: { type: String, required: true },
    fundingGoal: { type: Number, required: true },
    description: { type: String },
    engagementScore: { type: Number, default: 0 },
    // This is the CRITICAL part for segregation
    createdAt: { type: Date, default: Date.now } 
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Startup', StartupSchema);