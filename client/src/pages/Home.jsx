import React, { useState, useEffect, Fragment } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Loader, Card, FormField, PageAnimation } from '../components';

let position = 0;

//this function maps out cards
const RenderCards = ({ data, title }) => {
	console.log('Render homepage 3: began rendering cards with mapping');
	if (data?.length > 0) {
		//each card is mapped, given an id, and given all the values each post has (name, prompt, photo)
		return data.map((post) => <Card key={post._id} {...post} />);
	}
	return <h2 className='mt-5 font-bold text[#6449ff] text-xl uppercase'>{title}</h2>;
};

const Home = (props) => {
	//console.log(allPosts);

	const [loading, setLoading] = useState(false);
	const [allPosts, setAllPosts] = useState([]);

	const [searchText, setSearchText] = useState('');
	const [searchedResults, setSearchedResults] = useState(null);
	const [searchTimeout, setSearchTimeout] = useState(null);

	//upon rendering this component, this function makes a get request to the backend api for all the photos and prompts ever posted in mongo and cloudinary
	useEffect(() => {
		//api that gets data from posts
		const fetchPosts = async () => {
			setLoading(true);
			console.log("state changed. this will cause the page to re-render at 'Starting at top...'");
			console.log('fetching posts');
			try {
				// http://localhost:8081/api/v1/post for local server
				// https://mern-image-generator-backend.onrender.com/api/v1/post for render server
				// https://mern-ai-image-generator-backend.vercel.app/api/vi/post for vercel server
				const response = await fetch(`${props.backendDomain}/api/v1/post`, {
					method: 'GET',
					headers: {
						'Content-Type': 'appplication.json',
					},
				});

				//if there's a response back....
				if (response.ok) {
					const result = await response.json(); //save the response (our posts) as 'result'
					setAllPosts(result.data.reverse()); //call the state function to render the components with their data
				}
			} catch (error) {
				toast.error('Try refreshing the page.');
			} finally {
				setLoading(false);
			}
		};
		fetchPosts();
	}, []); //dependency array is created and left empty, causing this function to only run the first time the component is rendered

	const handleSearchChange = (e) => {
		clearTimeout(searchTimeout);
		setSearchText(e.target.value);
		setSearchTimeout(
			setTimeout(() => {
				const searchedResults = allPosts.filter(
					(item) => item.name.toLowerCase().includes(searchText.toLowerCase()) || item.prompt.toLowerCase().includes(searchText.toLowerCase())
				);
				setSearchedResults(searchedResults);
			}, 500)
		);
	};
	return (
		<>
			<Helmet>
				{' '}
				<title>Drew It - AI Img Gen</title>{' '}
			</Helmet>
			<PageAnimation>
				<section className='max-w-7xl mx-auto'>
					<div>
						<h1 className='font-extrabold text-[#222328] text-[32px]'>Image Generation Made Easy</h1>
						<p className='mt-2 text-[#666e75] text-[16px] max-w-[500px]'>
							In loving memory of my little brother Drew, this website offers the ability to turn a prompt into an image. Take a look at some images people have made by
							sending creative prompts to APIs from DALL-E AI. If you'd like to create an image, sign in or create an account if you don't have one, then navigate to the
							"Create" page using the button to the right. From there, enter your name, a prompt, click generate and wa-la!
						</p>
					</div>
					<div className='mt-16'>
						<FormField LabelName='Search Posts' type='text' name='text' placeholder='Search posts' value={searchText} handleChange={handleSearchChange} />
					</div>

					<div className='mt-10'>
						{loading ? (
							<div className='flex justify-center items-center'>
								<Loader />
							</div>
						) : (
							<>
								{searchText && (
									<h2 className='font-medium text-[#666e75] text-xl mb-3'>
										Showing results for <span className='text-[#222328]'>{searchText}</span>
									</h2>
								)}
								<div className='grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3'>
									{searchText ? <RenderCards data={searchedResults} title='No search results found' /> : <RenderCards data={allPosts} title='No posts found' />}
								</div>
							</>
						)}
					</div>
				</section>
			</PageAnimation>
		</>
	);
};

export default Home;
