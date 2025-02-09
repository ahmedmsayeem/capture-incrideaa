import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import UseRefetch from "~/hooks/use-refetch";

import { api } from "~/utils/api";

/**
 * DeleteCapturePopUpModel Component
 * Modal dialog for soft deletion of captures with audit logging
 * Features:
 * - Confirmation dialog
 * - Loading state
 * - Audit logging
 * - Success/Error notifications
 * - Session user tracking
 */

type Props = {
    isOpen: boolean;          // Controls dialog visibility
    setOpen: (open: boolean) => void;  // Dialog state setter
    captureId: number;        // ID of capture to delete
}

export function DeleteCapturePopUpModel({ isOpen, setOpen, captureId }: Props) {
    // Mutation hooks for delete operation and audit logging
    const deleteImage = api.capture.deleteImage.useMutation();
    const auditLogMutation = api.audit.log.useMutation();
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession();
    const  refetch  =UseRefetch()
    const toastStyle = {
        style: {
            borderRadius: '10px',
            background: 'black',
            color: 'white',
        },
    };

    /**
     * Handles the deletion confirmation process
     * Includes audit logging and error handling
     */
    const confirmDelete = async () => {
        if (captureId) {
            try {
                setLoading(true)
                await deleteImage.mutateAsync({ id: captureId! });
                refetch();
                await auditLogMutation.mutateAsync({
                    sessionUser: session?.user.name || "Invalid User",
                    description: `Deleted a capture with id ${captureId} as disagreement`,
                    audit: 'CaptureManagementAudit'
                });
                setLoading(false)
                toast.success('Successfully deleted the capture', toastStyle);
            } catch (error) {
                toast.error('Error deleting capture', toastStyle);
                setLoading(false)
            } finally {
                setOpen(false);
                setLoading(false)
            }
        }
    };

    const cancelDelete = () => {
        toast.error('Event not deleted.', toastStyle);
        setOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen} >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Confirmation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete  ?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end mt-4 space-x-4">
                    <Button disabled={loading} onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                        {loading ? (
                            <svg
                                className="w-5 h-5 text-white animate-spin"
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
                            "Delete"
                        )}</Button>
                    <Button onClick={cancelDelete} className="bg-gray-300  text-black px-4 py-2 rounded">Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
