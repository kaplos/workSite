import React, { useState, useRef,useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {RotatingLines} from 'react-loader-spinner'
// import { randomUUID } from 'crypto'
import ImageUpload from "./ImageUpload";
// import Jimp from 'jimp';

const ItemType = "IMAGE";
const ENV = import.meta.env;
function DraggableImage({ image, index, moveImage, deleteImage }) {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="relative w-32 h-32 group cursor-move">
      <img
        src={image}
        alt={`Selected ${index}`}
        className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-md group-hover:shadow-lg transition-all duration-200"
      />
      <button
        onClick={(e) => {
          e.preventDefault()
          console.log(e, "e");
          deleteImage(index)
        }}
        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-200 hover:scale-110"
      >
        ×
      </button>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
    </div>
  );
}

export default function Form({setProducts,products,showUploadDetails}) {

  const [isDragging, setIsDragging] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isRequired,setIsRequired] = useState(true);
  const [loadingImage,setLoadingImages] = useState(0)
  const [exists, setExists] = useState(false);
  const [isTie,setIsTie] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // Store image data as objects
  const [values, setValues] = useState({
    sku: "",
    notes: "",
    images: [],
    // qty:1,
    width:3.5
  });
 

useEffect(()=>{
    if(showUploadDetails){
      setValues(showUploadDetails)
      setSelectedImages(JSON.parse(showUploadDetails.images))
      values.sku.length > 0 && values.sku.toLowerCase().includes("tie")? setIsTie(true):setIsTie(false)
    }
},[showUploadDetails])


  useEffect(() => {
    // Enable the button if there are selected images and SKU is not empty
    setIsButtonDisabled(!(selectedImages.length > 0 && values.sku.trim() !== ""));
  }, [selectedImages, values.sku]);
  useEffect(() => {
    selectedImages.length > 0 ? setIsRequired(false):setIsRequired(true);
  }, [selectedImages]);
  useEffect(() =>{
    setIsTie(values.sku.length > 0 && values.sku.toLowerCase().includes("tie"))
    
    console.log("isTie",isTie, values.sku);
  },[values])
  useEffect(() => {
    document.addEventListener('keypress', (e) => {
      console.log(e.key, "key pressed",isButtonDisabled);
      if(e.key === "Enter" && !isButtonDisabled){
        onSubmit(e)
      }
    })
  },[])


  // useEffect(() => {
  //   const handleDragEnter = (e) => {
  //     e.preventDefault();
  //     setIsDragging(true);
  //   };

  //   const handleDragLeave = (e) => {
  //     e.preventDefault();
  //     setIsDragging(false);
  //   };

  //   const handleDrop = (e) => {
  //     e.preventDefault();
  //     setIsDragging(false);
  //   };

  //   document.addEventListener("dragenter", handleDragEnter);
  //   document.addEventListener("dragleave", handleDragLeave);
  //   // document.addEventListener("drop", handleDrop);

  //   return () => {
  //     document.removeEventListener("dragenter", handleDragEnter);
  //     document.removeEventListener("dragleave", handleDragLeave);
  //     // document.removeEventListener("drop", handleDrop);
  //   };
  // }, []);
  const fileInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const widthInputRef = useRef(null);

  




  const handleSkuCheck = async (e) => { 
    if(values.sku.length === 0) return;

    let response = await fetch(`${ENV.VITE_API_URL}/checksku?sku=${e.target.value}`)
    let data = await response.json();
      setExists(data.exists);
    
      if(data.exists) return 

    products.forEach((product) => {
      setExists(product.sku === values.sku)
    })
  }

  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...selectedImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setSelectedImages(updatedImages);
  };

  const deleteImage = (index) => {
    const removedImage = selectedImages[index];
    URL.revokeObjectURL(removedImage.url); // Clean up the URL
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  

  const onSubmit = async(e) => {
    e.preventDefault();

    console.log("Form submitted with SelectedImages:", selectedImages);
  
    const newValues = {...values,  images: [...selectedImages] };
    console.log("Form submitted with values:", newValues); // Log the updated values
    setProducts(prevValues => [...prevValues, newValues]); // Update the products state with the new values

    setValues({
    sku: "",
    notes: "",
    images: [],
  });
    setSelectedImages([]);
    fileInputRef.current.value = "";
    setExists(false)
    setIsButtonDisabled(true);
    
  
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex-1 bg-white rounded-xl shadow-lg m-2 md:m-4 p-4 md:p-6 border-0`}>
        <form onSubmit={onSubmit} method="POST" className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label htmlFor="sku" className="text-sm font-semibold text-gray-700">SKU</label>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Must be full SKU as is on sheets</p>
            <input
              required
              type="text"
              name="sku"
              id="sku"
              onChange={handleChange}
              onBlur={handleSkuCheck}
              value={values.sku}
              className={`w-full px-3 md:px-4 py-2 md:py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base ${exists ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'}`}
              placeholder="Enter product SKU..."
            />
            {exists && (
              <p className="text-red-500 text-xs mt-1">This SKU already exists</p>
            )}
          </div>
          <div className={`space-y-4 ${isTie ? "block" : "hidden"}`}> 
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label htmlFor="width" className="text-sm font-semibold text-gray-700">Width</label>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  <input 
                    type="number" 
                    name='width' 
                    required={isTie} 
                    ref={widthInputRef} 
                    onChange={handleChange} 
                    value={values.width} 
                    step="any" 
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 text-sm md:text-base"
                    placeholder="Enter width..."
                  />
                </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes</label>
            <input
              type="text"
              name="notes"
              id="notes"
              value={values.notes}
              onChange={handleChange}
              className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 text-sm md:text-base"
              placeholder="Add any notes..."
            />
          </div>
          
          {values.sku.length > 0 ? 
            <ImageUpload fileInputRef={fileInputRef} isRequired={isRequired} loadingImage={loadingImage} setSelectedImages={setSelectedImages} setLoadingImages={setLoadingImages} sku={values.sku}/>
            : <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <p className="text-orange-700 font-medium">Enter SKU to upload images</p>
              </div>
          }
          
          <div className="flex flex-wrap gap-4 mt-6">
            {selectedImages &&
             selectedImages.map((image, index) => (
              <DraggableImage
                key={index}
                index={index}
                image={image.image}
                moveImage={moveImage}
                deleteImage={deleteImage}
              />
            ))}
            {loadingImage > 0 &&
              Array.from({ length: loadingImage }).map((_, index) => (
                <div key={index} className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <RotatingLines
                    strokeColor="#6B7280"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="32"
                    visible={true}
                  />
                </div>
            ))}
          </div>
          
          <div className="pt-2 md:pt-4">
            <button
              disabled={isButtonDisabled}
              type="submit"
              className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-white transition-all duration-200 transform text-sm md:text-base ${
                isButtonDisabled 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95'
              }`}
            >
              {isButtonDisabled ? 'Fill required fields' : 'Submit Product'}
            </button>
          </div>
        </form>
      </div>
    </DndProvider>
  );
}
