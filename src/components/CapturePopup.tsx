import { useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo, useContext } from "react"; // Import useContext
import { FaDownload } from "react-icons/fa";
import { api } from "~/utils/api";
interface CapturePopupProps {
  selectedImage: string | null;
  selectedImageOg: string | null;
  selectedImageId: number | null;
  handleClosePopup: () => void;
  handleDownload: (imageUrl: string) => void;
  openRemovalPopup: (imageUrl: string) => void;
  session_user: string;
  session_role: string;
}

const CapturePopup: React.FC<CapturePopupProps> = ({
  selectedImage,
  selectedImageOg,
  selectedImageId,
  handleClosePopup,
  handleDownload,
  openRemovalPopup,
  session_user,
  session_role
}) => {
  const { data: allDownloadLogs, isLoading: isDownloadLogLoading } = api.download.getAllLogs.useQuery();

  const downloadCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    if (allDownloadLogs) {
      allDownloadLogs.forEach((log: any) => {
        counts[log.image_id] = (counts[log.image_id] || 0) + 1;
      });
    }
    return counts;
  }, [allDownloadLogs]);

  const getDownloadCount = (image_id: number): string => {
    if (isDownloadLogLoading) return "...";
    return downloadCounts[image_id] ? `${downloadCounts[image_id]}` : "0";
  };

  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col items-center justify-center z-30"
      role="dialog"
      aria-modal="true"
      onClick={handleClosePopup}
    >
      <div className="relative bg-black p-6 rounded-3xl shadow-lg font-Trap-Regular max-w-xs sm:max-w-md w-full z-30">
        <div className="flex justify-center py-8">
          {/* Transparent overlay */}
          <div
            className="absolute inset-0 bg-transparent z-10"
            style={{ pointerEvents: "none" }} 
          />
          <Image
            src={selectedImage || "/images/fallback.jpg"}
            alt="Selected"
            width={200}
            height={200}
            layout="responsive"
            className="rounded mb-4"
            onContextMenu={(e) => e.preventDefault()} 
            onDragStart={(e) => e.preventDefault()} 
          />
          {/* Disable right-click globally with Tailwind */}
          <div className="absolute inset-0 pointer-events-none" />
        </div>
        <div>
          {session_role === "admin" && selectedImageId && (
            <div className="text-white flex justify-end">
            <div className="px-2"><FaDownload /></div>{getDownloadCount(selectedImageId)}
            </div>
          )}
        </div>
        <div className="flex justify-center items-center space-x-4 py-5">
          <button
            className="bg-white hover:bg-black hover:text-white w-52 justify-center text-black px-2 py-2 rounded-full flex items-center transition-all"
            onClick={() => handleDownload(selectedImageOg || selectedImage)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v12m8-8l-8 8-8-8"
              />
            </svg>
            Download
          </button>
        </div>
        <p className="text-xs text-center py-5 w-full">
          Note: If you prefer this capture not to be public or have any
          issues.
          <br />
          Please{" "}
          <a
            className="text-blue-500 cursor-pointer"
            onClick={() => {
              handleClosePopup();
              openRemovalPopup(selectedImage);
            }}
          >
            click here to Request Removal
          </a>
          .
          <br />
          We’ll verify your request and work on it soon.
        </p>
      </div>
    </div>
  );
};

export default CapturePopup;
