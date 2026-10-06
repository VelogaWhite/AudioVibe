import { PlaylistService } from './playlist.service.js';

describe('PlaylistService search cache', () => {
  it('returns cached search results without calling Spotify', async () => {
    const adapter = { searchTracks: vi.fn() };
    const redis = { get: vi.fn().mockResolvedValue('[{"id":"cached"}]'), set: vi.fn() };
    const service = new PlaylistService({} as never, adapter as never, { getClient: () => redis } as never, {} as never);

    await expect(service.searchTracks('user-1', 'lofi', 5)).resolves.toEqual([{ id: 'cached' }]);
    expect(adapter.searchTracks).not.toHaveBeenCalled();
  });

  it('calls Spotify and caches results on a miss', async () => {
    const tracks = [{ id: 'spotify-track' }];
    const adapter = { searchTracks: vi.fn().mockResolvedValue(tracks) };
    const redis = { get: vi.fn().mockResolvedValue(null), set: vi.fn().mockResolvedValue('OK') };
    const service = new PlaylistService({} as never, adapter as never, { getClient: () => redis } as never, {} as never);

    await expect(service.searchTracks('user-1', ' lofi ', 5)).resolves.toEqual(tracks);
    expect(adapter.searchTracks).toHaveBeenCalledWith('user-1', 'lofi', 5);
    expect(redis.set).toHaveBeenCalledWith(expect.stringMatching(/^search:/), JSON.stringify(tracks), 'EX', 86400);
  });
});
