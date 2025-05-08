const ENV = import.meta.env;


export const onClick =async(id)=>{
    console.log('clicked item')
    const getResultFromClickedItem = await fetch(`${ENV.VITE_API_URL}/id?page=${tab}&id=${id}`)
    const data = await getResultFromClickedItem.json();
    console.log(data)
    setObjectInfo(data)
    if(tab==='upload'){
    
      navigate(`/productManager`);
      console.log('Handling click in upload tab');
    }else{

      navigate(`/${tab}`);
    }
  }