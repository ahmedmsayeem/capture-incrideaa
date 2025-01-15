import { on } from "nodemailer/lib/xoauth2";
import { use, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,

} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import UseRefetch from "~/hooks/use-refetch";
import { api } from "~/utils/api";

type Props = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  captureId: number;
}

export default function RestorePopup({
  isOpen,
  setOpen,
  captureId
}
  : Props
) {
  const restoreImage = api.gallery.restoreDeletedGallery.useMutation();
  const [loading, setLoading] = useState(false)
  const refetch = UseRefetch()
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore this image?</DialogTitle>
          <DialogDescription>
            Are you sure you want to bring this image back to your gallery?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row items-center justify-start gap-2">
          <Button
            onClick={() => {
              setLoading(true);
              restoreImage
                .mutate({ id: captureId! },
                  {
                    onSuccess: () => {
                      toast.success("Image Restored successfully");
                      refetch()
                      setLoading(false)
                      setOpen(false)
                    },
                    onError: (error) => {
                      toast.error("Chalna Chutiye");
                      setLoading(false)
                    },
                  }
                )

            }}
          >
            {loading ? (
              <svg
                className="w-5 h-5 text-black animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Restore"
            )}
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancel
          </Button>

        </div>


      </DialogContent>
    </Dialog>
  )
}
