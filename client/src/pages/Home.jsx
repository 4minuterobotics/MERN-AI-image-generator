import React, { useState, useEffect, Fragment } from "react";
import {toast} from 'react-toastify'
import { Loader, Card, FormField } from "../components";

let position = 0;

//this function maps out cards
const RenderCards = ({ data, title }) => {
	console.log("Render homepage 3: began rendering cards with mapping");
	if (data?.length > 0) {
		console.log("the length of data is:");
		console.log(data.length);
		console.log("the value of data is:");
		console.log(data);
		//each card is mapped, given an id, and given all the values each post has (name, prompt, photo)
		return data.map((post) => <Card key={post._id} {...post} />);
	}
	console.log("Render homepage 4: Exiting card mapping");
	return <h2 className="mt-5 font-bold text[#6449ff] text-xl uppercase">{title}</h2>;
};

const Home = () => {
	console.log("Starting at the top of home component");
	//console.log(allPosts);

	const [loading, setLoading] = useState(false);
	const [allPosts, setAllPosts] = useState([]);

	const [searchText, setSearchText] = useState("");
	const [searchedResults, setSearchedResults] = useState(null);
	const [searchTimeout, setSearchTimeout] = useState(null);

	console.log("the value of allPosts is:");
	console.log(allPosts);
	console.log("the length of allPosts is:");
	console.log(allPosts.length);
	//upon rendering this component, this function makes a get request to the backend api for all the photos and prompts ever posted in mongo and cloudinary
	useEffect(() => {
		console.log("began useEffect");
		//api that gets data from posts
		const fetchPosts = async () => {
			setLoading(true);
			console.log("state changed. this will cause the page to re-render at 'Starting at top...'");
			console.log("fetching posts");
			try {

				// http://localhost:8081/api/v1/post for local server
				// https://mern-image-generator-backend.onrender.com/api/v1/post for remote server
				const response = await fetch("https://mern-image-generator-backend.onrender.com/api/v1/post", {
					method: "GET",
					headers: {
						"Content-Type": "appplication.json",
					},
				});

				//if there's a response back....
				if (response.ok) {
					console.log("got something back from fetch");
					const result = await response.json(); //save the response (our posts) as 'result'

					console.log(`we got back the following: ${result}`);

					console.log(result);
					setAllPosts(result.data.reverse()); //call the state function to render the components with their data
				}
			} catch (error) {
				toast.error('Try refreshing the page.')
				console.log(error);
			} finally {
				setLoading(false);
			}
		};
		fetchPosts();
	}, []); //dependency array is created and left empty, causing this function to only run the first time the component is rendered

	const handleSearchChange = (e) => {
		console.log("about to clear a timeout that's currently set to null");
		clearTimeout(searchTimeout);
		console.log("just cleared a timeout that was set to null");
		console.log(e.target.value);
		setSearchText(e.target.value);
		setSearchTimeout(
			setTimeout(() => {
				const searchedResults = allPosts.filter(
					(item) =>
						item.name.toLowerCase().includes(searchText.toLowerCase()) ||
						item.prompt.toLowerCase().includes(searchText.toLowerCase())
				);
				setSearchedResults(searchedResults);
			}, 500)
		);
	};
	console.log("Render homepage start");
	return (
		<section className="max-w-7xl mx-auto">
			<div>
				<h1 className="font-extrabold text-[#222328] text-[32px]">The Community Showcase</h1>
				<p className="mt-2 text-[#666e75] text-[16px] max-w-[500px]">
					Browse through a collection of imaginative and visually stunning images generated with APIs from DALL-E AI.
					To create an image, click the create button at the top of the screen and enter a prompt.
				</p>
			</div>
			<div className="mt-16">
				<FormField
					LabelName="Search Posts"
					type="text"
					name="text"
					placeholder="Search posts"
					value={searchText}
					handleChange={handleSearchChange}
				/>
			</div>

			<div className="mt-10">
				{loading ? (
					<div className="flex justify-center items-center">
						<Loader />
						{console.log("loading state change caused loader to render")}
					</div>
				) : (
					<>
						{searchText && (
							<h2 className="font-medium text-[#666e75] text-xl mb-3">
								Showing results for <span className="text-[#222328]">{searchText}</span>
							</h2>
						)}
						{console.log("Render homepage2: render cards")}
						<div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3">
							{searchText ? (
								<RenderCards data={searchedResults} title="No search results found" />
							) : (
								<RenderCards data={allPosts} title="No posts found" />
							)}
						</div>
					</>
				)}
			</div>
			{console.log("exiting html way at the bottom")}
		</section>
	);
};

export default Home;
