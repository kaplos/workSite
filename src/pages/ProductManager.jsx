import React, { useState, useEffect } from "react";
import MoveableImage from "../components/MovableImage";
import {useNavigate} from "react-router-dom";
import ShoeInventory from "../components/ShoeWidthTable";
const ProductManager = ({ showProductDetails, setShowProductDetails }) => {
    const ENV = import.meta.env;
    const [product, setProduct] = useState(showProductDetails || {});
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      // Check if showProductDetails exists before setting state
      if (showProductDetails) {
        setProduct(showProductDetails);
        
        // Safely parse images or set as empty array if invalid
        try {
          setSelectedImages(JSON.parse(showProductDetails.images) || []);
        } catch (error) {
          console.error("Error parsing images:", error);
          setSelectedImages([]); // Fallback to an empty array if parsing fails
        }
      }
    
      // Fetch sizes for the product asynchronously
      
    
    }, [showProductDetails])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log(product, "product");
    // setProduct({...product,type:'update',images:selectedImages})
    fetch(`${ENV.VITE_API_URL}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...product,type:'upload',images:selectedImages}),
    }).then((response) => {
                response.json()
            })
      .then((response) => {
        if (!response.success) {
          throw new Error("Failed to update product");
        }
        return response.json();
      })
      .then((updatedProduct) => {
        setShowProductDetails(null); 
        navigate('/upload')
        // Update the parent state
        // alert("Product updated successfully!");
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  return (
    <div className="p-4 w-full h-full">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form>
        <div>
            <label className="block font-bold">Images:</label>
            <MoveableImage
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              loadingImage={loading}
              setLoadingImages={setLoading}
            />
        </div>
        <div className="flex flex-row gap-2 w-full">
            <div className="mb-2" >
                <label className="block font-bold">Sku:</label>
                <input
                  type="text"
                  name="sku"
                  value={product.sku || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            <div className="mb-2" >
                <label className="block font-bold">Alias Sku:</label>
                <input
                  type="text"
                  name="aliasSku"
                  value={product.aliasSku || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            <div className="mb-2" >
                <label className="block font-bold">Model Number:</label>
                <input
                  type="text"
                  name="modelNumber"
                  value={product.modelNumber || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            <div className="mb-2" >
                <label className="block font-bold">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={product.name || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
        </div>
        <div className="flex flex-row gap-2 w-full">
        <div className="mb-2" >
                <label className="block font-bold">Brand:</label>
                <input
                  type="text"
                  name="brand"
                  value={product.brand  || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            <div className="mb-2" >
                <label className="block font-bold">Color:</label>
                <input
                  type="text"
                  name="color"
                  value={product.color || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            
            <div className="mb-2" >
                <label className="block font-bold">Sizes:</label>
                <input
                  type="text"
                  name="sizes"
                  value={product.sizes || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2" >
                <label className="block font-bold">Product Type:</label>
                <input
                  type="text"
                  name="product_type"
                  value={product.product_type || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
        </div>
        <div className="flex flex-row gap-2 w-full">
        <div className="mb-2" >
                <label className="block font-bold">Retail Price:</label>
                <input
                  type="number"
                  name="retail_price"
                  value={product.retail_price || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            <div className="mb-2" >
                <label className="block font-bold">Amazon Price:</label>
                <input
                  type="number"
                  name="amazon_price"
                  value={product.amazon_price || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            
            <div className="mb-2" >
                <label className="block font-bold">Ebay Price:</label>
                <input
                  type="number"
                  name="ebay_price"
                  value={product.ebay_price || ""}   
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
            </div>
            <div className="mb-2" >
                <label className="block font-bold">Website Price:</label>
                <input
                  type="number"
                  name="website_price"
                  value={product.website_price || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
            </div>
        </div>
        <div className="flex flex-row gap-2 w-full">
        <div className="mb-2" >
                <label className="block font-bold"> Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  value={product.quantity || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
              </div>
            <div className="mb-2" >
                <label className="block font-bold">Gender:</label>
                  
                  <select name="gender" id="" className="border border-gray-300 px-2 py-1 w-full" onChange={handleChange} value={product.gender}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>

                </select>
              </div>
            
            <div className="mb-2" >
                <label className="block font-bold">Location:</label>
                <input
                  type="text"
                  name="location"
                  value={product.location || ""}   
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
            </div>
            <div className="mb-2" >
                <label className="block font-bold">Sub-Location:</label>
                <input
                  type="text"
                  name="subLocation"
                  value={product.subLocation || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
            </div>
        </div>
        <div className="mb-2" >
                <label className="block font-bold">Notes:</label>
                <textarea
                  name="notes"
                  value={product.notes || ""}
                  onChange={handleChange}
                  className="border border-gray-300 px-2 py-1 w-full"
                />
            </div>   
            <div><ShoeInventory sku={product.sku}/>  </div>
        
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductManager;