import jwt  from "jsonwebtoken";
import User from "../Models/User.model.js";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const Register = async (req, res) => {
    try {
        const { username, email, password, batch, regulation, university } = req.body;
        const existingUser = await User.findOne({ email});
        if( existingUser ){
            return res.status(400).json({ message: "User already exists" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            batch,
            regulation,
            university
        })
    
        return res.status(201).json({
            token: generateToken(user._id),
            message: "User registered successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not Found...!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            batch: user.batch,
            regulation: user.regulation,
            university: user.university,
            token: generateToken(user._id),
            message: "User logged in successfully"
        });
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" });
    }
}

export const GetUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}