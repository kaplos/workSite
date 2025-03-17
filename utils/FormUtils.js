
const ENV = import.meta.env;

export const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log(files, "files");

    const formData = new FormData();

    const newImages = files.map((file) => (
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
    // const newValues = {...values,  images: [...values.images,...data.images ]};
    // setValues(newValues);


    console.log(newImages, "newImages");
    console.log(selectedImages, "selectedImages");
    setSelectedImages((prevImages) => {
      const updatedImages = [...prevImages, ...data.images];
      console.log(updatedImages, "updatedImages"); // Log the updated state here
      return updatedImages;
    });
  };

  export const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };