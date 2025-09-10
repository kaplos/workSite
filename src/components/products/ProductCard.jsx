
export default function ProductCard({product,handleDelete,index,handleClick,cardClicked}) {
console.log(product, "product in card",cardClicked);
  return(
    <div key={index} 
        className={`flex flex-row w-full justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${cardClicked===product.id? 'border-blue-400 bg-blue-50 shadow-md':'border-gray-200 bg-white hover:border-gray-300'} `}>
          <div
            onClick={() => handleClick(product)}
            className="flex flex-col flex-1 space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">SKU:</h3>
              <p className="text-gray-900 font-mono text-sm">{product.sku}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  {`${product.images.length} photos`}
                </span>
              </div>
          </div>
          <div className="flex justify-center items-center ml-3">
            <button 
              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors duration-200 hover:shadow-md" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(index);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
)
}