const ENV = import.meta.env;
import {useEffect, useState,useRef} from 'react';
import ProductCard from './ProductCard';
import ReturnCard from '../returns/ReturnsCard';
import { useMessage } from '../Messages/MessageContext';

export default function History({collectionName,collection,handleDelete,handleClick}) {
  console.log(collection ,'products in history');  
  const [isDisabled, setIsDisabled] = useState(collection.length===0);
  const [showInformation,setShowInformation] = useState([]);
  const [buttonMode,setButtonMode] = useState('default');
  const [cardClicked, setCardClicked] = useState(false);
  const unrefunded = showInformation.length
  const {showMessage} = useMessage()
  console.log(unrefunded,'unrefunded amount')
  // const historyRef = useRef(null);
  // const historyButtonRef = useRef(null);
  const handleAddProducts = async ()=>{
    console.log('request send ' ,localStorage.getItem('products'));
    try{
      let response = await fetch(`${ENV.VITE_API_URL}/addProducts`,{
      method:"POST",
      headers:{
        'Content-Type': 'application/json',
      },
      body: localStorage.getItem('products'),
    })
    let data = await response.json();
    console.log(data, "data from server in history");
    if(data.success){
      localStorage.setItem('products',JSON.stringify([]));
      window.location.reload();

    }
  }catch(error){
    console.error(error,'failed to add products')
    showMessage(error)
  }
  }
  const handleCheckUnRefunded = async() =>{
    // if(buttonMode==='unrefunded'){
    //   handleCheckUnRefunded();
    //   return;
    // }
    try{


    let response = await fetch(`${ENV.VITE_API_URL}/getUnrefunded`,{
      method:"GET",
      headers:{
        'Content-Type': 'application/json',
      },
    })
    let data = await response.json();
    console.log(data, "data from server for unrefunded");

    setShowInformation(data);
    setButtonMode('unrefunded')
  }catch(error){
    console.error('error fetching Unrefundeds',error)
    showMessage('Something Went Wrong Fetching Unrefundeds')
  }

    // historyRef.current.textContent = " Unrefunded Returns"
    // historyButtonRef.current.textContent = "Done"
    // historyButtonRef.current.onclick = handleRevertUnrefunded;
    // localStorage.setItem('unrefunded',JSON.stringify(data));
  }

  const handleRevertUnrefunded = async() => {

      setButtonMode('default');
      setShowInformation(collection);
      // historyRef.current.textContent = "History"
      // historyButtonRef.current.textContent = "Unrefunded";

    console.log('Reverting unrefunded items...');

  }
  const handleClickCard = (item) => {
    setCardClicked(item.id);
    // setCardClicked(item);
    console.log(item, "item clicked");
    handleClick(item);
  }

  useEffect(()=>{
      setIsDisabled(collection.length===0);
      setShowInformation(collection);
  },[collection])

  const renderCard = (item, index) => {

    switch (collectionName) {
      case 'products':
        return <ProductCard product={item} index={index} handleDelete={handleDelete} handleClick={handleClickCard} cardClicked={cardClicked}/>;
      case 'returns':
        return <ReturnCard ret={item} index={index} handleDelete={handleDelete} handleClick={handleClickCard} cardClicked={cardClicked}/>;
      default:
        return null;
    }
  };

return( 

  <div className='w-auto h-screen border-r-2 border-black flex flex-col gap-2'>
    <div className='flex flex-col w-full justify-between items-end p-4 border-b-2 border-gray-300 '>
      <div className='flex flex-row gap-2 items-center '>
        <h1 className="font-bold text-lg " >{buttonMode==='default' ? 'History' : 'Unrefunded Returns'}</h1>
        {collectionName=='products' ?
          <button className={`border-2 border-blue-500 p-2 rounded-lg bg-blue-500 ${isDisabled ? 'opacity-50' : 'bg-blue-500'}`}
          onClick={ handleAddProducts }
          disabled={isDisabled}> Done
        </button>
        :
          <button className={`border-2 border-blue-500 p-2 rounded-lg bg-blue-500`}
          onClick={buttonMode==='default' ? handleCheckUnRefunded : handleRevertUnrefunded }
          disabled={false}
          > {buttonMode==='default' ? 'Unrefunded' : 'Done'}
        </button>
        }
      </div>
    
    {buttonMode ==='done'?
      <span className="justify-self-end">Total: {unrefunded}</span>:null
    }
    </div>
  
  <div className="flex flex-col w-full p-4 gap-2 overflow-y-auto h-full">
    {showInformation.length > 0 ? (
      showInformation.sort((a, b) => new Date(b.create_at) - new Date(a.create_at))
      .map((item, index) => (
        renderCard(item, index)
        // <ProductCard product={product} index={index} handleDelete={handleDelete} handleClick={handleClick}/>
      ))
    ) : (
      <p>{`No ${collectionName} available`}</p>
    )}
  </div>
</div>
  )
}