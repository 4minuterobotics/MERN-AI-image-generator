import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify';
import { AppState } from '../contexts/AppState';
import { PageAnimation } from '../components';

const SignIn = () => {
  const navigate=useNavigate();
  const {search} = useLocation();//sets a variable named "search"equal to the search key and value parameters in the long object contaning url info

  //this breaks down the key and values of search paramaters in a URL, then sets the variable "redirectInUrl" equal to the value of the "redirect" key inside the search parameters
  const redirectInUrl = new URLSearchParams(search).get('redirect') 

  //if such a key named 'redirect' exists in the search paramaters, set a new vaiable named 'redirect' equal to that value, otherwise, set 'redirect' to /
  const redirect = redirectInUrl ? redirectInUrl : '/'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const {state, dispatch: ctxDispatch} = useContext(AppState)
  const {userInfo} = state;
  
  const submitHandler = async(e) => {
    e.preventDefault();
    try{
        console.log("signing fetch began")
        // http://localhost:8081/api/v1/user/signin for local server
        // https://mern-image-generator-backend.onrender.com/api/v1/user/signin for remote server
        const response = await fetch("https://mern-image-generator-backend.onrender.com/api/v1/user/signin", {
            method: "POST",
            headers: {
                "Content-Type": "appplication/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
        if (response.ok){
        const data = await response.json(); //this means we got the response successfuly
        console.log("The response received by handle submit was ...");
        console.log(data);
        
        ctxDispatch({type: 'USER_SIGNIN', payload: data})
        localStorage.setItem('userInfo', JSON.stringify(data))
        
        setEmail("");
        setPassword("");

        navigate(redirect || '/')
        } else {
            const result = await response.json();
            //alert('Invalid email or password')
            toast.error(result.message)
            console.log(result)
            console.log(result.message)
        }
    } catch(err){
        console.log("the error was")
        console.log(err)
    }
}

  //this useEffect will prevent me from seeing the sign in page if i'm aleady logged in
  useEffect(() => {
    if(userInfo){
      navigate(redirect)
    }
  }, [navigate, redirect, userInfo]);
  

  return (
    <>
      <Helmet> <title>Sign In</title> </Helmet>
      <PageAnimation>
        <Container className = "max-w-2xl">
          <h1 className="my-3">Sign In</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" required  value={email}  onChange={(e) => setEmail(e.target.value)}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
            </Form.Group>
            <div className="mb-3">
              <Button className="bg-[#6469ff]" variant="primary" type="submit">Sign In</Button>
            </div>
            <div className="mb-3">New customer? {' '}
              <Link to={`/signup?redirect=${redirect}`} className=" font-bold text-blue-600">Create your account</Link>
            </div>
          </Form>
        </Container>
      </PageAnimation>   
    </>
  )
}

export default SignIn