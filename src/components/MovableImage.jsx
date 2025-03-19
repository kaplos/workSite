
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {RotatingLines} from 'react-loader-spinner'
import { useRef } from "react";


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

export default function MoveableImage({selectedImages,setSelectedImages,loadingImage,setLoadingImages}){
    const fileInputRef = useRef(null);
    
    const handleDragOver =(e)=>{
        e.preventDefault()
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


    return(
        <DndProvider backend={HTML5Backend}>
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
        </DndProvider>
    )
}