import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PageLoadingScreen } from './components';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { willLogo } from './assets';

const LazyHome = React.lazy(() => import('./pages/Home'));
const LazyCreatePost = React.lazy(() => import('./pages/CreatePost'));

const currentBackendDomain = import.meta.env.VITE_VERCEL_DOMAIN;

const App = () => {
	return (
		<BrowserRouter>
			<ToastContainer position='bottom-center' limit={1} />
			<header className='w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]'>
				<div>
					<Link to='/'>
						<img src={willLogo} alt='logo' className='w-16 object-contain' />
						<span className='font-bold text-[#222328] text-[25px] whitespace-nowrap'> Drew It</span>
					</Link>
				</div>
				<div className='flex justify-between'>
					<Link to='/create-post' className='front-medium bg-[#6469ff] text-white px-4 py-2 rounded-md'>
						Create
					</Link>
				</div>
			</header>

			<main className='sm:p-8 px-4 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]'>
				<Routes>
					<Route
						path='/'
						element={
							<React.Suspense fallback={<PageLoadingScreen />}>
								<LazyHome backendDomain={currentBackendDomain} />
							</React.Suspense>
						}
					/>
					<Route
						path='/create-post'
						element={
							<React.Suspense fallback={<PageLoadingScreen />}>
								<LazyCreatePost backendDomain={currentBackendDomain} />
							</React.Suspense>
						}
					/>
				</Routes>
			</main>
		</BrowserRouter>
	);
};

export default App;
