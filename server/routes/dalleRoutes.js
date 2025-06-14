import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const dalleRoutes = express.Router();

//this dummy route was created to see if we had a connection with open AI by going to localhost:8080/api/v1/dalle
dalleRoutes.route('/').get((req, res) => {
	res.send('Hello from dalle!');
	console.log('connected to dalle');
});

//this is the actual post to be sent to dalle for it to interpret and use to send an image back
dalleRoutes.route('/').post(async (req, res) => {
	console.log('made it here?');
	try {
		const { prompt } = req.body;

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
			throw new Error(`${response.status}: ${response.data.toString()}`);
		}
	} catch (error) {
		console.error('Error status:', error?.response?.status); // e.g., 400
		console.error('Error headers:', error?.response?.headers); // optional
		console.error('Error data:', error?.response?.data); // 🔍 the most useful part
		console.error('Fallback error message:', error.message); // backup if .response is undefined

		res.status(500).json({
			error: error?.response?.data?.error?.message || error.message || 'Unknown error',
		});
	}
});
export default dalleRoutes;
