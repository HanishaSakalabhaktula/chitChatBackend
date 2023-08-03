const router = require('express').Router();
const User = require('../Models/UserModel');
const bcrypt = require('bcrypt');

//sign up a user
router.post('/signup', async (req, res) => {
    try {
        const {name, email, password, picture} = req.body;

        const exists = await User.findOne({email});
        if(exists){
            return res.status(400).json({error: "User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const user = await User.create({name, email, password: hashPassword, picture});
        res.status(201).json(user);
    } catch (error) {
        let msg;
        if(error.code == 11000){
            msg = "User already exists"
        }else{
            msg = error.message
        }

        res.status(400).json(msg);
    }
})

//login user
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(400).json({error: "Invalid email or password"});
        }
        const match = await bcrypt.compare(password, user.password);

        if(!match){
            return res.status(401).json({error: "Invalid email or password"});
        }
        user.status = 'online';
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        console.log(e);
        res.status(400).json(e.message);
    }
})

//edit user
router.patch('/edit', async (req, res) => {
    try {

        const {id, name, email, picture} = req.body;
        console.log(name)
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({error: "Invalid email or password"});
        }

        const updatedUser = await User.findByIdAndUpdate({_id: id}, {
            $set : {
                name: name,
                picture: picture,
                email: email
            }
        })
        if(!updatedUser){
            return res.status(400).json({message: "Couldnot Update"});
        }
        res.status(200).json(updatedUser);
        
    } catch (e) {
        res.status(400).json(e.message);
    }
})


module.exports = router;