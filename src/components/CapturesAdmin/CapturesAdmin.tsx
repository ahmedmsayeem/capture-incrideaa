/**
 * CapturesAdmin Component
 * Main dashboard for managing captures. Features:
 * - Toggle between active and deleted captures
 * - Batch upload functionality
 * - DataTable display of captures
 */
import React, { useState } from 'react';
import { api } from '~/utils/api';

import { DataTable } from './capture-data-table';
import { deletedCapturecolumns } from './columns/deleted-capture-columns';
import { activeCapturecolumns } from './columns/active-capture-columns';
import GalleryBatchUpload from './batchUplode/BatchUpload';
import UseRefetch from '~/hooks/use-refetch';

const CapturesAdmin: React.FC = () => {
  // Persistent state management for capture view
  const refetch = UseRefetch();

  const initialState = sessionStorage.getItem('capture') || 'active';
  const [captureState, setCaptureState] = useState<string>(initialState);

  const { data: activeGalleryData = [], refetch: refetchActive } =
    api.capture.getAllActivecapturesforAdmin.useQuery(undefined, {
      enabled: captureState === 'active',
    });

  const { data: deletedGalleryData = [], refetch: refetchDeleted } =
    api.capture.getAllDeletedcapturesforAdmin.useQuery(undefined, {
      enabled: captureState === 'deleted',
    });

  /**
   * Toggles between active and deleted captures view
   * Persists selection in sessionStorage
   */
  const toggleCaptureState = () => {
    const newState = captureState === 'active' ? 'deleted' : 'active';
    sessionStorage.setItem('capture', newState);
    setCaptureState(newState);

    if (newState === 'active') {
      refetchActive();
    } else {
      refetchDeleted();
    }

    refetch();
  };


  const galleryData = captureState === 'active' ? activeGalleryData : deletedGalleryData;
  const columns = captureState === 'active' ? activeCapturecolumns : deletedCapturecolumns;

  return (
    <div className='p-3'>
      <div className="mb-4">
        <button
          onClick={toggleCaptureState}
          className={`px-4 py-2 rounded-md ${captureState === 'active' ? 'bg-blue-500 text-white' : 'bg-red-500'}`}
        >
          {captureState === 'active' ? 'Active Captures' : 'Deleted Captures'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4  md:grid-cols-2">
        <div className="gap-4  mt-3">
          <GalleryBatchUpload />
        </div>
        <div className="  gap-4">
          <DataTable columns={columns} data={galleryData} />
        </div>
      </div>

    </div>
  );
};

export default CapturesAdmin;
