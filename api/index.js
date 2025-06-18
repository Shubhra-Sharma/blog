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
import fs from 'fs';
import Post from "./models/Post.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(__dirname + '/uploads'));

const uploadMiddleWare= multer({dest: 'uploads/'});
const salt= bcrypt.genSaltSync(10);
const secretjwt= process.env.JWT_SECRET;


app.use(cors({
  credentials:true,
  origin:process.env.CORS_ORIGIN
}));
app.use(express.json());
// for checking valid token
app.use(cookieParser());
connectDB();

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

app.post('/post', uploadMiddleWare.single('file') ,async (req,res) => {
   const {originalname, path}= req.file;
   //to get the extension name
   const parts= originalname.split('.');
   const ext = parts[parts.length - 1];
   const newPath= path+'.'+ ext;
   fs.renameSync(path, newPath);

   const {token}= req.cookies;
   jwt.verify(token, secretjwt, {}, async (err,info) => {
    if(err) throw err;
    const {title, summary, content} = req.body;
   const postdetails= await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
   });
        
   res.json(postdetails);
  });

});
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

app.listen(4000, () => {
    console.log('Server running on port 4000');
});
