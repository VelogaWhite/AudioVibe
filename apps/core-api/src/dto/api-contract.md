# AudioVibe API Contract

## Generate Playlist

### Endpoint (reserved until ML service is available)

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

### Endpoint (reserved until ML service is available)

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

GET `/playlists/search?userId={internalUserId}&query={query}&limit={1-50}&offset={0+}`

The current route is retained for backward compatibility. The V2 public route
will be `/tracks/search` when the API version prefix and frontend are introduced.

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

## Audio Features (internal dataset/cache only)

GET `/tracks/audio-features?userId={internalUserId}&trackIds={id1,id2}`

The result is read from PostgreSQL and cached with `track:features:{trackId}` for
7 days. This endpoint must never call Spotify's Audio Features API.
