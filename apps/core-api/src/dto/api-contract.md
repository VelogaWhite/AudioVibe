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

## Search Tracks

### Endpoint

GET `/playlists/search?userId={internalUserId}&query={query}&limit={1-50}`

### Response Body

`TrackDTO[]`

## Playlist Management

- GET `/playlists?userId={internalUserId}`
- POST `/playlists`
- GET `/playlists/{playlistId}?userId={internalUserId}`
- PATCH `/playlists/{playlistId}`
- DELETE `/playlists/{playlistId}?userId={internalUserId}`
- POST `/playlists/{playlistId}/tracks`
- DELETE `/playlists/{playlistId}/tracks/{trackId}?userId={internalUserId}`
- PATCH `/playlists/{playlistId}/tracks/order`

## Audio Features

GET `/tracks/audio-features?userId={internalUserId}&trackIds={id1,id2}`

The result is cached with `track:features:{trackId}` for 7 days.
