import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';
import { postLimiter, cleanString } from '../middleware/security.js';

dotenv.config();

const postRoutes = express.Router();

const NAME_MAX = 100;
const PROMPT_MAX = 500;
const PHOTO_MAX_BYTES = 11_000_000; // ~8 MB image after base64 inflation; matches 12mb body limit with headroom

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

postRoutes.route('/').get(async (req, res) => {
	try {
		const posts = await Post.find({});
		res.status(200).json({ success: true, data: posts });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to load posts.' });
	}
});

postRoutes.route('/').post(postLimiter, async (req, res) => {
	try {
		const name = cleanString(req.body?.name);
		const prompt = cleanString(req.body?.prompt);
		const photo = req.body?.photo;

		if (name.length === 0 || name.length > NAME_MAX) {
			return res.status(400).json({ success: false, error: `Name must be 1-${NAME_MAX} characters.` });
		}
		if (prompt.length === 0 || prompt.length > PROMPT_MAX) {
			return res.status(400).json({ success: false, error: `Prompt must be 1-${PROMPT_MAX} characters.` });
		}
		if (typeof photo !== 'string' || !photo.startsWith('data:image/')) {
			return res.status(400).json({ success: false, error: 'Invalid photo format.' });
		}
		if (photo.length > PHOTO_MAX_BYTES) {
			return res.status(400).json({ success: false, error: 'Photo too large.' });
		}

		const photoUrl = await cloudinary.uploader.upload(photo);
		const newPost = await Post.create({
			name,
			prompt,
			photo: `http://res.cloudinary.com/doj10wtzk/image/upload/t_drew-it-optimization/${photoUrl.public_id}.png`,
		});

		res.status(201).json({ success: true, data: newPost });
	} catch (error) {
		console.error('post create error:', error?.message);
		res.status(500).json({ success: false, error: 'Failed to save post.' });
	}
});

export default postRoutes;
