import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async'
import { AppState } from '../contexts/AppState';
import { preview } from "../assets";
import { getRandomPrompt } from "../utils";
import { FormField, Loader, PageAnimation } from "../components";
const CreatePost = () => {
	const navigate = useNavigate(); // this will allow us to navigate back to the home page one the post is created
	const [form, setForm] = useState({
		name: "",
		prompt: "",
		photo: "",
	});
	const [generatingImg, setGeneratingImg] = useState(false); // will be used while making contact with the api and waiting to get the image back
	const [loading, setLoading] = useState(false);

	const {state, dispatch: ctxDispatch} = useContext(AppState)
	const {userInfo} = state;

	//function that sends prompt to back end
	const generateImage = async () => {
		if (form.prompt) {
			//if we have a promt
			try {
				setGeneratingImg(true); //set the image generating state to be true

				// code to send a post request to the dalle back end
				// http://localhost:8081/api/v1/dalle for local developer backend 
				// https://mern-image-generator-backend.onrender.com/api/v1/dalle for remote backend
				const response = await fetch("https://mern-image-generator-backend.onrender.com/api/v1/dalle", { 
					// go to this api and submit the following info
					method: "POST", //method type
					headers: {
						"Content-Type": "application/json", //content type being passed
					},
					body: JSON.stringify({ prompt: form.prompt }), //convert body of the post into a json string
				});

				//parse the photo data from the backend set the data received back from the post to equal "data"
				const data = await response.json();

				//update the form on the page, which is a state changing function. This will cause the generated picture to render!
				setForm({ ...form, photo: `data:image/jpeg;base64,${data.photo}` });
			} catch (error) {
				toast.error('Try a different prompt.'); 
			} finally {
				setGeneratingImg(false);
			}
		} else {
			toast.error('Please enter a prompt.');
		}
	};

	//function that takes the generated form data and submits it to the back end
	//since it's doing data fetching, make it asyncronous
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (form.prompt && form.photo) {
			//check to see if the form has a prompt and photo before continuing
			setLoading(true); //state changing function. changing this causes the "generate" button to re-render saying "generating..."
			try {

				// send post request to the following api, containing the following parameters
				// http://localhost:8081/api/v1/post for local backend
				// https://mern-image-generator-backend.onrender.com/api/v1/post for remote backend
				const response = await fetch("https://mern-image-generator-backend.onrender.com/api/v1/post", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(form),
				});
				await response.json(); //this means we got the response successfuly
				navigate("/"); //navigate back to the home page
			} catch (error) {
				toast.error("Try re-freshing the page.");
			} finally {
				setLoading(false);
			}
		} else {
			toast.error("You haven't generated an image yet."); //this alert pops up if the submit button is hit but no prompt or image is yet generated
		}
	};

	//sends data from the form on the front end to the back end
	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSurpriseMe = () => {
		const randomPrompt = getRandomPrompt(form.prompt);
		setForm({ ...form, prompt: randomPrompt });
	};

	const imageGeneratorHandler = () => {
		if (userInfo){
			generateImage();
		} else {
			navigate('/signin')
		}
	}
	return (
		<>
			<Helmet> <title> Create an Image </title> </Helmet>
			<PageAnimation>
				<section className="max-w-7xl mx-auto">
					<div>
						<div>
							<h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
							<p className="mt-2 text-[#666e75] text-[16px] max-w-[500px]">
								Create imaginative and visually stunning images generated by DALL-E AI and share them with the community
							</p>
						</div>
					</div>
					<form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-5">
							{/* These 2 input fields are always visible */}
							<FormField
								LabelName="Your Name"
								type="text"
								name="name"
								placeholder="John Doe"
								value={form.name}
								handleChange={handleChange}
							/>
							<FormField
								LabelName="Prompt"
								type="text"
								name="prompt"
								placeholder="A white horse smoking a cigar"
								value={form.prompt}
								handleChange={handleChange}
								isSurpriseMe
								handleSurpriseMe={handleSurpriseMe}
							/>

							{/* in this section, if no picture has been generated, a dummy blank photo will show, 
							is visible. If a picture is currently being generated, a loading animation svg will appear 
							over it. If a pic has been generated, the pic will show.    */}
							<div className="relative bg-gray-50 boder border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
								{form.photo ? (
									<img src={form.photo} alt={form.prompt} className="w-full h-full object-contain" />
								) : (
									<img src={preview} alt="preview" className="w-9/12 object-contain" />
								)}

								{generatingImg && (
									<div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
										<Loader />
									</div>
								)}
							</div>
						</div>

						{/* this button is always visible, either saying generating... or generate. It sends the prompt to 
						dalle on the back end. */}
						<div className="mt-5 flex gap-5">
							<button
								type="button"
								onClick={imageGeneratorHandler}
								className="text-white bg-green-700 font-md rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
							>
								{generatingImg ? "Generating..." : "Generate"}
							</button>
						</div>

						<div className="mt-10">
							<p className="mt-2 text-[#666e75] text-[14px]">
								Once you have created the image you want, you can share it with others in the community.
							</p>

							{/* This button will submit the generated form (pic, prompt, and name) to cloudinary and mongodb.
							The pic is uploaded on cloudinary and given a url. The name, prompt, and url are posted to mongodb.  */}
							<button
								type="submit"
								className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
							>
								{loading ? "Sharing..." : "Share with the community"}
							</button>
						</div>
					</form>
				</section>
			</PageAnimation>
		</>	
	);
};

export default CreatePost;
