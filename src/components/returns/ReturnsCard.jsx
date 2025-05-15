

export default function ReturnsCard({ret,layout, index, handleClick,cardClicked }) {
    // console.log(ret, "return in card");
    return(
        <div key={index} 
            className={`flex flex-row w-full justify-between p-4 border-2 border-black rounded-lg ${cardClicked===ret.id? 'border-blue-500':'border-black'} `}
        >
                <div
                    onClick={() => handleClick(ret)}
                    className="flex flex-col w-[85%] "
                >
                    <h1>Order Number:</h1>
                    <h1>{ret.orderNumber}</h1>
                    <h1></h1>
                    <h1>Tracking Number:</h1>
                    <h1>{ret.trackingNumber}</h1>
                    <h1></h1>
                    {layout === 'open' ? 
                      <>
                        <h1>Items:</h1>
                        <ul>
                            {ret.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul> 
                    </>
                    : ""
                    }
                    
                </div>




              {/* <div className="flex justify-center items-center">
                <button className="p-2 bg-red-500 rounded-lg text-white" onClick={() => handleDelete(index)}>X</button>
              </div> */}
            </div>
    )
    }