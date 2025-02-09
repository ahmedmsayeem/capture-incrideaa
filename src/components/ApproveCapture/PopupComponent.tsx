/**
 * PopupComponent
 * A modal component that displays an enlarged version of a selected image
 * Includes a close button and click-outside-to-close functionality
 */

import Image from "next/image";

interface PopupProps {
  selectedImage: string | null;   // URL of the image to display
  handleClosePopup: () => void;   // Callback function to close the popup
}

const PopupComponent: React.FC<PopupProps> = ({
  selectedImage,
  handleClosePopup,
}) => {
  // Don't render if no image is selected
  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col items-center justify-center z-30"
      role="dialog"
      aria-modal="true"
      onClick={handleClosePopup}
    >
      <div className="relative bg-black p-6 rounded-lg shadow-lg max-w-xs sm:max-w-md w-full z-30" >
        <div className="flex">
          <button
            onClick={handleClosePopup}
            className="absolute top-0 right-5 text-white text-4xl p-5"
          >
            &times;
          </button>
        </div>
        <div className="flex justify-center py-10">
          <Image
            src={selectedImage || "/images/fallback.webp"}
            alt="Selected"
            width={200}
            height={200}
            
            className="rounded mb-4"
          />
        </div>
      </div>
    </div>
  );
};

export default PopupComponent;
