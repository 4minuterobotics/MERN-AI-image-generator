import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

import { generateLimiter, cleanString } from '../middleware/security.js';

dotenv.config();

const dalleRoutes = express.Router();

const PROMPT_MAX = 500;
const PROMPT_MIN = 1;

dalleRoutes.route('/').get((req, res) => {
	res.send('Hello from dalle!');
});

// Map Stability AI upstream status codes to user-friendly messages.
const UPSTREAM_ERROR_MESSAGES = {
	400: 'Prompt was rejected. Try rephrasing.',
	401: 'Image service authentication failed.',
	402: 'Image service is over its billing limit. Try again later.',
	403: 'Prompt was blocked by content moderation. Try a different one.',
	413: 'Prompt is too large.',
	429: 'Image service is busy. Try again in a moment.',
	500: 'Image service had an internal error. Try again.',
	503: 'Image service is temporarily unavailable.',
};

dalleRoutes.route('/').post(generateLimiter, async (req, res) => {
	if (!process.env.STABILITY_API_KEY) {
		console.error('dalle: STABILITY_API_KEY env var is missing');
		return res.status(503).json({ error: 'Image generation is not configured.', upstreamStatus: 0 });
	}

	try {
		const promptRaw = req.body?.prompt;

		if (typeof promptRaw !== 'string') {
			return res.status(400).json({ error: 'Prompt must be a string.' });
		}

		const prompt = cleanString(promptRaw);

		if (prompt.length < PROMPT_MIN || prompt.length > PROMPT_MAX) {
			return res.status(400).json({ error: `Prompt must be ${PROMPT_MIN}-${PROMPT_MAX} characters.` });
		}

		const payload = {
			prompt,
			output_format: 'jpeg',
		};

		const response = await axios.postForm('https://api.stability.ai/v2beta/stable-image/generate/sd3', axios.toFormData(payload, new FormData()), {
			validateStatus: undefined,
			responseType: 'arraybuffer',
			headers: {
				Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
				Accept: 'image/*',
			},
		});

		if (response.status === 200) {
			const base64Image = Buffer.from(response.data).toString('base64');
			return res.status(200).json({ photo: base64Image });
		}

		// Non-200 from Stability. Try to surface what they actually said.
		let upstreamBody = '';
		try {
			upstreamBody = Buffer.from(response.data).toString('utf8').slice(0, 500);
		} catch (_) {}

		console.error('stability upstream non-200:', response.status, upstreamBody);

		const clientMessage = UPSTREAM_ERROR_MESSAGES[response.status] || 'Image generation failed. Try a different prompt.';
		return res.status(502).json({
			error: clientMessage,
			upstreamStatus: response.status,
		});
	} catch (error) {
		console.error('dalle generate error:', error?.message);
		return res.status(500).json({
			error: 'Image generation failed unexpectedly.',
		});
	}
});

export default dalleRoutes;
