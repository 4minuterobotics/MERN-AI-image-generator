import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';
import { postLimiter, cleanString } from '../middleware/security.js';

dotenv.config();

const postRoutes = express.Router();

const NAME_MAX = 100;
const PROMPT_MAX = 500;
const PHOTO_MAX_BYTES = 11_000_000; // ~8 MB raw image after base64 inflation
const PAGE_LIMIT_DEFAULT = 50;
const PAGE_LIMIT_MAX = 100;

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

cloudinary.config({
	cloud_name: CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/v1/post?limit=50&skip=0 — newest first, paginated.
postRoutes.route('/').get(async (req, res) => {
	try {
		const limitRaw = parseInt(req.query.limit, 10);
		const skipRaw = parseInt(req.query.skip, 10);
		const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, PAGE_LIMIT_MAX) : PAGE_LIMIT_DEFAULT;
		const skip = Number.isFinite(skipRaw) && skipRaw >= 0 ? skipRaw : 0;

		const posts = await Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);

		res.status(200).json({ success: true, data: posts, limit, skip });
	} catch (error) {
		console.error('post list error:', error?.message);
		res.status(500).json({ success: false, error: 'Failed to load posts.' });
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

		if (!CLOUD_NAME) {
			console.error('post create: CLOUDINARY_CLOUD_NAME env var is missing');
			return res.status(503).json({ success: false, error: 'Image storage is not configured.' });
		}

		// Cloudinary-side enforcement: refuse anything that's not a recognized
		// image format. Defends against polyglot uploads that get past the
		// `data:image/` prefix check on our side.
		const photoUrl = await cloudinary.uploader.upload(photo, {
			resource_type: 'image',
			allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
		});

		const newPost = await Post.create({
			name,
			prompt,
			photo: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/t_drew-it-optimization/${photoUrl.public_id}.png`,
		});

		res.status(201).json({ success: true, data: newPost });
	} catch (error) {
		console.error('post create error:', error?.message);
		res.status(500).json({ success: false, error: 'Failed to save post.' });
	}
});

export default postRoutes;
