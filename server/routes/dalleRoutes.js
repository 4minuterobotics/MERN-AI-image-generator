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

dalleRoutes.route('/').post(generateLimiter, async (req, res) => {
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
			res.status(200).json({ photo: base64Image });
		} else {
			throw new Error(`${response.status}`);
		}
	} catch (error) {
		console.error('dalle generate error:', error?.response?.status || error.message);
		res.status(500).json({
			error: 'Image generation failed. Try a different prompt.',
		});
	}
});

export default dalleRoutes;
