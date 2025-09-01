import React, { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RotatingLines } from "react-loader-spinner";
import ImageUpload from "./ImageUpload";
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
        src={
          image && image.file instanceof File
            ? URL.createObjectURL(image.file)
            : image && image.image
        }
        alt={`Selected ${index}`}
        className="w-full h-full object-cover"
      />
      <button
        onClick={(e) => {
          e.preventDefault();

          deleteImage(index);
        }}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
      >
        X
      </button>
    </div>
  );
}

export default function ModalForm({
  setProducts,
  collection,
  value,
  setIsOpened,
  isOpened,
}) {
  // console.log(value, "value in modal form");

  const [exists, setExists] = useState(false);
  const [newSku, setNewSku] = useState(value.sku);
  const [isTie, setIsTie] = useState(
    value.sku.length > 0 && value.sku.toLowerCase().includes("tie")
  );
  const [selectedImages, setSelectedImages] = useState(value.images || []);
  const [values, setValues] = useState(value);
  const [loadingImage, setLoadingImages] = useState(0);
  const fileInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const widthInputRef = useRef(null);

  useEffect(() => {
    if (!isOpened) {
      setNewSku("");
    }
  }, [isOpened]);
  useEffect(() => {
    if (value) {
      setValues(value);
      setNewSku(value.sku);
      setSelectedImages(value.images);
      values.sku.length > 0 && values.sku.toLowerCase().includes("tie")
        ? setIsTie(true)
        : setIsTie(false);
    }
  }, [value]);

  useEffect(() => {
    document.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        onSubmit(e);
      }
    });
  }, []);




 
  const handleSkuCheck = async (e) => {
    console.log(newSku, "newSku");
    if (newSku.length === 0) return;
    if (newSku === value.sku) return;

    let response = await fetch(
      `${ENV.VITE_API_URL}/checksku?sku=${newSku.trim()}`
    );
    let data = await response.json();
    setExists(data.exists);

    if (data.exists) return;

    collection.forEach((product) => {
      setExists(product.sku === newSku);
    });
  };
  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...selectedImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setSelectedImages(updatedImages);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
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

  const onSubmit = async (e) => {
    e.preventDefault();
    // setIsOpened(false)
    console.log("Form submitted with SelectedImages:", selectedImages);

    const newValues = { ...values, images: [...selectedImages], sku: newSku };

    // console.log("Form submitted with values:", newValues); // Log the updated values
    const productIndex = collection.findIndex(
      (product) => product.sku === value.sku
    );
    console.log(productIndex, "productIndex");
    if (productIndex !== -1) {
      // Update the product at the found index
      setProducts((prevProducts) => {
        const updatedProducts = [...prevProducts];
        updatedProducts[productIndex] = newValues;
        return updatedProducts;
      });
    } else {
      // If the product is not found, add it as a new product
      setProducts((prevProducts) => [...prevProducts, ...newValues]);
    }

    setValues({
      sku: "",
      notes: "",
      images: [],
    });
    setSelectedImages([]);
    fileInputRef.current.value = "";
    setIsOpened(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className=" p-2 w-full items-start justify-start">
        <form onSubmit={onSubmit} method="POST">
           <div className="flex flex-col w-full p-2">
            <label htmlFor="sku">SKU</label>
            <h1 className="text-red-400">Must be full SKU as is on sheets</h1>
            <input
              required
              type="text"
              name="sku"
              id="sku"
              onChange={(e) => setNewSku(e.target.value)}
              onBlur={handleSkuCheck}
              value={newSku.length === 0 ? values.sku : newSku}
              className={`border-2 border-black rounded-lg p-2 ${
                exists ? "border-red-700 border-4" : ""
              }`}
            />
          </div>
          {/* <ImageUpload handleSkuCheck={handleSkuCheck} setNewSku={setNewSku} newSku={newSku} exists={exists} values={values} /> */}
          <div
            className={`flex flex-row w-full  gap-2 p-2 ${
              isTie ? "visible" : "hidden"
            }`}
          >
            <div className="flex flex-col w-full">
              <label htmlFor="qty">Qty:</label>
              <input
                type="number"
                name="qty"
                required={isTie}
                ref={qtyInputRef}
                onChange={handleChange}
                value={values.qty}
                className=" border-2 border-black rounded-lg p-2 "
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="width">Width:</label>
              <input
                type=""
                name="width"
                required={isTie}
                ref={widthInputRef}
                onChange={handleChange}
                value={values.width}
                step="any"
                className="border-2 border-black rounded-lg p-2"
              />
            </div>
          </div>
          <div className="flex flex-col w-full p-2">
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
           <ImageUpload  fileInputRef={fileInputRef} isRequired={false} loadingImage={loadingImage} setSelectedImages={setSelectedImages} setLoadingImages={setLoadingImages}/>
          
          <div className="flex flex-wrap mt-4 pl-2">
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
            {loadingImage > 0 &&
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
          <div className="flex flex-col w-full p-2">
            <button
              type="submit"
              className="border-2 border-black rounded-lg p-2 bg-green-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </DndProvider>
  );
}
