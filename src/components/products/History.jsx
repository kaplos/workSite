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

  <div className='w-full md:w-80 h-auto md:h-screen bg-white shadow-lg flex flex-col border-b md:border-b-0 md:border-r border-gray-200'>
    <div className='flex flex-col w-full justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'>
      <div className='flex flex-row gap-3 items-center justify-between'>
        <h1 className="font-bold text-base md:text-lg text-gray-800" >{buttonMode==='default' ? 'History' : 'Unrefunded Returns'}</h1>
        {collectionName=='products' ?
          <button className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base ${isDisabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-md'}`}
          onClick={ handleAddProducts }
          disabled={isDisabled}> Done
        </button>
        :
          <button className={`px-3 md:px-4 py-2 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:shadow-md text-sm md:text-base`}
          onClick={buttonMode==='default' ? handleCheckUnRefunded : handleRevertUnrefunded }
          disabled={false}
          > {buttonMode==='default' ? 'Unrefunded' : 'Done'}
        </button>
        }
      </div>
    
    {buttonMode ==='done'?
      <span className="text-sm text-gray-600 mt-2">Total: {unrefunded}</span>:null
    }
    </div>
  
  <div className="flex flex-col w-full p-3 md:p-4 gap-3 overflow-y-auto h-48 md:h-full bg-gray-50">
    {showInformation.length > 0 ? (
      showInformation.sort((a, b) => new Date(b.create_at) - new Date(a.create_at))
      .map((item, index) => (
        renderCard(item, index)
        // <ProductCard product={product} index={index} handleDelete={handleDelete} handleClick={handleClick}/>
      ))
    ) : (
      <div className="text-center py-6 md:py-8">
        <div className="mx-auto w-12 md:w-16 h-12 md:h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 md:mb-4">
          <svg className="w-6 md:w-8 h-6 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium text-sm md:text-base">{`No ${collectionName} available`}</p>
      </div>
    )}
  </div>
</div>
  )
}