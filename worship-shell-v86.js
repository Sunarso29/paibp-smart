(() => {
  "use strict";
  function mount(){
    const menu=document.querySelector('.islamic-menu');
    const content=document.querySelector('.islamic-content');
    if(!menu||!content)return false;
    let button=menu.querySelector('[data-islamic-view="worship"]');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.dataset.islamicView='worship';
      button.setAttribute('aria-pressed','false');
      button.textContent='Simulasi Ibadah';
      const insights=menu.querySelector('[data-islamic-view="insights"]');
      menu.insertBefore(button,insights||null);
    }
    let page=content.querySelector('[data-islamic-page="worship"]');
    if(!page){
      page=document.createElement('section');
      page.dataset.islamicPage='worship';
      page.hidden=true;
      content.append(page);
    }
    window.PAIBP_ICON_ART_V86?.run?.();
    return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  window.PAIBP_WORSHIP_SHELL_V86=Object.freeze({mount});
})();
