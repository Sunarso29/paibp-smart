(() => {
  "use strict";
  const prior = Array.isArray(window.PAIBP_RECITER_CATALOG) ? window.PAIBP_RECITER_CATALOG : [];
  window.PAIBP_RECITER_CATALOG = Object.freeze(prior.map((item) => {
    if (item.id === "muflih") {
      return Object.freeze({
        ...item,
        localOnly: true,
        localAudio: "./assets/audio/muflih-safitra-quran-central.mp3",
        localAudioOgg: "./assets/audio/muflih-safitra-quran-central.ogg",
        trackTitle: "Rekaman tilawah unggahan pengguna",
        bundledOffline: true,
      });
    }
    if (item.id === "abu-yazid") {
      return Object.freeze({
        ...item,
        localOnly: true,
        localAudio: "./assets/audio/abu-yazid-nurdin-al-hijr-85-99.mp3",
        localAudioOgg: "./assets/audio/abu-yazid-nurdin-al-hijr-85-99.ogg",
        trackTitle: "Al Qur'an Surat Al-Hijr ayat 85–99",
        bundledOffline: true,
      });
    }
    return item;
  }));
})();
