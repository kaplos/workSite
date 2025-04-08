import { useEffect, useState } from "react";

export default function ShoeInventory({sku}) {
  const ENV = import.meta.env;

  console.log(sku)
  const [inventory, setInventory] = useState([]);
  // useEffect(()=>{
  //   setInventory(sizes)
  // },[sizes])
    useEffect(()=>{
      const sizes = async () => {
        try {
          const response = await fetch(`${ENV.VITE_API_URL}/getSizes?sku=${sku}`);
          const data = await response.json(); // Parse response to JSON
          setInventory(data)
          console.log(data); // Log or process the fetched sizes data
        } catch (error) {
          console.error("Error fetching sizes:", error);
        }
      };
        sizes();
    },[sku])

  const [form, setForm] = useState({ width: "", sizes: [], stock: "" });
  const [showDropdown, setShowDropdown] = useState(false);
  const availableSizes = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

  const toggleSize = (size) => {
    setForm((prevForm) => ({
      ...prevForm,
      sizes: prevForm.sizes.includes(size)
        ? prevForm.sizes.filter((s) => s !== size)
        : [...prevForm.sizes, size],
    }));
  };

  const addOrUpdateItem = () => {
    if (!form.width || form.sizes.length === 0 || !form.stock) return;

    const newInventory = [...inventory];

    form.sizes.forEach((size) => {
      const existing = newInventory.find((item) => item.width === form.width && item.size === size);
      if (existing) {
        existing.stock = parseInt(form.stock);
      } else {
        newInventory.push({ id: newInventory.length + 1, width: form.width, size, stock: parseInt(form.stock) });
      }
    });

    setInventory(newInventory);
    setForm({ width: "", sizes: [], stock: "" });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shoe Inventory</h2>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Width</th>
            <th className="border p-2">Size</th>
            <th className="border p-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={`${item.width}-${item.size}`}>
              <td className="border p-2">{item.width}</td>
              <td className="border p-2">{item.size}</td>
              <td className="border p-2">{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form */}
      <div className="mt-4">
        <h3 className="font-semibold">Add / Update Stock</h3>
        <input
          type="text"
          name="width"
          placeholder="Width (D, E, etc.)"
          className="border p-2 mr-2"
          value={form.width}
          onChange={(e) => setForm({ ...form, width: e.target.value })}
        />

        {/* Size Dropdown */}
        <div className="relative inline-block">
          <button type="button" className="border p-2 mr-2" onClick={() => setShowDropdown(!showDropdown)}>
            Select Sizes
          </button>
          {showDropdown && (
            <div className="absolute bg-white border mt-2 p-2 max-h-40 overflow-y-auto shadow-lg">
              {availableSizes.map((size) => (
                <label key={size} className="block">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={form.sizes.includes(size)}
                    onChange={() => toggleSize(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          )}
        </div>

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          className="border p-2 mr-2"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <button onClick={addOrUpdateItem} className="bg-blue-500 text-white p-2">
          Save
        </button>
      </div>
    </div>
  );
}
