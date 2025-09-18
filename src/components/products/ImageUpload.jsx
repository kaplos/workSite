import { useState, useRef, useEffect } from "react";


export  default function ImageUpload({fileInputRef,isRequired, setSelectedImages, selectedImages, setLoadingImages,loadingImages,values,onUpload}){
const validImageTypes = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'];
const ENV = import.meta.env;

      const WATERMARK_URL = `${ENV.VITE_API_URL}/watermark`;
  const watermarkRef = useCachedWatermark(WATERMARK_URL);


   
function getFileExtension(file){
    return file.name.split('.').pop().toLowerCase();
  }
function useCachedWatermark(url) {
  const watermarkRef = useRef(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        console.log('received watermark blob:', blob);
        watermarkRef.current = URL.createObjectURL(blob);
      }).catch(err => {
        console.error('Error fetching watermark:', err);
      });
  }, [url]);

  return watermarkRef;
}
// Helper to convert File/Blob to base64 string
function fileOrBlobToBase64(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}
const handleImageChange = async(e) => {
    console.log(e, "files");
    e.preventDefault();
    const eventFiles = e.type === "drop" ? Array.from(e.dataTransfer.files) : Array.from(e.target.files);
    setLoadingImages(eventFiles.length);
    console.log(eventFiles, "files");
    
    const watermarkImages = await Promise.all(eventFiles.map(file => {
      return addWatermarkContrastCanvas(file, watermarkRef.current);
    }));
    // if(process.env.NODE_ENV === 'development'){
      //     const url = URL.createObjectURL(watermarkImages[0]);
      //     console.log(url, "watermarked image URL");
      //         window.open(url, '_blank'); // Opens the image in a new tab
      //         return
      // }
      
      //     watermarkImages.forEach((blob, i) => {
        //   const url = URL.createObjectURL(blob);
        //   console.log(`Watermarked image ${i}:`, url);
        // });
        console.log(watermarkImages.length, "watermarkImages",'uploading sku:',values.originalSku||values.sku );
        const formData = new FormData();
        formData.append("sku", values.originalSku||values.sku);
        
        for(let i=0; i< watermarkImages.length; i++){
          const ext = getFileExtension(eventFiles[i]);
          formData.append("images", eventFiles[i], eventFiles[i].name),
          formData.append("watermark", watermarkImages[i], `${watermarkImages[i].name}.${ext}`)
        }
        
        // let newImages = [];
        // for(let i=0; i< eventFiles.length; i++){
          //     const ext = getFileExtension(eventFiles[i]);
          //     const imageBase64 = await fileOrBlobToBase64(eventFiles[i]);
          // const watermarkBase64 = await fileOrBlobToBase64(watermarkImages[i]);
          //     newImages.push({
            //         imageUrl: imageBase64,
            //         watermarkUrl: watermarkBase64,
            //         image: imageBase64,
            //         watermark: watermarkBase64,
            //         ext,
            //         name: eventFiles[i].name,
            //     });
            // }
            
            
            
            if(onUpload&&values.originalSku==='') onUpload(values.sku)
              
              const response = await fetch(`${ENV.VITE_API_URL}/upload`,{
                  method:"POST",
                  body: formData
                })
                
                const data = await response.json()
                console.log(data,'response from server');
                
                
                // console.log(newImages, "newImages");
                setLoadingImages(0)
                setSelectedImages((prevImages) => {
                    const updatedImages = [...prevImages, ...data.images];
                    console.log(updatedImages, "updatedImages"); // Log the updated state here
                    return updatedImages;
                  });
                  if (fileInputRef && fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
  };

 async function addWatermarkContrastCanvas(inputFile, watermarkUrl, position = 'center') {
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Load images
  const mainImg = await loadImage(URL.createObjectURL(inputFile));
  const watermarkImg = await loadImage(watermarkUrl);

  // Prepare canvas for main image
  const canvas = document.createElement('canvas');
  canvas.width = mainImg.width;
  canvas.height = mainImg.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(mainImg, 0, 0);

  // Resize watermark (e.g., 30% width of main image)
  const wWidth = mainImg.width * 1;
  const scale = wWidth / watermarkImg.width;
  const wHeight = watermarkImg.height * scale;

  // Positioning
  const margin = 20;
  let x = 0, y = 0;
  switch (position) {
    case 'top-left':     x = margin; y = margin; break;
    case 'top-right':    x = canvas.width - wWidth - margin; y = margin; break;
    case 'bottom-left':  x = margin; y = canvas.height - wHeight - margin; break;
    case 'bottom-right': x = canvas.width - wWidth - margin; y = canvas.height - wHeight - margin; break;
    case 'center':
    default:
      x = (canvas.width - wWidth) / 2;
      y = (canvas.height - wHeight) / 2;
      break;
  }

  // Temp canvas for watermark
  const wmCanvas = document.createElement('canvas');
  wmCanvas.width = wWidth;
  wmCanvas.height = wHeight;
  const wmCtx = wmCanvas.getContext('2d');
  wmCtx.drawImage(watermarkImg, 0, 0, wWidth, wHeight);

  // Extract pixel data
  const wmImageData = wmCtx.getImageData(0, 0, wWidth, wHeight);
  const wmData = wmImageData.data;
  const mainData = ctx.getImageData(x, y, wWidth, wHeight).data;

  // === Per-pixel contrast adjustment ===
  for (let wy = 0; wy < wHeight; wy++) {
    for (let wx = 0; wx < wWidth; wx++) {
      const idx = (wy * wWidth + wx) * 4;
      const alpha = wmData[idx + 3];
      if (alpha > 0) {
        const r = mainData[idx + 0];
        const g = mainData[idx + 1];
        const b = mainData[idx + 2];
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        const contrastColor = brightness > 0.5 ? 0 : 255; // black if bright, white if dark
        wmData[idx + 0] = contrastColor;
        wmData[idx + 1] = contrastColor;
        wmData[idx + 2] = contrastColor;
        // alpha stays the same
      }
    }
  }

  wmCtx.putImageData(wmImageData, 0, 0);

  // Draw adjusted watermark on main image
  ctx.drawImage(wmCanvas, x, y);

  // Return result blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.95);
  });
}



const handleDragOver =(e)=>{
    e.preventDefault()
  }

const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleImageChange(files);
  };
    
    
    return(
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
                // required={isRequired}
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
    )
}