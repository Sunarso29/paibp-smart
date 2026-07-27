const button=document.querySelector('.menu-btn');const links=document.querySelector('.links');if(button&&links){button.addEventListener('click',()=>{links.classList.toggle('open');button.setAttribute('aria-expanded',links.classList.contains('open'))})}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
