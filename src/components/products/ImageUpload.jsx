import { useState, useRef, useEffect } from "react";


export  default function ImageUpload({fileInputRef,isRequired, setSelectedImages, selectedImages, setLoadingImages,loadingImages}){
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
const handleImageChange = async(e) => {
    console.log(e, "files");
    e.preventDefault();
    const eventFiles = e.type === "drop" ? Array.from(e.dataTransfer.files) : Array.from(e.target.files);
    setLoadingImages(eventFiles.length);
    console.log(eventFiles, "files");

    const watermarkImages = await Promise.all(eventFiles.map(file => {
        return addWatermarkContrastCanvas(file, watermarkRef.current);
    }));
//     watermarkImages.forEach((blob, i) => {
//   const url = URL.createObjectURL(blob);
//   console.log(`Watermarked image ${i}:`, url);
// });
    console.log(watermarkImages.length, "watermarkImages");
    const formData = new FormData();

    for(let i=0; i< watermarkImages.length; i++){
      const ext = getFileExtension(eventFiles[i]);
      formData.append("images", eventFiles[i], eventFiles[i].name),
      formData.append("watermark", watermarkImages[i], `${watermarkImages[i].name}.${ext}`)
    }

    const newImages = eventFiles.map((file) => (
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


    console.log(newImages, "newImages",formData);
    setLoadingImages(0)
    setSelectedImages((prevImages) => {
      const updatedImages = [...prevImages, ...data.images];
      console.log(updatedImages, "updatedImages"); // Log the updated state here
      return updatedImages;
    });
  };

  async function addWatermarkContrastCanvas(inputFile, watermarkUrl, position = 'center') {
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Load main image and watermark image as <img>
  const mainImg = await loadImage(URL.createObjectURL(inputFile));
  const watermarkImg = await loadImage(watermarkUrl);

  // Prepare canvases
  const canvas = document.createElement('canvas');
  canvas.width = mainImg.width;
  canvas.height = mainImg.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(mainImg, 0, 0);

  // Resize watermark to fit main image width (adjust factor as needed)
  const factor = 1; // matches your Jimp logic
  const wWidth = mainImg.width * factor;
  const scale = wWidth / watermarkImg.width;
  const wHeight = watermarkImg.height * scale;

  // Draw watermark on temp canvas for pixel manipulation
  const wmCanvas = document.createElement('canvas');
  wmCanvas.width = wWidth;
  wmCanvas.height = wHeight;
  const wmCtx = wmCanvas.getContext('2d');
  wmCtx.drawImage(watermarkImg, 0, 0, wWidth, wHeight);

  // Contrast logic
  const wmImageData = wmCtx.getImageData(0, 0, wWidth, wHeight);
  const wmData = wmImageData.data;
  const mainImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const mainData = mainImageData.data;

  // Calculate position
  const margin = 20;
  let x = 0, y = 0;
  switch (position) {
    case 'top-left': x = margin; y = margin; break;
    case 'top-right': x = canvas.width - wWidth - margin; y = margin; break;
    case 'bottom-left': x = margin; y = canvas.height - wHeight - margin; break;
    case 'bottom-right': x = canvas.width - wWidth - margin; y = canvas.height - wHeight - margin; break;
    case 'center':
    default:
      x = (canvas.width - wWidth) / 2;
      y = (canvas.height - wHeight) / 2;
      break;
  }

  // Per-pixel contrast-adjusted color for watermark
  for (let wy = 0; wy < wHeight; wy++) {
    for (let wx = 0; wx < wWidth; wx++) {
      const wIdx = (wy * wWidth + wx) * 4;
      const alpha = wmData[wIdx + 3];
      if (alpha !== 0) {
        const mx = Math.min(canvas.width - 1, Math.max(0, wx + x));
        const my = Math.min(canvas.height - 1, Math.max(0, wy + y));
        const mIdx = (my * canvas.width + mx) * 4;
        const r = mainData[mIdx + 0];
        const g = mainData[mIdx + 1];
        const b = mainData[mIdx + 2];
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const contrastColor = brightness > 0.5 ? 0 : 255;
        wmData[wIdx + 0] = contrastColor;
        wmData[wIdx + 1] = contrastColor;
        wmData[wIdx + 2] = contrastColor;
        // Alpha as is
      }
    }
  }
  wmCtx.putImageData(wmImageData, 0, 0);

  // Paint watermark on main canvas
  ctx.globalAlpha = 1;
  ctx.drawImage(wmCanvas, x, y);

  // Return as Blob (for upload)
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
    )
}