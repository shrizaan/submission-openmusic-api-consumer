const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(playlistId) {
    const querySearchPlaylist = {
      text: 'SELECT playlists.id AS id, playlists.name AS name, users.username AS username FROM playlists JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [playlistId],
    };

    const playlistQueryResult = await this._pool.query(querySearchPlaylist);

    if (!playlistQueryResult.rows.length) {
      throw new Error('Playlist ID not found.');
    }

    const querySearchSong = {
      text: `SELECT songs.*
             FROM songs
                      JOIN playlist_songs ON songs.id = playlist_songs.song_id
                      JOIN playlists ON playlists.id = playlist_songs.playlist_id
                      WHERE playlist_id = $1 `,
      values: [playlistId],
    };

    const songQueryResult = await this._pool.query(querySearchSong);

    return {
      ...playlistQueryResult.rows.map((r) => ({
        id: r.id,
        name: r.name,
        username: r.username,
      }))[0],
      songs: songQueryResult.rows.map((r) => ({
        id: r.id,
        title: r.title,
        performer: r.performer,
      })),
    };
  }
}

module.exports = PlaylistsService;
