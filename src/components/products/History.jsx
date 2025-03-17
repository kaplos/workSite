const ENV = import.meta.env;
import {useEffect, useState} from 'react';
import ProductCard from './ProductCard';
import ReturnCard from '../returns/ReturnsCard';

export default function History({collectionName,collection,handleDelete,handleClick}) {
  console.log(collection ,'products in history');  
  const [isDisabled, setIsDisabled] = useState(collection.length===0);
  
  const handleAddProducts = async ()=>{
    console.log('request send ' ,localStorage.getItem('products'));
    let response = await fetch(`${ENV.VITE_API_URL}/addProducts`,{
      method:"POST",
      headers:{
        'Content-Type': 'application/json',
      },
      body: localStorage.getItem('products'),
    })
    let data = await response.json();
    console.log(data, "data from server in history");
    // if(data.success){
    //   localStorage.setItem('products',JSON.stringify([]));
    //   window.location.reload();
    // }
  }

  useEffect(()=>{
      setIsDisabled(collection.length===0);
  },[collection])

  const renderCard = (item, index) => {

    switch (collectionName) {
      case 'products':
        return <ProductCard product={item} index={index} handleDelete={handleDelete} handleClick={handleClick} />;
      case 'returns':
        return <ReturnCard ret={item} index={index} handleDelete={handleDelete} handleClick={handleClick} />;
      default:
        return null;
    }
  };
return( 

  <div className='w-72 h-screen border-r-2 border-black flex flex-col gap-2'>
  <div className='flex flex-row w-full justify-between items-center p-4 border-b-2 border-gray-300'>
    <h1 className="font-bold text-lg ">History</h1>
    {collectionName=='products' ? <button className={`border-2 border-blue-500 p-2 rounded-lg bg-blue-500 ${isDisabled ? 'opacity-50' : 'bg-blue-500'}`}
    onClick={handleAddProducts}
    disabled={isDisabled}>Done</button>:''}
  </div>
  <div className="flex flex-col w-full p-4 gap-2 overflow-y-auto h-full">
    {collection.length > 0 ? (
      collection.map((item, index) => (
        renderCard(item, index)
        // <ProductCard product={product} index={index} handleDelete={handleDelete} handleClick={handleClick}/>
      ))
    ) : (
      <p>{`No ${collection} available`}</p>
    )}
  </div>
</div>
)
}