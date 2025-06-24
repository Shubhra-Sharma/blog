import Post from "../Post";
import { useState, useEffect } from "react";
import Hero from './Hero';
export default function Home(){
    const[posts, setPosts] = useState([]);
    useEffect(() => {
      fetch('https://blog-production-896e.up.railway.app/post').then(response => {
        response.json().then(posts => {
            setPosts(posts);
        });
      })
    }, []);
    return(
      <>
      <Hero/>
      <div className="text">
        Welcome to ByteScript where every line of code has a story, a lesson, a breakthrough, or a bug that taught us more than a tutorial ever could. This platform is a space for developers, learners, and tech lovers to share knowledge, experiences, and their thoughts on technological advancements.
      </div>
     <div>
       {posts.length>0 && posts.map(post => (
        <Post key={post._id} {...post} />
       )

       )}
     </div>
     </>
    );
}