import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import downloadImage from "~/utils/downloadUtils";
import TitleDescription from "~/components/TitleDescription";
import FallingClipart from "~/components/BackgroundFallAnimation/FallingClipart";
import CameraLoading from "~/components/LoadingAnimation/CameraLoading";
import { useRouter } from "next/router";
import RequestRemovalModal from "~/components/RequestRemovalModal";
import CapturePopup from "~/components/CapturePage/CapturePopup";
import { useSession } from "next-auth/react";
import ImagesGrid from "~/components/Image-grid/image-grid";
import ImagePopup from "~/components/ImagePopup/image-popup";


const YourSnapsPage: React.FC = () => {
  const logDownload = api.download.logDownload.useMutation();
  const submitRemovalRequest = api.request.submit.useMutation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [removalImage, setRemovalImage] = useState<string | null>(null);
  const { data: session } = useSession();
  const session_user = session?.user.email || "";
  const router = useRouter();
  const { data: cardState } = api.capturecard.getCardStateByName.useQuery(
    { cardName: "Abode of Memories" }
  );
  useEffect(() => {
    if (cardState === "inactive") {
      router.push("/captures");
    }
  }, [cardState, router]);


  const { data, isLoading, error, fetchNextPage, isFetchingNextPage } = api.gallery.getApprovedImagesByCategory.useInfiniteQuery({ category: "pronite", includeDownloadCount: session?.user.role === "admin" }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  },);

  const images = data?.pages.map(page => page.images).flat() || []

  const [selectedImageOg, setSelectedImageOg] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const handleImageClick = (imagePath: string, imagePathOg: string, imageId: number) => {
    setSelectedImage(imagePath);
    setSelectedImageOg(imagePathOg);
    setSelectedImageId(imageId);
  };
  const handleClosePopup = () => setSelectedImage(null);

  const handleDownload = async (imagePathOg: string) => {
    await downloadImage(imagePathOg, "capture-incridea.png");
    await logDownload.mutateAsync({ image_id: selectedImageId || 0, session_user });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openRemovalPopup = (imagePath: string) => {
    setRemovalImage(imagePath);
    setIsModalOpen(true);
  };

  const closeRemovalPopup = () => {
    setRemovalImage(null);
    setIsModalOpen(false);
  };

  const handleRemovalSubmit = async (data: {
    name: string;
    email: string;
    description: string;
    uploadUrl: string;
    imagePath: string;
  }) => {
    try {
      await submitRemovalRequest.mutateAsync({
        name: data.name,
        email: data.email,
        description: data.description,
        idcard: data.uploadUrl,
        image_path: data.imagePath,
      });
    } catch (error) {
      console.error("Error submitting removal request:", error);
    }
  };

  if (isLoading) return <CameraLoading />;
  if (error) return <p className="text-white text-center">Error loading images.</p>;

  return (
    <div className="flex flex-col">
      <TitleDescription
        title="Your Snaps"
        description="Engaging our audience and building community through strategic social media initiatives."
        imagePath="https://utfs.io/f/0yks13NtToBiJ2v3kqw4BLygFdW15xChAKiDEleRHcja6tkI"
      />
      <FallingClipart />

      <ImagesGrid
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        nextCursor={data?.pages.at(-1)?.nextCursor}
        isLoading={isLoading}
        images={images.map(image => ({
          id: image.id,
          compressed_path: image.compressed_path,
          image_path: image.image_path,
          onClick: () => handleImageClick(image.compressed_path, image.image_path, image.id),
          downloadCount: image._count?.downloadLog,
        }))} />

      <ImagePopup
        selectedImage={selectedImage}
        selectedImageOg={selectedImageOg}
        selectedImageId={selectedImageId}
        handleClosePopup={handleClosePopup}
        handleDownload={handleDownload}
        openRemovalPopup={openRemovalPopup}
        session_user={session_user}
        session_role={session?.user.role || 'user'}
        sessionId={session?.user.id || ""}
      />

      <RequestRemovalModal
        isOpen={isModalOpen}
        imagePath={removalImage}
        onClose={closeRemovalPopup}
        onSubmit={handleRemovalSubmit}
      />
    </div>
  );
};

export default YourSnapsPage;
