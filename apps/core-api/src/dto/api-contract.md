# AudioVibe API Contract

## Generate Playlist

### Endpoint

POST /playlists/generate

### Request Body

- prompt?: string
- presetName?: string
- limit?: number

### Response Body

- playlistId: string
- name: string
- tracks: TrackDTO[]
- averageAudioFeatures: AudioFeaturesDTO

## Refine Playlist

### Endpoint

POST /playlists/refine

### Request Body

- playlistId: string
- refinePrompt: string
- currentTrackIds: string[]

### Response Body

PlaylistResponseDTO

## Export Playlist

### Endpoint

POST /playlists/export

### Request Body

- playlistId: string
- name: string
- isPublic: boolean
- trackIds: string[]

### Response Body

- playlistId: string
- spotifyPlaylistId: string
- isExported: boolean