import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import dbConnect from './config/db.js'
import multer from 'multer'
import { fileUploads } from './src/fileUpload.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors({
  origin: 'https://file-upload-ui-pbfw.vercel.app'
}))
app.use(express.json())

export const db = dbConnect()

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const uploads = multer({ storage })

app.post('/upload', 
    uploads.single("file"),
    async (req, res) => {
        try {
            const result = await fileUploads(req.file);
            res.status(200).json({ message: 'File uploaded successfully', data: result });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }
)

app.get('/uploads', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, file_name, status, processed_rows FROM jobs ORDER BY id DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename)
  const uploadPath = path.join(uploadsDir, filename)

  res.download(uploadPath, filename, (err) => {
    if (err) {
      console.error('Download error:', err)
      if (!res.headersSent) {
        res.status(404).json({ error: 'File not found' })
      }
    }
  })
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})