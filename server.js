require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middleware
app.use(express.json());
app.use(cors());

// 2. Models
const Startup = require('./models/Startup');
const Investor = require('./models/Investor');

// 3. Connect to MongoDB
const DB_URI = process.env.MONGODB_URI;
mongoose.connect(DB_URI)
  .then(() => console.log("SUCCESS: Connected to MongoDB Atlas!"))
  .catch((err) => console.error("ERROR: Connection failed", err));

// --- ROUTES ---

// A. Seed Data Route (Keep for testing)
app.get('/add-smart', async (req, res) => {
    try {
        const diverseStartups = [
            { name: "FinTech Flow", industry: "FinTech", fundingGoal: 300000, engagementScore: 95 },
            { name: "Eco Builders", industry: "Sustainability", fundingGoal: 100000, engagementScore: 10 },
            { name: "Neuro AI", industry: "AI", fundingGoal: 900000, engagementScore: 60 },
            { name: "Swift Pay", industry: "FinTech", fundingGoal: 50000, engagementScore: 2 },
            { name: "EduStream", industry: "EdTech", fundingGoal: 400000, engagementScore: 80 }
        ];
        await Startup.insertMany(diverseStartups);
        res.send("✅ Diverse startups added!");
    } catch (err) { res.status(500).send("Error: " + err); }
});

// B. Startup Registration
app.post('/api/register/startup', async (req, res) => {
    try {
        const newStartup = new Startup({ ...req.body, engagementScore: 0 });
        await newStartup.save();
        res.status(201).json({ message: "Startup Registered!", data: newStartup });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// C. Investor Auth
app.post('/api/investor/register', async (req, res) => {
    try {
        const newInvestor = new Investor(req.body);
        await newInvestor.save();
        res.status(201).json(newInvestor);
    } catch (err) { res.status(400).json({ error: "Email exists or invalid data" }); }
});

app.post('/api/investor/login', async (req, res) => {
    try {
        const investor = await Investor.findOne({ email: req.body.email });
        if (investor) res.json(investor);
        else res.status(404).json({ error: "Email not found" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// SECTION 1: ESTABLISHED STARTUPS (Older than 7 days OR High Engagement)
app.get('/api/startups/all/:investorId', async (req, res) => {
    try {
        let investorInterests = ['AI', 'FinTech'];
        if (req.params.investorId !== 'guest') {
            const investor = await Investor.findById(req.params.investorId);
            if (investor) investorInterests = investor.interests;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // LOGIC: Show if OLDER than 7 days OR if it has HIGH engagement (Graduated early)
        let establishedStartups = await Startup.find({
            $or: [
                { createdAt: { $lt: sevenDaysAgo } },
                { engagementScore: { $gt: 20 } }
            ]
        });

        const results = establishedStartups.map(startup => {
            let dnaScore = investorInterests.includes(startup.industry) ? 60 : 0;
            let popularityScore = Math.min(startup.engagementScore * 2, 40); 
            return { ...startup._doc, matchScore: (dnaScore + popularityScore).toFixed(1), logicTag: "Verified Hybrid" };
        });

        results.sort((a, b) => b.matchScore - a.matchScore);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// SECTION 2: NEW & RISING (Strictly New AND Low Engagement)
app.get('/api/startups/new/:investorId', async (req, res) => {
    try {
        let investorInterests = ['AI', 'FinTech'];
        if (req.params.investorId !== 'guest') {
            const investor = await Investor.findById(req.params.investorId);
            if (investor) investorInterests = investor.interests;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // LOGIC: MUST be New (>= 7 days ago) AND MUST NOT be Graduated (<= 20 engagement)
        let newStartups = await Startup.find({ 
            createdAt: { $gte: sevenDaysAgo },
            engagementScore: { $lte: 20 } 
        });

        const results = newStartups.map(startup => {
            let dnaScore = investorInterests.includes(startup.industry) ? 95 : 20;
            return { ...startup._doc, matchScore: (dnaScore + (Math.random() * 2)).toFixed(1), logicTag: "DNA Potential" };
        });

        results.sort((a, b) => b.matchScore - a.matchScore);
        res.json(results);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// F. Engagement Route (The "Interested" Button)
app.patch('/api/startups/interest/:id', async (req, res) => {
    try {
        const startup = await Startup.findByIdAndUpdate(
            req.params.id, 
            { $inc: { engagementScore: 5 } }, 
            { new: true }
        );
        res.json({ message: "Interest recorded!", newScore: startup.engagementScore });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server live on http://localhost:${PORT}`));