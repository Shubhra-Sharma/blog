import React, { useState } from 'react';
import ReactQuill from 'react-quill-ver2';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import 'highlight.js/styles/github.css';
import { Navigate } from "react-router-dom";
import config from '../config';
export default function CreatePost(){
    
    const [title,setTitle] = useState(' ');
    const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function createnewPost(ev){
    const data= new FormData();

    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);
// files[0] because even if multiple files are uploaded, only the first one gets picked
  const token = localStorage.getItem('token');
     ev.preventDefault();
        try {
        const response = await fetch(`${config.API_URL}/post`,{
            method: 'POST',
            headers: {
                    'Authorization': `Bearer ${token}`
                },
            body: data,
            credentials: 'include',
        });
        if (response.ok) {
            setRedirect(true);
        } else {
             const errorText = await response.text();
            console.error('Failed to create post:', errorText);
        }
    } catch (error) {
        console.error('Error:', error);
    }

  }
  if(redirect){
    return <Navigate to= {'/'} />
  }
    return (
        <form onSubmit = {createnewPost}>
            <input type= "title" 
            placeholder={'Title'}
            value={title}
             onChange={ev => setTitle(ev.target.value)}
            />
            <input type="summary"
             placeholder={'Summary'}
             value={summary}
             onChange={ev => setSummary(ev.target.value)}
             />
            <input type="file"
            onChange={ev => setFiles(ev.target.files)}
            />
            <ReactQuill
      value={content}
      onChange={newValue => setContent(newValue)}
      theme="snow"
    />
            <button style={{marginTop: '5px'}}>Create Post</button>
        </form>
    )
}