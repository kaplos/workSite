import React, { useState, useEffect, useRef } from "react";
import History from "../components/products/History";
import Modal from "../components/products/Modal";
import { useNavigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import { onClick } from "../utils/ApiUtils";

export default function Returns({ showReturnDetails, setReturnDetails }) {
  console.log(showReturnDetails, "showReturnDetails");

  const [submitted, setSubmitted] = useState(() => {
    const data = localStorage.getItem("returns");
    return data ? JSON.parse(data) : [];
  });
  const [returnForm, setReturnForm] = useState({
    created_At: "",
    items: [],
    orderNumber: "",
    refunded: false,
    refunded_At: "",
    trackingNumber: "",
    type: "return",
  });

  const [isShowingDetails, setIsShowingDetails] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showReturnDetails) {
      handleSetStates(showReturnDetails);
      setIsShowingDetails(true);
    }
    console.log(showReturnDetails);
  }, [showReturnDetails]);

  useEffect(() => {
    localStorage.setItem("returns", JSON.stringify(submitted));
  }, [submitted]);

  const ENV = import.meta.env;

  const TrackingNumberRef = useRef();
  const OrderNumberRef = useRef();
  const ItemsRef = useRef();

  useEffect(() => {
    TrackingNumberRef.current.focus();
  }, []);

  const removeItem = (index) => {
    const updatedItems = [...returnForm.items];
    updatedItems.splice(index, 1);
    setReturnForm({ ...returnForm, items: updatedItems });
  };
  const handleSetStates = (returnToShow) => {
    const { items, ...rest } = returnToShow;

    try {
      setReturnForm({ ...rest, items: JSON.parse(items), type: "return" });
    } catch {
      setReturnForm({ ...rest, items: items, type: "return" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      returnForm.trackingNumber.length === 0 &&
      returnForm.orderNumber.length === 0
    ) {
      TrackingNumberRef.current.className =
        "border-2 border-red-600  rounded-lg p-2";
      TrackingNumberRef.current.focus();
      return;
    } else if (returnForm.items.length === 0) {
      ItemsRef.current.className = "border-2 border-red-600  rounded-lg p-2";
      ItemsRef.current.focus();
      return;
    }

    // TrackingNumberRef.current.className = 'border-2 border-black rounded-lg p-2';
    // const formData = {
    //     trackingNumber,
    //     orderNumber,
    //     items,
    //     date: new Date().toLocaleDateString(),
    //     refunded: false
    // };

    // setReturnForm({...returnForm,trackingNumber:trackingNumber,orderNumber:orderNumber,items:items,type:"return", });
    setIsLoading(true);
    try {
      const method = isShowingDetails ? "update" : "return";
      const response = await fetch(`${ENV.VITE_API_URL}/${method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnForm),
      });
      const data = await response.json();
      setIsLoading(false);
      if (data.success) {

        isShowingDetails? "":setSubmitted([...submitted, {...returnForm,id:data.id}]);
        setReturnForm({
            created_At: "",
            items: [],
            orderNumber: "",
            refunded: false,
            refunded_At: "",
            trackingNumber: "",
            type: "return",
          })

          isShowingDetails ? setIsShowingDetails(false):''
        TrackingNumberRef.current.focus();
      }

    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting return:", error);
    }
  };
  const handleKeyPress = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current.focus();
    }
  };
  const handleClick = (ret) => {
    setIsShowingDetails(true);

    handleSetStates(ret);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReturnForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} id={'renderForm'} className="flex flex-col w-full h-full p-4">
        <div className="mb-4 flex flex-col">
          <label htmlFor="tracking-number">Return Tracking Number</label>
          <input
            className="border-2 border-black rounded-lg p-2"
            type="text"
            id="tracking-number"
            placeholder="Enter tracking number"
            name="trackingNumber"
            value={returnForm.trackingNumber}
            ref={TrackingNumberRef}
            onChange={handleChange}
            onKeyPress={(e) => handleKeyPress(e, ItemsRef)}
          />
        </div>
        <div className="mb-4 flex flex-col">
          <label htmlFor="order-number">Order Number</label>
          <input
            name="orderNumber"
            className="border-2 border-black rounded-lg p-2"
            type="text"
            id="order-number"
            placeholder="Enter order number"
            value={returnForm.orderNumber}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4 flex flex-col">
          <label htmlFor="items">Items:</label>
          {returnForm.items.length > 0 ? (
            <table className="table-auto border-collapse border border-black">
              <thead>
                <tr>
                  <th className="border border-black px-4 py-2">Item</th>
                  <th className="border border-black px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {returnForm.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black px-4 py-2">{item}</td>
                    <td className="border border-black px-4 py-2">
                      <button
                        className="p-2 bg-red-700 text-white rounded-lg "
                        onClick={() => removeItem(index)}
                      >
                        x
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          <input
            className={`rounded-lg p-2`}
            type={"text"}
            id="items"
            placeholder="Enter item"
            // value={items}
            onChange={(e) => console.log(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.target.value.match(/^[0-9]/) &&
                e.target.value !== ""
              ) {
                e.preventDefault();
                setReturnForm({
                  ...returnForm,
                  items: [...returnForm.items, e.target.value],
                });
                e.target.value = "";
                handleKeyPress(e, ItemsRef);
              } else if (e.key === "Enter" && e.target.value.match(/^[0-9]/)) {
                e.preventDefault();
                handleSubmit(e);
                setReturnForm({
                  ...returnForm,
                  trackingNumber: e.target.value,
                });
                e.target.value = "";
                handleKeyPress(e, ItemsRef);
              }
            }}
            ref={ItemsRef}
          />
        </div>
        {isLoading ? (
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="15"
            visible={true}
          />
        ) : (
          <button
            type={showReturnDetails ? "submit" : "hidden"}
            className={"mt-4 bg-blue-500 text-white py-2 px-4 rounded"}
          >
            Submit
          </button>
        )}
      </form>
    );
  };
  const renderViewDetails = () => {
    return (
      <form onSubmit={handleSubmit} id={'renderViewDetails'} className="flex flex-col w-full h-full p-4">
        <div className="flex flex-col w-full h-full p-4">
          <div className="mb-4 flex flex-col">
            <label htmlFor="tracking-number">Return Tracking Number</label>
            <input
              className="border-2 border-black rounded-lg p-2"
              type="text"
              id="tracking-number"
              placeholder="Enter tracking number"
              value={returnForm.trackingNumber}
              name="trackingNumber"
              ref={TrackingNumberRef}
              onChange={handleChange}
              onKeyPress={(e) => handleKeyPress(e, ItemsRef)}
            />
          </div>
          <div className="mb-4 flex flex-col">
            <label htmlFor="order-number">Order Number</label>
            <input
              className="border-2 border-black rounded-lg p-2"
              type="text"
              id="order-number"
              placeholder="Enter order number"
              name="orderNumber"
              value={returnForm.orderNumber}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4 flex flex-col">
            <label htmlFor="items">Items:</label>
            {returnForm.items.length > 0 ? (
              <table className="table-auto border-collapse border border-black">
                <thead>
                  <tr>
                    <th className="border border-black px-4 py-2">Item</th>
                    <th className="border border-black px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnForm.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-black px-4 py-2">
                        <input
                          type="text"
                          value={item}
                          className="border-2 border-black rounded-lg p-2 w-full"
                          onChange={(e) => {
                            const updatedItems = [...returnForm.items];
                            updatedItems[index] = e.target.value;
                            setReturnForm({
                              ...returnForm,
                              items: updatedItems,
                            });
                          }}
                        />
                      </td>
                      <td className="border border-black px-4 py-2">
                        <button
                          className="p-2 bg-red-700 text-white rounded-lg"
                          onClick={() => removeItem(index)}
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            <input
              className={` rounded-lg p-2`}
              type={"text"}
              id="items"
              placeholder="Enter item"
              // value={items}
              onChange={(e) => console.log(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.target.value.match(/^[0-9]/) &&
                  e.target.value !== ""
                ) {
                  e.preventDefault();
                  setReturnForm({
                    ...returnForm,
                    items: [...returnForm.items, e.target.value],
                  });
                  e.target.value = "";
                  handleKeyPress(e, ItemsRef);
                } else if (
                  e.key === "Enter" &&
                  e.target.value.match(/^[0-9]/)
                ) {
                  e.preventDefault();
                  handleSubmit(e);
                  setReturnForm({
                    ...returnForm,
                    trackingNumber: e.target.value,
                  });
                  e.target.value = "";
                  handleKeyPress(e, ItemsRef);
                }
              }}
              ref={ItemsRef}
            />
          </div>
          <div className="flex flex-row  justify-between items center">
            <div className="flex gap-2">
                <div className="mb-4 flex flex-col">
                  <label htmlFor="refund-status">Refund Status:</label>
                  <select
                    className="border-2 border-black rounded-lg p-2"
                    id="refund-status"
                    value={returnForm.refunded ? "Refunded" : "Not Refunded"}
                    onChange={(e) => {
                      setReturnForm({
                        ...returnForm,
                        refunded: e.target.value === "Refunded",
                        refunded_At: new Date().toISOString(),
                      });
                    }}
                  >
                    <option value="Refunded">Refunded</option>
                    <option value="Not Refunded">Not Refunded</option>
                  </select>
                </div>
                <div className="mb-4 flex flex-col">
                  <label htmlFor="date">Refunded Date:</label>
                  <input
                    type="date"
                    className="border-2 border-black rounded-lg p-2"
                    id="date"
                    value={
                      returnForm.refunded
                        ? new Date(returnForm.refunded_At)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      setReturnForm({
                        ...returnForm,
                        refunded_At: new Date(e.target.value).toISOString(),
                        refunded: true,
                      });
                    }}
                    disabled={!returnForm.refunded}
                  />
                </div>
            </div>
            <div className="gap-1 flex flex-col">
                <label htmlFor="">Created At:</label>
                    <span  className="border-2 border-black rounded-lg p-2">{new Date(returnForm.created_At).toLocaleDateString('en-US')}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2">
        <button
            type=""
            onClick={() => {
                setIsShowingDetails(false);
                setReturnForm({
                    created_At: "",
                    items: [],
                    orderNumber: "",
                    refunded: false,
                    refunded_At: "",
                    trackingNumber: "",
                    type: "return",
                  });
                // setReturnDetails(null);
              // handleSubmit('updateReturn')
            }}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={(e) => {
              handleSubmit(e)
            }}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Submit
          </button>
          
        </div>
      </form>
    );
  };

  // const renderUnrefunded = () => {

  // }
  return (
    <div className="flex flex-col w-full h-full bg-gray-200">
      {/* <h1></h1> */}
      <div className="flex flex-row">
        {
          <>
            <History
              collection={submitted}
              collectionName={"returns"}
              handleClick={handleClick}
            />
            {/* {
                            unrefunded?
                             renderUnrefunded() : renderForm()
                             } */}
            {isShowingDetails ? renderViewDetails() : renderForm()}
          </>
        }

        {selectedItem && (
          <Modal
            isOpened={isOpened}
            setIsOpened={setIsOpened}
            selectedProduct={selectedItem}
            products={returnForm.items}
          />
        )}
      </div>
    </div>
  );
}
