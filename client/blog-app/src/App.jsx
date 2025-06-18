import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import {Route, Routes} from "react-router-dom";
import Layout from './Layout';
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import SinglePost from './pages/SinglePost';
function App() {
  console.log('App component rendering');
  return (
    <UserContextProvider>
    <Routes>
    <Route path='/' element={<Layout/>}>
    <Route index element= {<Home/> } />
    <Route path= '/login' element= {<Login/> } />
    <Route path= '/register' element= {<Register/> } />
    <Route path="/create" element={<CreatePost/>}/>
    <Route path="/post/:id" element={<SinglePost/>}/>
    </Route>
    </Routes>
   </UserContextProvider>
  );
}

export default App;
