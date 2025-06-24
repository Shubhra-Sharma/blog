import dotenv from "dotenv";
dotenv.config()
import express from 'express';
import cors from 'cors';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import connectDB from "./db/index.js";
import multer from "multer";
import Post from "./models/Post.js";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
const app = express();

app.use(cors({
  credentials:true,
  origin:process.env.CORS_ORIGIN
}));

const salt= bcrypt.genSaltSync(10);
const secretjwt= process.env.JWT_SECRET;
app.use(express.json());
// for checking valid token
app.use(cookieParser());
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const uploadMiddleWare = multer({ storage: storage });

app.post('/post', uploadMiddleWare.single('file'), async (req, res) => {
  const { token } = req.cookies || {};
  if (!token) {
    return res.status(401).json('No token provided');
  }
  jwt.verify(token, secretjwt, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    
    const postdetails = await Post.create({
      title,
      summary,
      content,
      cover: req.file.path,
      author: info.id,
    });
    
    res.json(postdetails);
  });
});


app.post('/register', async (req, res) => {
    const {username,password}=req.body;
    try{
    const userDoc= await User.create({
        username, 
        password: bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
    }catch(e){
    console.log(e);
      res.status(400).json(e);
    }
    console.log("it works");
});


app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  
  try {
    const userdetails = await User.findOne({username});
    
    if (!userdetails) {
      return res.status(400).json('Wrong username or password');
    }
    
    const ans = bcrypt.compareSync(password, userdetails.password);
    
    if (ans) {
      jwt.sign({username, id: userdetails._id}, secretjwt, {}, (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json('Token generation failed');
        }
        res.cookie('token', token).json({
          id: userdetails._id,
          username,
        });
      });
    } else {
      res.status(400).json('Wrong username or password');
    }
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json('Server error: ' + e.message);
  }
});
// An endpoint to check if token is valid or not
app.get('/profile', (req,res) => {
  const {token}=req.cookies;
  if(!token){
    return res.status(401).json('No token');
  }
  jwt.verify(token, secretjwt, {}, (err,info) => {
    if(err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
})

app.get('/post', async (req, res) => {
  res.json(await Post.find()
  .populate("author", "username")
  .sort({createdAt:-1})
);
});

app.get('/post/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const postdetails = await Post.findById(id).populate('author', 'username');
    if (!postdetails) {
      return res.status(404).json({message: 'Post not found'});
    }
    res.json(postdetails);
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
