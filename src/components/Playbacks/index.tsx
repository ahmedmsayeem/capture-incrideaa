import React from 'react'
import Loading from '~/pages/Loading'
import { api } from '~/utils/api'
import { DataTable } from './dataTable'
import { Playbackscolumns } from './coloums'

/**
 * AdminPlayBacks Component
 * Main component for managing playback videos in admin panel
 * Displays a table of all playbacks with management options
 */
const AdminPlayBacks = () => {
  // Fetch playbacks data
  const { data: playBacks = [], isLoading } = api.playbacks.getAllPlaybacks.useQuery()

  if (isLoading) return <Loading />;

  return (
    <div className="p-4">
      <h1 className="flex justify-center text-4xl font-Teknaf mb-8 py-5 text-center">
        PlayBacks
      </h1>
      <DataTable columns={Playbackscolumns} data={playBacks} />
    </div>
  )
}

export default AdminPlayBacks
