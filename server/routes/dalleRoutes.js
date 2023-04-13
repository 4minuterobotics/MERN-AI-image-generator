import express from "express";
import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const dalleRoutes = express.Router();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//this dummy route was created to see if we had a connection with open AI by going to localhost:8080/api/v1/dalle
dalleRoutes.route("/").get((req, res) => {
	res.send("Hello from dalle!");
	console.log("connected to dalle");
});

//this is the actual post to be sent to dalle for it to interpret and use to send an image back
dalleRoutes.route("/").post(async (req, res) => {
	try {
		//this prompt will come from the front end side
		const { prompt } = req.body;

		//this will generate the image. n is the number of images
		const aiResponse = await openai.createImage({
			prompt,
			n: 1,
			size: "1024x1024",
			response_format: "b64_json",
		});

		//this will get the image from the AI reponse.
		const image = aiResponse.data.data[0].b64_json;

		//this will pass the photo that was just saved as "image" as the response back to the user in json
		res.status(200).json({ photo: image });
	} catch (error) {
		res.status(500).send(error?.response.data.error.message);
	}
});
export default dalleRoutes;
