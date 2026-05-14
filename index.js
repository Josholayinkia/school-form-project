const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

const port = process.env.PORT || 4999;
const dburl = process.env.MONGO_URI;
    
const connectDB = async () => {
    try {  
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        await mongoose.connect(dburl);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Define the Provider Schema and model
const providerSchema = new mongoose.Schema({
    fullName:{
            type: String,
            required: true,
            trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    skillCategory: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    address: {
        type: String,
    },
    isAdmitted: {
        type: Boolean,
        default: false,
    },
},
{timestamps: true}
);

const Provider = mongoose.model('Provider', providerSchema);

// Route to add a new student

// POST /providers — create a new provider
app.post("/providers", async (req, res) => {
  const { fullName, email, phoneNumber, skillCategory, gender, address } = req.body;

  try {
    if (!fullName || !email || !phoneNumber) {
      return res.status(400).json({ message: "fullName, email, and phoneNumber are required" });
    }
 // Duplicate email check — 409 Conflict
    const existing = await Provider.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Profile already exists with this email." });
    }

    const newProvider = new Provider({
      fullName,
      email,
      phoneNumber,
      skillCategory,
      gender,
      address
    });
    await newProvider.save();
    return res.status(201).json(newProvider);
  } catch (error) {
    console.error('Error creating provider:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Global Error Handling Middleware 
//  404 - unknown routes
app.use((req,res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// 500 - server errors
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: "something went wrong on the server" });
});

// Start the server after connecting to the database
app.listen(port, () => {
    console.log(`GigFlow API is running on port ${port}`);
});
 