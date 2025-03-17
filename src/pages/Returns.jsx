import React, { useState,useEffect,useRef } from 'react';
import History from '../components/products/History';
import Modal from '../components/products/Modal';
import {useNavigate} from "react-router-dom";

export default function Returns({showReturnDetails,setReturnDetails}) {
    console.log(showReturnDetails,'showReturnDetails')
    // const [trackingNumber, setTrackingNumber] = useState('eajearjryaj');
    // const [orderNumber, setOrderNumber] = useState('aeTjaetj');
    // const [items, setItems] = useState(['RGSD','ASRGRH','arehhae','aetjh','aetjrataj']);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [items, setItems] = useState([]);
    const [submitted, setSubmitted] = useState([]);
    const [returnForm, setReturnForm] = useState([]);
    const [isOpened,setIsOpened] = useState(false);
    const [selectedItem,setSelectedItem] = useState(null);

    const navigate = useNavigate();
    useEffect(()=>{
        if(showReturnDetails){
            setReturnForm(showReturnDetails)
            setTrackingNumber(showReturnDetails.trackingNumber)
            setOrderNumber(showReturnDetails.orderNumber)
            setItems(JSON.parse(showReturnDetails.items))
            console.log(trackingNumber,orderNumber,items,'after clicking an item from search')
            // setIsShowingDetails(true)
        }
        console.log(showReturnDetails)
    },[showReturnDetails])

    const ENV = import.meta.env;

    const TrackingNumberRef = useRef();
    const OrderNumberRef = useRef();
    const ItemsRef = useRef();

    
    useEffect(() => {
        TrackingNumberRef.current.focus();
    }, [])
 
    const removeItem = (index) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(trackingNumber.length ===0 || !orderNumber.length===0 || items.length === 0){
            TrackingNumberRef.current.className = 'border-2 border-red-600  rounded-lg p-2';
            TrackingNumberRef.current.focus();
            return;
        }else if(items.length === 0){
            ItemsRef.current.className = 'border-2 border-red-600  rounded-lg p-2';
            ItemsRef.current.focus();
            return;
        }


        // TrackingNumberRef.current.className = 'border-2 border-black rounded-lg p-2';
        const formData = {
            trackingNumber,
            orderNumber,
            items,
            date: new Date().toLocaleDateString(),
            refunded: false
        };

        setReturnForm({...returnForm,trackingNumber:trackingNumber,orderNumber:orderNumber,items:items,type:"return", });
        
        try {
            const method = showReturnDetails? 'update':'return';
            const response = await fetch(`${ENV.VITE_API_URL}/${method}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(showReturnDetails?returnForm:formData)
            });
            const data = await response.json();
            if(data.success){
                setSubmitted([...submitted, formData]);
                setTrackingNumber('');
                setOrderNumber('');
                setItems([]);
                TrackingNumberRef.current.focus()
            }

        } catch (error) {
            console.error('Error submitting return:', error);
        }
    };
    const handleKeyPress = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef.current.focus();
        }
    };
    const handleClick = (ret) => {
        
        setSelectedItem(ret);
        setIsOpened(true);
        // console.log(product, "product clicked", products[product]);
    
    }
    const renderForm = () =>{
        return (
            <form onSubmit={handleSubmit} className="flex flex-col w-full h-full p-4">
                    <div className="mb-4 flex flex-col">
                        <label htmlFor="tracking-number">Return Tracking Number</label>
                        <input
                            className='border-2 border-black rounded-lg p-2'
                            type="text"
                            id="tracking-number"
                            placeholder="Enter tracking number"
                            value={trackingNumber}
                            ref={TrackingNumberRef}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, ItemsRef)}
                        />
                    </div>
                    <div className="mb-4 flex flex-col">
                        <label htmlFor="order-number">Order Number</label>
                        <input
                            className='border-2 border-black rounded-lg p-2'
                            type="text"
                            id="order-number"
                            placeholder="Enter order number"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                        />
                    </div>
                    <div className="mb-4 flex flex-col">
                        <label htmlFor="items">Items:</label>
                        {items.length > 0 ? (
                            <table className="table-auto border-collapse border border-black">
                                <thead>
                                    <tr>
                                        <th className="border border-black px-4 py-2">Item</th>
                                        <th className="border border-black px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border border-black px-4 py-2">{item}</td>
                                            <td className="border border-black px-4 py-2"><button className='p-2 bg-red-700 text-white rounded-lg ' onClick={()=>removeItem(index)}>x</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : null}

                        <input
                            className={`${showReturnDetails? 'hidden':''} rounded-lg p-2`}
                            type={"text"}
                            id="items"
                            placeholder="Enter item"
                            // value={items}
                            onChange={(e) => console.log(e.target.value)}
                            onKeyDown={(e) => {

                                if(e.key === 'Enter' && !e.target.value.match(/^[0-9]/) && e.target.value !== '') {
                                    e.preventDefault();
                                    setItems([...items, e.target.value]);
                                    e.target.value = '';
                                    handleKeyPress(e, ItemsRef)
                                }else if(e.key === 'Enter' && e.target.value.match(/^[0-9]/)){
                                    e.preventDefault();
                                    handleSubmit(e)
                                    setTrackingNumber(e.target.value);
                                    e.target.value = '';
                                    handleKeyPress(e, ItemsRef);
                                }
                            }}
                            ref={ItemsRef}
                        />
                    </div>

                    <button type={showReturnDetails? "submit":'hidden'} className={"mt-4 bg-blue-500 text-white py-2 px-4 rounded"}>Submit</button>
            </form>
        )
    }
    const rendorViewDetails = () => {
        return (
        <form onSubmit={handleSubmit} className="flex flex-col w-full h-full p-4">

          <div className="flex flex-col w-full h-full p-4">
            
          <div className="mb-4 flex flex-col">
                        <label htmlFor="tracking-number">Return Tracking Number</label>
                        <input
                            className='border-2 border-black rounded-lg p-2'
                            type="text"
                            id="tracking-number"
                            placeholder="Enter tracking number"
                            value={trackingNumber}
                            ref={TrackingNumberRef}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, ItemsRef)}
                        />
                    </div>
                    <div className="mb-4 flex flex-col">
                        <label htmlFor="order-number">Order Number</label>
                        <input
                            className='border-2 border-black rounded-lg p-2'
                            type="text"
                            id="order-number"
                            placeholder="Enter order number"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                        />
                    </div>
            <div className="mb-4 flex flex-col">
              <label htmlFor="items">Items:</label>
              {items.length > 0 ? (
                <table className="table-auto border-collapse border border-black">
                  <thead>
                    <tr>
                      <th className="border border-black px-4 py-2">Item</th>
                      <th className="border border-black px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-black px-4 py-2">
                          <input
                            type="text"
                            value={item}
                            className="border-2 border-black rounded-lg p-2 w-full"
                            onChange={(e) => {
                              const updatedItems = [...items];
                              updatedItems[index] = e.target.value;
                              setItems(updatedItems);
                            }}
                          />
                        </td>
                        <td className="border border-black px-4 py-2">
                          <button
                            className="p-2 bg-red-700 text-white rounded-lg"
                            onClick={() => removeItem(index)}
                          >
                            x
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              <input
                    className={` rounded-lg p-2`}
                    type={"text"}
                    id="items"
                    placeholder="Enter item"
                    // value={items}
                    onChange={(e) => console.log(e.target.value)}
                    onKeyDown={(e) => {

                        if(e.key === 'Enter' && !e.target.value.match(/^[0-9]/) && e.target.value !== '') {
                            e.preventDefault();
                            setItems([...items, e.target.value]);
                            e.target.value = '';
                            handleKeyPress(e, ItemsRef)
                        }else if(e.key === 'Enter' && e.target.value.match(/^[0-9]/)){
                            e.preventDefault();
                            handleSubmit(e)
                            setTrackingNumber(e.target.value);
                            e.target.value = '';
                            handleKeyPress(e, ItemsRef);
                        }
                    }}
                    ref={ItemsRef}
                />
            </div>
            <div className="flex flex-row">
              <div className="mb-4 flex flex-col">
                <label htmlFor="refund-status">Refund Status:</label>
                <select
                  className="border-2 border-black rounded-lg p-2"
                  id="refund-status"
                  value={returnForm.refunded ? 'Refunded' : 'Not Refunded'}
                  onChange={(e) => {
                    setReturnForm({ ...returnForm, refunded: e.target.value === 'Refunded',refunded_At: new Date().toISOString() });
                  }}
                >
                  <option value="Refunded">Refunded</option>
                  <option value="Not Refunded">Not Refunded</option>
                </select>
              </div>
              <div className="mb-4 flex flex-col">
                <label htmlFor="date">Refunded Date:</label>
                <input
                  type="date"
                  className="border-2 border-black rounded-lg p-2"
                  id="date"
                  value={
                    showReturnDetails.refunded
                      ? new Date(showReturnDetails.refunded_At).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    
                    setReturnForm({ ...returnForm, refunded_At: new Date(e.target.value).toISOString() ,refunded:true});

                  }}
                  disabled={!showReturnDetails.refunded}
                />
              </div>
            </div>
          </div>
            <div className="flex flex-row">
                <button type="submit" onClick={() => {
                setReturnDetails(null);
                navigate('/return');
              }} 
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                  cancel
                </button>
                <button type="submit" onClick={()=>{
                    // handleSubmit('updateReturn')
                }} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Submit
                </button>
            </div>
        </form>
        );
    };

    return (
          <div className='flex flex-col w-full h-full bg-gray-200'>
            {/* <h1></h1> */}
            <div className='flex flex-row'>
                {
                    showReturnDetails? 
                        rendorViewDetails() 
                        :
                        <>
                        <History collection={submitted} collectionName={'returns'} handleClick={handleClick} />
                            {renderForm()}
                        </>
                        
                }

                
                {selectedItem &&
                    <Modal isOpened={isOpened} setIsOpened={setIsOpened} selectedProduct={selectedItem} products={items} setProducts={setItems}/>
                }
            </div>
        </div>
    );
}