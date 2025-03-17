import React, { useState, useRef,useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {RotatingLines} from 'react-loader-spinner'

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
    <div ref={(node) => ref(drop(node))} className="relative w-32 h-32 m-2">
      <img
        src={image}
        alt={`Selected ${index}`}
        className="w-full h-full object-cover"
      />
      <button
        onClick={(e) => {
          e.preventDefault()
          console.log(e, "e");
          deleteImage(index)
        }}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
      >
        X
      </button>
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
    qty:1,
    width:3.5
  });
  useEffect(()=>{

  },[loadingImage])

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

  const handleDragOver =(e)=>{
    e.preventDefault()
  }
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleImageChange(files);
  };



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





  const handleImageChange = async(e) => {
    console.log(e, "files");
    e.preventDefault();
    const eventFiles = e.type === "drop" ? Array.from(e.dataTransfer.files) : Array.from(e.target.files);
    setLoadingImages(eventFiles.length);
    console.log(eventFiles, "files");

    const formData = new FormData();


    const newImages = eventFiles.map((file) => (
      formData.append("images", file,file.name),
      {
        url: URL.createObjectURL(file),
      }
    ));

    const response = await fetch(`${ENV.VITE_API_URL}/upload`,{
      method:"POST",
      body: formData
    })

    const data = await response.json()
    console.log(data,'response from server');


    console.log(newImages, "newImages");
    setLoadingImages(0)
    setSelectedImages((prevImages) => {
      const updatedImages = [...prevImages, ...data.images];
      console.log(updatedImages, "updatedImages"); // Log the updated state here
      return updatedImages;
    });
  };

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
  function getFileExtension(file){
    return file.name.split('.').pop().toLowerCase();
  }

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
      <div className={`flex-1 border-r-2 border-black items-start justify-start `}>
      {/* {isDragging && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <p className="text-white text-2xl">Drag images over here</p>
          </div>
        )} */}
        <form onSubmit={onSubmit} method="POST">
          <div className="flex flex-col w-full p-4">
            <div className="flex flex-row"><label htmlFor="sku">SKU</label> <span className="text-red-700 pl-1 text-lg">*</span></div>
            <h1  className="text-red-400">Must be full SKU as is on sheets</h1>
            <input
              required
              type="text"
              name="sku"
              id="sku"
              onChange={handleChange}
              onBlur={handleSkuCheck}
              value={values.sku}
              className={`border-2 border-black rounded-lg p-2 ${exists? 'border-red-700 border-4': ''}`}
            />
          </div>
          <div className={`flex flex-row w-full gap-2 p-4 ${isTie ?  "visible": "hidden" }`}> 
                <div className="flex flex-col  w-full">
                  <div className="flex flex-row"><label htmlFor="qty">Qty:</label>  <span className="text-red-700 pl-1 text-lg">*</span></div>
                  <input type="number" name='qty' required={isTie} onChange={handleChange} ref={qtyInputRef} value={values.qty}  className="border-2 border-black rounded-lg flex-1 p-2"/>
                </div>
                <div className="flex flex-col  w-full">
                  <div className="flex flex-row"><label htmlFor="width">Width:</label> <span className="text-red-700 pl-1 text-lg">*</span></div>
                  <input type="" name='width' required={isTie} ref={widthInputRef} onChange={handleChange} value={values.width} step="any" className="border-2 border-black rounded-lg p-2"/>
                </div>
          </div>
          <div className="flex flex-col w-full p-4">
            <label htmlFor="notes">Notes</label>
            <input
              type="text"
              name="notes"
              id="notes"
              value={values.notes}
              onChange={handleChange}
              className="border-2 border-black rounded-lg p-2"
            />
          </div>
          
            <div
              className="border-2 border-dashed border-black p-4 cursor-pointer m-4 rounded-lg" 
              onDragOver={handleDragOver}
              onDrop={handleImageChange}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <label htmlFor="images">Images </label>
                  <span className="text-red-700 pl-1 text-lg">*</span>

                </div>
                <p className="text-gray-700 text-sm font-medium mt-2">Choose a file or drag and drop it here</p>
              </div>
              <input
                required={isRequired}
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                name="images"
                id="images"
                onChange={handleImageChange}
                className="hidden"
              />

            </div>
          
          <div className="flex flex-wrap mt-4">
            {selectedImages &&
             selectedImages.map((image, index) => (
              <DraggableImage
                key={index}
                index={index}
                image={image}
                moveImage={moveImage}
                deleteImage={deleteImage}
              />
            ))}
            {loadingImage>0 &&
              Array.from({ length: loadingImage }).map((_, index) => (
                <RotatingLines
                  key={index}
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="15"
                  visible={true}
                />
            ))}
          </div>
          <div className="flex flex-col w-full p-4">
            <button
              disabled={isButtonDisabled}
              type="submit"
              className={`border-2 border-black rounded-lg p-2 bg-green-500 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </DndProvider>
  );
}
