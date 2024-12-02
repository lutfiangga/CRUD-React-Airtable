import { useState, useEffect } from "react";
import airtable from "./api";

const App = () => {
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
    photos: [],
  });

  // Fetch data dari Airtable
  const fetchData = async () => {
    try {
      const response = await airtable.get("/testing");
      setRecords(response.data.records);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submit (tambah/edit)
  const SaveData = async (e) => {
    e.preventDefault();

    try {
      // Persiapkan data foto untuk Airtable
      const photoAttachments = formData.photos.map(photo => ({
        url: URL.createObjectURL(photo),
        filename: photo.name
      }));

      const fields = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        Photos: photoAttachments, // Gunakan array objek dengan url
      };

      if (formData.id) {
        // Edit record
        await airtable.patch(`/testing/${formData.id}`, { fields });
      } else {
        // Tambah record
        await airtable.post("/testing", { fields });
      }

      // Reset form dan tutup modal
      setFormData({ id: "", name: "", address: "", phone: "", photos: [] });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving record:", error.response ? error.response.data : error);
      alert(`Gagal menyimpan data: ${error.response ? error.response.data.error.message : error.message}`);
    }
  };

  const DeleteData = async (id) => {
    try {
      await airtable.delete(`/testing/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Gagal menghapus data!");
    }
  };

  const EditData = (record) => {
    setFormData({
      id: record.id,
      name: record.fields.name,
      address: record.fields.address,
      phone: record.fields.phone,
      photos: [],
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">CRUD dengan Airtable</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {
            setFormData({ id: "", name: "", address: "", phone: "", photos: [] });
            setIsModalOpen(true);
          }}
        >
          Tambah Data
        </button>
      </div>

      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">No</th>
              <th className="border-b px-4 py-2">Nama</th>
              <th className="border-b px-4 py-2">Alamat</th>
              <th className="border-b px-4 py-2">Phone</th>
              <th className="border-b px-4 py-2">Foto</th>
              <th className="border-b px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id}>
                <td className="border-b px-4 py-2">{index + 1}</td>
                <td className="border-b px-4 py-2">{record.fields.name}</td>
                <td className="border-b px-4 py-2">{record.fields.address}</td>
                <td className="border-b px-4 py-2">{record.fields.phone}</td>
                <td className="border-b px-4 py-2">
                  {record.fields.Photos?.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.url}
                      alt="Foto"
                      className="w-16 h-16 object-cover rounded mr-2 inline-block"
                    />
                  )) || "N/A"}
                </td>
                <td className="border-b px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
                    onClick={() => EditData(record)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => DeleteData(record.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">
              {formData.id ? "Edit Data" : "Tambah Data"}
            </h2>
            <form onSubmit={SaveData} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Alamat</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Foto</label>
                <input
                  key={formData.photos.length}
                  type="file"
                  multiple
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFormData({ ...formData, photos: Array.from(e.target.files) })
                  }
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;