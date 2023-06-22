import express from "express";
import User from "../mongodb/models/user.js";
import bcrypt from 'bcryptjs'
import { generateLogToken, isAuth } from '../utils.js';




const userRoutes = express.Router();


//*****************************Create User
userRoutes.post('/signup',(async(req, res) => {

    //check if a user with this emai already exists
    let user = await User.findOne({email: req.body.email});
    if (user){
        return res.send("This email address is already taken.");
    }

    //create a new mongoDB user document from the User model
     user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
    }).save(); //.save creates a _id in mongo automatically
    
    //send the user data to the front end.
    res.send(
        {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateLogToken(user), 
    }
    );
}))


//*****************************Login 
userRoutes.post('/signin',(async(req,res) =>{
    const user = await User.findOne({email: req.body.email});
    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            console.log('login data passed to backend successully')
            res.send({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                // password: user.password,
                token: generateLogToken(user),
            });
            return;
        }
    }
    res.status(401).send({message: 'Invalid email or password'})
}))



//*****************************Edit profile
userRoutes.put('/profile', isAuth, (async (req, res) => {
        console.log("entered user profile put request in backend")
        const user = await User.findById(req.user._id);

    if (user) {
        console.log("Logged in user:")
        console.log(user)
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 10)
        }

        const updatedUser = await user.save();
        console.log(updatedUser)
        res.send({

            _id: updatedUser._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            token: generateLogToken(updatedUser)
        })

            
        } else {
            res.status(404).send({message:'User not found'})
        }
    })
)

export default userRoutes;
