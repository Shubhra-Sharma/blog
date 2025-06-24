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
const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.CORS_ORIGIN, // Make sure this is your frontend URL
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

const storage = multer.memoryStorage();
const uploadMiddleWare = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  }
});

app.post('/post', uploadMiddleWare.single('file'), async (req, res) => {
  console.log('=== POST REQUEST DEBUG ===');
  console.log('All cookies received:', req.cookies);
  console.log('Headers:', req.headers.cookie);
  console.log('Authorization header:', req.headers.authorization);
  
  // Extract token from cookies OR authorization header
  const token = req.cookies?.token || 
                (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                  ? req.headers.authorization.slice(7) 
                  : null);
  
  console.log('Final token:', token);
  
  if (!token) {
    return res.status(401).json('No token provided');
  }
  jwt.verify(token, secretjwt, {}, async (err, info) => {
    if (err) {
      console.error('JWT error:', err);
      return res.status(401).json('Invalid token');
    }

    if (!req.file) {
      return res.status(400).json('File not found');
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'blog-uploads',
            resource_type: 'image',
            allowed_formats: ['jpg', 'png', 'jpeg']
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.end(req.file.buffer);
      });

      const cloudinaryResult = await uploadPromise;
      const { title, summary, content } = req.body;

      const postdetails = await Post.create({
        title,
        summary,
        content,
        cover: cloudinaryResult.secure_url,
        author: info.id,
      });
      res.json(postdetails);

    } catch (error) {
      res.status(500).json('Server error: ' + error.message);
    }
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
