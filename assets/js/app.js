function initApp() {

  const headerAnchor = document.getElementById("header");
  const btnAbout = document.getElementById("btn-about");
  const toTop = document.querySelector('.to-top');
  const aboutClassToCheck = 'collapsed';
  let hasClass = true;

  ///////////// TO TOP //////////////////
  
  if(toTop){
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      headerAnchor.scrollIntoView();
  })
  }
  
  /////////////// ABOUT SCROLL //////////////

  if(btnAbout){
    btnAbout.addEventListener('click', (e) => {
      hasClass = btnAbout.classList.contains(aboutClassToCheck);
      if(hasClass){ 
        headerAnchor.scrollIntoView();
      }
      
    });
  }
  
};

async function includeHTML(file, elementId, method) {
  let includeElementTarget = document.getElementById(elementId);
  const response = await fetch(file);
  if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
  const data = await response.text();
  if (method == 'include') {
    includeElementTarget.innerHTML = data;
  }
  if (method == 'insert') {
    includeElementTarget.insertAdjacentHTML('afterbegin', data);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp);
} else {
  initApp();
}