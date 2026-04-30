const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ensure directories exist
const cardsDir = path.join(__dirname, 'public', 'cards');
const devCardsDir = path.join(__dirname, 'public', 'dev_cards');

if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });
if (!fs.existsSync(devCardsDir)) fs.mkdirSync(devCardsDir, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save directly to public/cards
        cb(null, cardsDir);
    },
    filename: (req, file, cb) => {
        // Filename will be determined by the 'cardId' field in the body
        // But multer processes file before body sometimes?
        // Actually, we'll name it temp first, then rename it
        const tempName = `temp_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, tempName);
    }
});

const upload = multer({ storage });

app.post('/upload-card-image', (req, res) => {
    return res.status(403).json({
        error: 'Card image upload is disabled. Static assets are the source of truth.'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads will be saved to: ${cardsDir}`);
});
