

export default function ProductCard({product,handleDelete,index,handleClick}) {
return(
    <div key={index} 
    
        className='flex flex-row w-full justify-between p-4 border-2 border-black rounded-lg '>
          <div
            onClick={() => handleClick(product)}
            className="flex flex-col w-[85%] ">
              <h1>Sku:</h1>
              <h1>{product.sku}</h1>
              <h1></h1>
              <h1>{`${product.images.length} photos`}</h1>
          </div>
          <div className="flex justify-center items-center">
            
            <button className="p-2 bg-red-500 rounded-lg text-white" onClick={() => handleDelete(index)}>X</button>
          </div>
        </div>
)
}