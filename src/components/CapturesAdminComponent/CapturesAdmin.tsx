import React, { useState } from 'react';
import { FaSearch, FaSync, FaTrash } from 'react-icons/fa';
import UploadComponent from '../UploadComponent';
import { api } from '~/utils/api';

const CapturesAdmin: React.FC = () => {
  const addImage = api.gallery.addImage.useMutation();
  const { data: gallery, isLoading: galleryLoading, isError: galleryError, refetch } = api.gallery.getAllGallery.useQuery();
  const { data: events, isLoading: eventsLoading } = api.events.getAllEvents.useQuery();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newImage, setNewImage] = useState<{ event_name: string; }>({ event_name: '' });
  const [uploadUrl, setUploadUrl] = useState<string>('');

  const handleUploadComplete = (url: string) => {
    setUploadUrl(url);
  };

  const handleAddEventClick = () => {
    setIsPopupOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewImage(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadUrl) {
      console.log('No URL to submit');
      return;
    }

    if (!newImage.event_name) {
      alert("Please select an event name.");
      return;
    }

    try {
      const result = await addImage.mutateAsync({ ...newImage, uploadKey: uploadUrl });
      console.log('Event added:', result);
      setIsPopupOpen(false);
      setNewImage({ event_name: '' });
      setUploadUrl(''); // Resetting the slider state here
      refetch(); // Refetch gallery after adding
    } catch (error) {
      console.error('Error adding image:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className='flex justify-center text-3xl font-extrabold mb-8 py-5'>Captures Management</h1> 
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={handleAddEventClick}
          className="p-2 border border-slate-700 rounded-xl w-32 text-white h-12 bg-black"
        >
          Add
        </button>
        <button
          onClick={() => refetch()}
          className="ml-2 p-2 border border-slate-700 rounded-xl w-12 h-12 text-white bg-black flex items-center justify-center"
        >
          <FaSync />
        </button>
      </div>

      {galleryLoading ? (
        <div>Loading...</div>
      ) : galleryError ? (
        <div className=''>Error loading events. Please try again later.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-black">
            <thead className="bg-white">
              <tr>
                <th className="text-black border border-gray-300 p-2">Event-Name</th>
                <th className="text-black border border-gray-300 p-2">Image</th>
              </tr>
            </thead>
            <tbody>
              {gallery?.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50 hover:text-black'>
                  <td className="py-2 px-4 border-b border-slate-700 text-center">{item.event_name}</td>
                  <td className="py-2 px-4 border-b border-slate-700 text-center">
                    <img src={item.image_path} alt={item.event_name} className="h-32 w-32 object-cover" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur z-50">
          <div className="bg-black p-10 rounded-3xl shadow-lg relative text-cen w-96">
              <h2 className="text-2xl font-bold text-white mb-4 ">Add Capture</h2>
              <button onClick={() => setIsPopupOpen(false)} className="absolute top-6 right-6 text-white p-5">&times;</button>
            <form onSubmit={handleSubmit}>
            <label className="block mt-5 mb-2 text-white">Event Background:</label>
            <UploadComponent onUploadComplete={handleUploadComplete} resetUpload={() => setUploadUrl('')} />

              <label className="block mt-5 mb-2 text-white">Event Name:</label>
              {eventsLoading ? (
                <select className="w-full p-2 rounded" disabled>
                  <option>Loading events...</option>
                </select>
              ) : (
                <select
                  name="event_name"
                  value={newImage.event_name}
                  onChange={handleFormChange}
                  className="p-2 w-full border border-slate-700 rounded-xl bg-black text-white"
                >
                  <option value="" disabled>Select an event</option>
                  {events?.map(event => (
                    <option key={event.id} value={event.name}>{event.name}</option>
                  ))}
                </select>
              )}
              

              <button type="submit" className="p-2 bg-white text-black rounded-xl w-full mt-10">Submit</button>
            </form>
          </div>
        </div>
      )}

      </div>
  );
};

export default CapturesAdmin;
