const mongoose = require('mongoose');

const InvestorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    interests: [{ type: String }], // Array of interests like ['AI', 'FinTech']
    budget: { type: Number }
});

module.exports = mongoose.model('Investor', InvestorSchema);