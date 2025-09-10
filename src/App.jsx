import { useState,useEffect, } from 'react'
import Products from './pages/Products';
import Returns from './pages/Returns';
import ProductManager from './pages/ProductManager';
import NavBar from './components/NavBar';
import { BrowserRouter, Routes, Route ,useLocation,useNavigate} from "react-router-dom";
import './App.css'
import { Navigate } from "react-router-dom";
import { MessageProvider } from './components/Messages/MessageContext';
import MessageBox from './components/Messages/MessageBox';
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
    const result = await fetch(`${ENV.VITE_API_URL}/search?term=${searchTerm}`)
    const data = await result.json()
    console.log(data, 'data for call')
    return data.length===0? '' : data
  }
const onClick =async(id,type)=>{
    console.log('clicked item')
    const getResultFromClickedItem = await fetch(`${ENV.VITE_API_URL}/id?page=${type}&id=${id}`)
    const data = await getResultFromClickedItem.json();
    console.log(data)
    setObjectInfo(data)
    if(type==='upload'){
    
      navigate(`/productManager`);
      console.log('Handling click in upload tab');
    }else{

      navigate(`/${type}`);
    }
  }
  return (
   
   <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <NavBar tab={tab} setTab={setTab} handleSearch={handleSearch} handleClick={onClick}/>
      <div className='w-full h-full'>
        <Routes >
          <Route path="/upload" element={<Products />} />
          <Route path="/return" element={<Returns showReturnDetails={objectInfo} setReturnDetails={setObjectInfo}/>} />
          <Route path="/productManager" element={<ProductManager showProductDetails={objectInfo} setShowProductDetails={setObjectInfo} />} />
          <Route path="/" element={<Navigate to="/return" />}/>

        </Routes>
      </div>
    </div>
  )
}

export default function AppWrapper() {
  return (
    <MessageProvider>
        <MessageBox/>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </MessageProvider>
  );
}


