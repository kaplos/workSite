import { useState, useEffect, useRef } from "react";
import { useMessage } from "./Messages/MessageContext";

export default function NavBar({ tab, setTab, handleSearch, handleClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [shown,setShown] = useState(false)
  const {showMessage} = useMessage()

  const searchResultsRef = useRef();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearched(false);

      if (searchTerm && searchTerm.length > 2) {
        setLoading(true);
        handleSearch(searchTerm)
          .then((results) => {

            const {type,value} = results
            if(!value){
              setMessage("No results found");
              setSearchResults(null);
              return
            }
            if (value.length > 0) {
              setSearchResults(value);
              setType(type);
              setShown(true)
            } 

            if (searchResultsRef.current) {
              searchResultsRef.current.focus();
            }
          })
          .catch((error) => {
            console.error("Error during search:", error);
            setMessage("An error occurred while searching.");
            showMessage("An error occurred while searching.")
          })
          .finally(() => {
            setLoading(false);
            setSearched(true);
          });
      } else if (searchTerm.length === 0) {
        setSearchResults([]);
        setMessage("");
      } else if (searchTerm.length < 3) {
        setMessage("Enter at least 3 characters to search");
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabSwitch = (e) => {
    setTab(e.target.text.toLowerCase());
    console.log(e.target.text.toLowerCase(), "clicked", tab);
  };
  
  const typeToCard = {
    upload: (result) => (
      <>
        <h1 className="text-md font-bold text-gray-800">Name: {result.name}</h1>
        <p className="text-sm text-gray-500 mt-1">SKU: {result.sku}</p>
      </>
    ),
    return: (result) => (
      <>
        <h1 className="text-md font-bold text-gray-800">Order Number: {result.orderNumber}</h1>
        <p className="text-sm text-gray-500 mt-1">Tracking Number: {result.trackingNumber}</p>
      </>
    ),
    product: (result) => (
      
      <>
        <h1 className="text-md font-bold text-gray-800">Product Name: {result.productName}</h1>
        <p className="text-sm text-gray-500 mt-1">Category: {result.category}</p>
      </>
    ),
    // Add more types as needed
  };
  
  const defaultCard = (message) => (
    <p className="text-sm text-gray-500">{message}</p>
  );

  return (
    <div className="border-b-2 border-gray-300">
      <nav className="border-gray-200 px-2 mb-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          
          <div
            className=" flex flex-row justify-between items-center w-full "
          >
            <ul className="flex-row flex md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium">
              <li>
                <a
                  href="upload"
                  onClick={handleTabSwitch}
                  className={`text-gray-700 hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0  ${
                    tab === "upload"
                      ? "underline decoration-cyan-600 decoration-2 underline-offset-8"
                      : ""
                  }`}
                  aria-current="page"
                >
                  Upload
                </a>
              </li>
              <li>
                <a
                  href="return"
                  onClick={handleTabSwitch}
                  className={`text-gray-700 hover:bg-gray-50 border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0 ${
                    tab === "return"
                      ? "underline decoration-cyan-600 decoration-2 underline-offset-8"
                      : ""
                  }`}
                >
                  Returns
                </a>
              </li>
            </ul>
            <div className="flex md:order-2">
            <div className="relative mr-3 md:mr-0  ">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                 

            <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>

              <input
                onChange={handleInputChange}
                type="text"
                id="email-adress-icon"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2"
                placeholder="Search..."
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-500 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                </div>
              )}
             
              {searchResults ?(
                <div
                  ref={searchResultsRef}
                  className={`absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 ${shown? '':'hidden'}`}
                >
                  
                  { 
                    <ul>
                      {searchResults.map((result, index) => {
                        console.log(result, "Current result in map"); 
                        // Debugging each result
                        const renderCard = typeToCard[type];

                        return (
                          <li
                            key={index}
                            className=" hover:bg-gray-100 cursor-pointer"
                            onClick={() => { handleClick(result.id,type); setShown(false) }}
                          >
                            <div className="px-2 py-1 border rounded-lg shadow-md bg-white w-full hover:bg-gray-100">
                              {renderCard(result)}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  }
                </div>
              ) : (
                <div className="px-2 py-1 border rounded-lg shadow-md bg-white w-full hover:bg-gray-100">
                  {defaultCard(message)}
                </div>
              )}
            </div>
            
          </div>
          </div>
        </div>
      </nav>
    </div>
  );
}