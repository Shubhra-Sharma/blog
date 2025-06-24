import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from '../config';
export default function SinglePost(){
    const [postInfo, setPostInfo] = useState(null);
    const {id} = useParams();
    
    useEffect(() => {
      fetch(`${config.API_URL}/post/${id}`)
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
                <img src={`${postInfo.cover}`} alt="image" />
            </div>
            <h1>{postInfo.title}</h1>
            <div className='content' dangerouslySetInnerHTML={{__html: postInfo.content}}/>
        </div>
    );
}