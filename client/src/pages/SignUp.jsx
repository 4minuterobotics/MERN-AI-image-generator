import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async'
import { AppState } from '../contexts/AppState';
import { toast } from 'react-toastify';
import { PageAnimation } from '../components';

const SignUp = () => {
  const navigate=useNavigate();
  const {search} = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect')
  const redirect = redirectInUrl ? redirectInUrl : '/'

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const {state, dispatch: ctxDispatch} = useContext(AppState);
  const {userInfo} = state;

  const submitHandler = async(e) => {
    e.preventDefault();
    if (password !== confirmPassword){
        toast.error('Passwords do not match')
        return;
    }
    try{

        // http://localhost:8081/api/v1/user/signup for local server  
        // https://mern-image-generator-backend.onrender.com/api/v1/user/signup for render server
        // https://mern-ai-image-generator-backend.vercel.app/api/v1/user/signup for vercel server
        const response = await fetch("https://mern-ai-image-generator-backend.vercel.app/api/v1/user/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
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
        navigate(redirect || '/')
        } else {
            const result = await response.json();
            //alert('Invalid email or password')
            console.log(result)
            toast.error(result.message)
            
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
      <Helmet> <title>Sign Up</title> </Helmet>
      <PageAnimation>
        <Container className = "max-w-2xl">
          <h1 className="my-3 font-bold text-[#222328] text-[20px] text-center">Sign Up</h1>
          <Form onSubmit={submitHandler}>
              <Form.Group className="mb-3" controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control              required     onChange={(e) => setFirstName(e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control              required     onChange={(e) => setLastName(e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" required     onChange={(e) => setEmail(e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" required  onChange={(e) => setPassword(e.target.value)}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control type="password" required  onChange={(e) => setConfirmPassword(e.target.value)}/>
              </Form.Group>
              <div className="mb-3">
                  <Button className="bg-[#6469ff]" variant="primary" type="submit">Sign Up</Button>
              </div>
              <div className="mb-3">Already have an account? {' '}
              <Link to={`/signin?redirect=${redirect}`} className=" font-bold text-blue-600">Sign-In</Link>
              </div>
          </Form>
        </Container>
      </PageAnimation>   
    </>

  )
}

export default SignUp