import { useState,useEffect } from 'react'
import Form from '../components/products/Form'
import History from '../components/products/History';
import Modal from '../components/products/Modal'


export default function Products({showUploadDetails,SetUploadDetails}) {
     
    
    const [products, setProducts] = useState(() => {
        const data = localStorage.getItem('products');
        return data ? JSON.parse(data) : [];
      });
      const [isOpened,setIsOpened] = useState(false);
      const [selectedProduct,setSelectedProduct] = useState(null);
    
      const handleDelete = (index) => {
        const updatedProducts = [...products];
        updatedProducts.splice(index, 1);
        setProducts(updatedProducts);
      }
      const handleClick = (product) => {
        
        setSelectedProduct(product);
        setIsOpened(true);
        console.log(product, "product clicked", products[product]);
    
      }
     
      useEffect(()=>{
        localStorage.setItem('products', JSON.stringify(products));
        console.log(JSON.stringify(localStorage.getItem('products')));
        console.log(products);
      },[products])

     
    
      return (
        <div className='flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'> 

          <div className='flex flex-col md:flex-row w-full h-full'>
            <History collection={products} collectionName={'products'} handleDelete={handleDelete} handleClick={handleClick} />
            <Form setProducts={setProducts} products={products} showUploadDetails={showUploadDetails}/>
            {selectedProduct &&
              <Modal isOpened={isOpened} setIsOpened={setIsOpened} selectedItem={selectedProduct} collection={products} setCollection={setProducts}/>
            }
          </div>
        </div>

      )


}