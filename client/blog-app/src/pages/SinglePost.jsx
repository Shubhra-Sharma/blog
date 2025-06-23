import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function SinglePost(){
    const [postInfo, setPostInfo] = useState(null);
    const {id} = useParams();
    
    useEffect(() => {
      fetch(`http://localhost:4000/post/${id}`)
      .then(response => {
        response.json().then(postInfo => {
            setPostInfo(postInfo);
        });
      })
      .catch(error => {
        console.error('Error fetching post:', error);
      });
    }, [id]);

    if(!postInfo) return '';
    
    return (
        <div className="post-page">
            <div className="image">
                <img src={`http://localhost:4000/${postInfo.cover}`} alt="image" />
            </div>
            <h1>{postInfo.title}</h1>
            <div className='content' dangerouslySetInnerHTML={{__html: postInfo.content}}/>
        </div>
    );
}