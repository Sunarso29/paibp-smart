(() => {
  "use strict";
  const teacher=sessionStorage.getItem('paibp-smart-visitor-role-v1')==='guru';
  const editor=sessionStorage.getItem('paibp-smart-editor-unlocked')==='yes'||sessionStorage.getItem('paibp-smart-owner-gateway-v30')==='yes';
  if(!teacher&&!editor)return;
  function mount(){
    if(document.querySelector('#multimapel-admin-entry-v89'))return;
    const target=document.querySelector('#panel-teacher .teacher-controls,#panel-teacher .teacher-doc-menu,#panel-editor,.editor-dashboard');
    if(!target)return;
    const a=document.createElement('a');a.id='multimapel-admin-entry-v89';a.className='mm-admin-entry-v89';a.href='mapel-lain.html#administrasi-mapel';
    a.innerHTML='<span>▦</span><div><strong>Administrasi Mapel Lain</strong><small>CP • KKTP • ATP • Prota • Promes • Modul</small></div><b>→</b>';
    target.parentElement?.insertBefore(a,target.nextSibling);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(mount,400)},{once:true});else setTimeout(mount,400);
})();
