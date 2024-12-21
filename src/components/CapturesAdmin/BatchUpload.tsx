import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '~/utils/api';

interface GalleryItem {
  id: number;
  event_name: string;
  event_category: string;
  upload_type: string;
  state: 'pending' | 'declined' | 'approved';
  image_path: string;
  date_time: Date;
}

const GalleryBatchUpload = () => {
  const { data: gallery, isLoading: galleryLoading, isError: galleryError, refetch } = api.gallery.getAllGallery.useQuery();
  const batchUpload = api.gallery.batchUpload.useMutation();
  const deleteGalleryItem = api.gallery.batchUpload.useMutation();

  const [selectedBatch, setSelectedBatch] = useState('');
  const [filteredGallery, setFilteredGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    if (gallery && selectedBatch) {
      setFilteredGallery(
        gallery.filter((item: GalleryItem) => item.upload_type === selectedBatch)
      );
    } else {
      setFilteredGallery([]);
    }
  }, [gallery, selectedBatch]);

  const handleBatchUpload = async () => {
    if (filteredGallery.some((item) => item.state !== 'approved')) {
      toast.error('There are unapproved captures. Please request approval.', {
        position: 'top-center',
      });
      return;
    }

    try {
      await Promise.all(
        filteredGallery.map((item) =>
          batchUpload.mutateAsync({
            id: item.id,
            upload_type: 'direct',
            state: 'approved',
          })
        )
      );

      toast.success('Batch uploaded successfully!', { position: 'top-center' });
      refetch();
      setSelectedBatch('');
    } catch {
      toast.error('Failed to upload batch. Please try again.', { position: 'top-center' });
    }
  };

  if (galleryLoading) return <p>Loading...</p>;
  if (galleryError) return <p>Error loading gallery data.</p>;

  const eventNames = Array.from(new Set(gallery?.map((item: GalleryItem) => item.event_name) || []));

  return (
    <div className="p-4 bg-blackrounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Gallery Batch Upload</h1>

      <label htmlFor="batch" className="block mb-2 text-lg font-semibold">Batch Name:</label>
      <select
        id="batch"
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
        className="block w-full p-2 border rounded-md bg-black"
      >
        <option value="">Select a batch</option>
        {eventNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button
        onClick={handleBatchUpload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
      >
        Upload Batch
      </button>

      <table className="mt-6 w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Event Name</th>
            <th className="border border-gray-300 px-4 py-2">Capture Category</th>
            <th className="border border-gray-300 px-4 py-2">State</th>
            <th className="border border-gray-300 px-4 py-2">Image</th>
            <th className="border border-gray-300 px-4 py-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredGallery.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 px-4 py-2">{item.event_name}</td>
              <td className="border border-gray-300 px-4 py-2">{item.event_category}</td>
              <td className="border border-gray-300 px-4 py-2">{item.state}</td>
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={item.image_path}
                  alt={item.event_name}
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={async () => {
                    try {
                      // Pass the required properties for deletion
                      await deleteGalleryItem.mutateAsync({
                        id: item.id,
                        upload_type: item.upload_type, // Pass upload_type
                        state: item.state, // Pass state
                      });
                      toast.success('Capture deleted successfully!');
                      refetch();
                    } catch {
                      toast.error('Failed to delete capture.');
                    }
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GalleryBatchUpload;
