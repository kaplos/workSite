import { useState,useEffect, } from 'react'
import Products from './pages/Products';
import Returns from './pages/Returns';
import { BrowserRouter, Routes, Route ,useLocation,useNavigate} from "react-router-dom";
import './App.css'
import NavBar from './components/NavBar';

function App() {
  
  let [tab, setTab] = useState('upload');
  let [objectInfo,setObjectInfo]= useState(null);
    const ENV = import.meta.env;

  
    const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname.substring(1);
    setTab(currentPath);
  }, [location]);

  const handleSearch = async (searchTerm)=>{
    const result = await fetch(`${ENV.VITE_API_URL}/search?page=${tab}&term=${searchTerm}`)
    const data = await result.json()
    console.log(data)
    return data.length ===0? '' : data
  }
  const onClick =async(id)=>{
    console.log('clicked item')
    const getResultFromClickedItem = await fetch(`${ENV.VITE_API_URL}/id?page=${tab}&id=${id}`)
    const data = await getResultFromClickedItem.json();
    console.log(data)
    setObjectInfo(data)
    navigate(`/${tab}`);
  }
  return (
    <div className="w-full h-full flex flex-col bg-gray-200">
      <NavBar tab={tab} setTab={setTab} handleSearch={handleSearch} handleClick={onClick}/>
      <div className='w-full h-full'>
        <Routes>
          <Route path="/upload" element={<Products showUploadDetails={objectInfo} setUploadDetails={setObjectInfo}/>} />
          <Route path="/return" element={<Returns showReturnDetails={objectInfo} setReturnDetails={setObjectInfo}/>} />

        </Routes>
      </div>
    </div>
  )
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}


