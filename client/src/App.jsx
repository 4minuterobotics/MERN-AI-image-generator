import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css';


import { logo } from "./assets";
import { willLogo } from "./assets";
import { drewLogo } from "./assets";

import { Home, CreatePost } from "./pages";
const App = () => {
	return (
		<BrowserRouter>
		<ToastContainer position ="bottom-center" limit={1}/>
			<header className="w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]">
				{/* <Link to="/">
					<img src={logo} alt="logo" className="w-28 object-contain"></img>
				</Link> */}
				{/* <Link to="/">
					<img src={drewLogo} alt="logo" className="w-16 round-image object-contain"></img>
				</Link> */}
				<Link to="/">
					<img src={willLogo} alt="logo" className="w-16 object-contain"/>
					<span className="font-bold text-[#222328] text-[25px]">{' '}Drew It</span>
				</Link>
				<Link to="/create-post" className="front-inter front-medium bg-[#6469ff] text-white px-4 py-2 rounded-md">
					Create
				</Link>
			</header>
			<main className="sm:p-8 px-4 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/create-post" element={<CreatePost />} />
				</Routes>  
			</main>
		</BrowserRouter>
	);
};

export default App;
