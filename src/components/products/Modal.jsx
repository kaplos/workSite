import { useEffect ,useState} from 'react';
import ModalForm from './ModalForm';


export default function Modal({isOpened, setIsOpened,setCollection,collection,selectedItem }) {
    // console.log(setIsOpened)
    return(
<div className={`absolute w-full h-full bg-gray-900 bg-opacity-50  ${isOpened ? '' : 'hidden'} flex justify-center items-center`}>
  <div className=" bg-gray-200 w-[85%] flex flex-col justify-center items-center rounded-lg">
    <button onClick={() => setIsOpened(false)} className=" p-2 self-end bg-red-700 rounded-lg text-white  mr-4 mt-4">
      x
    </button>

    <ModalForm setProducts={setCollection} collection={collection} value={selectedItem} setIsOpened={setIsOpened} isOpened={isOpened} />
  </div>
</div>
    );

}