import {Link} from "react-router-dom";
import {format} from 'date-fns';
import './Post.css'
function Post({_id, title, summary, cover, content, createdAt, author}){
  return(
    <div className='blog'>
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/'+cover} alt={title}/>
        </Link>
      </div>
      <div className="content">
        <div>
          <Link to={`/post/${_id}`}>
            <h2>{title}</h2>
          </Link>
          <p className="info">
            <span className="author">{author.username}</span>
            <time>
              {createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : 'No date'}
            </time>
          </p>
          <p className='description'>{summary}</p>
        </div>
      </div>
    </div>
  );
}

export default Post;