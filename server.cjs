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

app.post('/upload-card-image', upload.single('image'), (req, res) => {
    try {
        const { cardId } = req.body;
        const file = req.file;

        if (!cardId || !file) {
            return res.status(400).json({ error: 'Missing cardId or image file' });
        }

        const ext = path.extname(file.originalname);
        const newFilename = `${cardId}${ext}`; // e.g. "105.png"
        const targetPath = path.join(cardsDir, newFilename);

        // Rename/Move the temp file to the final path
        fs.renameSync(file.path, targetPath);

        // Also clean up any other extensions for this card? 
        // (e.g. if we had 105.jpg and now upload 105.png, we should probably delete 105.jpg to avoid confusion, 
        // but for now let's just overwrite)

        console.log(`Updated image for Card ${cardId}: ${newFilename}`);

        res.json({
            success: true,
            filename: newFilename,
            url: `/cards/${newFilename}`
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads will be saved to: ${cardsDir}`);
});
