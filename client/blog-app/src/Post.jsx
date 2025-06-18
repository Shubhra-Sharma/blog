import {Link} from "react-router-dom";
import {format} from 'date-fns';
function Post({_id, title, summary, cover, content, createdAt,author}){
  return(
   <div>
     <div className='blog'>
        <div className="image">
      <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/'+cover} alt=""/>
        </Link>
      </div>
      <div className="content">
        <Link to={`/post/${_id}`}>
      <h2>{title}</h2>
      </Link>
      <p className="info">
        <a className="author">{author.username}</a>
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