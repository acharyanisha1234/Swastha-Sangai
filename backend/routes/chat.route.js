import express from 'express';
import {
  createSession,
  getChatHistory,
  sendMessage,
  uploadImage,
  upload
} from '../controllers/chat.controller.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve static images
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

router.post('/session', createSession);
router.get('/history/:sessionId', getChatHistory);
router.post('/message', sendMessage);
router.post('/upload', upload.single('image'), uploadImage);

export default router;