(function(){
  var root=document.documentElement;
  var scheduled=false;
  var observer=new MutationObserver(function(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      if(window.innerWidth>root.offsetWidth){
        root.classList.add("wd-scrollbar");
        observer.disconnect();
      }
    });
  });
  window.addEventListener("load",function(){observer.disconnect();},{once:true});
  observer.observe(root,{childList:true,subtree:true});
})();
