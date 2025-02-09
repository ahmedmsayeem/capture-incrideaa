/**
 * Social Media Committee Uploads Component
 * Manages video uploads and display for social media team
 */
import React, { useState } from 'react';
import { api } from '~/utils/api';
import toast from 'react-hot-toast';
import CameraLoading from '../LoadingAnimation/CameraLoading';
import VideoUploadComponent from '../VideoUploadComponent';
import useUserName from '~/hooks/useUserName';
import ReactPlayer from 'react-player';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const SMCUploads: React.FC = () => {
  // State and API hooks
  const userName = useUserName() ?? 'user';
  const addVideo = api.smc.addVideo.useMutation();
  const { data: uploads, isLoading, isError, refetch } = api.smc.getAllUploads.useQuery();
  
  // UI state management
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast configuration
  const toastStyle = {
    style: {
      borderRadius: '10px',
      background: 'black',
      color: 'white',
    },
  };

  /**
   * Handlers for video upload and form submission
   */
  const handleUploadComplete = (url: string) => setUploadUrl(url);
  const handleAddEventClick = () => {
    setIsPopupOpen(true);
    setDescription('');
    setUploadUrl('');
  };

  const handlePopupClose = () => setIsPopupOpen(false);

  /**
   * Form submission handler
   * Validates and processes video upload
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadUrl) {
      toast.error('Please upload the video', toastStyle);
      return;
    }

    if (!description) {
      toast.error('Please enter a description', toastStyle);
      return;
    }
    setIsSubmitting(true);
    try {
      await addVideo.mutateAsync({
        author: userName,
        description,
        uploadKey: uploadUrl
      });
      setIsPopupOpen(false);
      setDescription('');
      setUploadUrl('');
      void refetch();
      toast.success('Capture added successfully.', toastStyle);
    } catch (error) {
      toast.error('Failed to upload capture.', toastStyle);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) return <CameraLoading />;

  return (
    <div className="p-4">
      <h1 className="flex justify-center text-4xl font-Teknaf mb-8 py-5 text-center"> SMC Uploads</h1>
      <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-11">
          <div>

            <ScrollArea className=" w-screen md:w-full whitespace-nowrap">
              {isError ? (
                <div>Error loading uploads. Please try again later.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 bg-black font-Trap-Regular text-sm">
                    <thead className="bg-white">
                      <tr>
                        <th className="text-black py-2 px-4 border-b text-center">Author</th>
                        <th className="text-black py-2 px-4 border-b text-center">Description</th>
                        <th className="text-black py-2 px-4 border-b text-center">Video</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-500 hover:text-black">
                          <td className="py-2 px-4 border-b text-center">{item.author}</td>
                          <td className="py-2 px-4 border-b text-center">{item.description}</td>
                          <td className="py-2 px-4 border-b text-center flex justify-center">
                            <ReactPlayer url={item.video_path} controls width={120} height={120} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


              )}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
        <div className="col-span-12 md:col-span-1">


          <div className="mb-4 flex gap-2">
            <button
              onClick={handleAddEventClick}
              className="p-2 border border-slate-700 rounded-xl w-32 text-white h-12 bg-neutral-950 font-Trap-Regular text-sm"
            >
              Add Video
            </button>
          </div>
        </div>
      </div>


      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur z-50">
          <div className="bg-black p-10 rounded-3xl shadow-lg relative w-96">
            <h2 className="text-2xl font-bold text-white mb-4">Add Story Upload</h2>
            <button
              onClick={handlePopupClose}
              className="absolute top-4 right-4 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
            >
              &times;
            </button>
            <form onSubmit={handleSubmit}>
              {
                uploadUrl ? (
                  <ReactPlayer url={`https://utfs.io/f/${uploadUrl}`} controls width="100%" height="360px" />
                ) : (
                  <VideoUploadComponent
                    endpoint='storiesUploader'
                    onUploadComplete={handleUploadComplete}
                    resetUpload={() => setUploadUrl('')}
                  />
                )
              }
              <label className="block mt-4 text-white">Description:</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2 w-full border border-slate-700 rounded-xl h-20 bg-black text-white"
              />
              <button type="submit"
                className="p-2 bg-white text-black rounded-xl w-full mt-5"
                disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMCUploads;

