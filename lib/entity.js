/**
 * User: jgcolo
 * Date: 3/17/13
 * Time: 12:57 AM
 */

module.exports.Song = function (url, artist, title, album, gender) {
    this.artist = artist || "";
    this.title = title || "";
    this.album = album || "";
    this.url = url || "";
    this.gender = gender || "";
    this.track = "";
};
