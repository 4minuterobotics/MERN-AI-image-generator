import React, { useContext } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PageLoadingScreen } from './components';
import { AppState } from './contexts/AppState';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { willLogo } from './assets';

// USING LAZY LOADING INSTEAD!!
// import { Home, CreatePost, SignIn, SignUp } from "./pages";

//Imports for lazy loading pages
const LazyHome = React.lazy(() => import('./pages/Home'));
const LazyCreatePost = React.lazy(() => import('./pages/CreatePost'));
const LazySignIn = React.lazy(() => import('./pages/SignIn'));
const LazySignUp = React.lazy(() => import('./pages/SignUp'));

const backendDomains = {
	render: 'https://mern-image-generator-backend.onrender.com',
	vercel: 'https://mern-ai-image-generator-backend.vercel.app',
	local: 'http://localhost:8081',
};

// const currentBackendDomain = backendDomains.local;
const currentBackendDomain = import.meta.env.VITE_LOCAL_DOMAIN;

const App = () => {
	const { state, dispatch: ctxDispatch } = useContext(AppState);
	const { userInfo } = state;

	const signoutHandler = () => {
		ctxDispatch({ type: 'USER_SIGNOUT' });
		localStorage.removeItem('userInfo');
		window.location.href = '/signin';
	};

	return (
		<BrowserRouter>
			<ToastContainer position='bottom-center' limit={1} />
			{/* navbar */}
			<header className='w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]'>
				<div>
					<Link to='/'>
						<img src={willLogo} alt='logo' className='w-16 object-contain' />
						<span className='font-bold text-[#222328] text-[25px] whitespace-nowrap'> Drew It</span>
					</Link>
				</div>
				<div className='flex justify-between'>
					{userInfo ? (
						<Link to='#signout' className='text-black px-4 mx-6 py-2 whitespace-nowrap' onClick={signoutHandler}>
							{' '}
							Sign Out{' '}
						</Link>
					) : (
						<Link to='/signin' className='text-black px-4 mx-6 py-2 whitespace-nowrap'>
							{' '}
							Sign In{' '}
						</Link>
					)}

					<Link to='/create-post' className='front-medium bg-[#6469ff] text-white px-4 py-2 rounded-md'>
						Create
					</Link>
				</div>
			</header>

			<main className='sm:p-8 px-4 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]'>
				<Routes key={location.pathname} location={location}>
					<Route
						path='/'
						element={
							<React.Suspense fallback={<PageLoadingScreen />}>
								{' '}
								<LazyHome backendDomain={currentBackendDomain} />{' '}
							</React.Suspense>
						}
					/>
					<Route
						path='/create-post'
						element={
							<React.Suspense fallback={<PageLoadingScreen />}>
								{' '}
								<LazyCreatePost backendDomain={currentBackendDomain} />{' '}
							</React.Suspense>
						}
					/>
					<Route
						path='/signin'
						element={
							<React.Suspense fallback={<PageLoadingScreen />}>
								{' '}
								<LazySignIn backendDomain={currentBackendDomain} />{' '}
							</React.Suspense>
						}
					/>
					<Route
						path='/signup'
						element={
							<React.Suspense fallback={<PageLoadingScreen />}>
								{' '}
								<LazySignUp backendDomain={currentBackendDomain} />{' '}
							</React.Suspense>
						}
					/>

					{/* non-lazy loading routing method below */}
					{/* <Route path="/signup" element={<SignUp />} /> */}
				</Routes>
			</main>
		</BrowserRouter>
	);
};

export default App;
