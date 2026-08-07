(() => {
  "use strict";
  const delegate = () => window.PAIBP_CAT_V67 || window.PAIBP_CAT_V65 || null;
  window.PAIBP_CAT_V59 = Object.freeze({
    version:"67",
    startFromLegacy(){},
    enterStudentRoom(){ delegate()?.showLogin?.(); }
  });
})();
