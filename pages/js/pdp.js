// pdp.js

function initPdp() {
  const siteRoot = document.getElementById('site-root').getAttribute('content');
  console.log('PDP cargada ✔ at ' + siteRoot);    

    const container = document.querySelector('main');
    //const randomContainer = container.querySelector('#random-cards');

    if (container && window.pendingPdpHtml) {
      container.innerHTML = window.pendingPdpHtml;
      delete window.pendingPdpHtml; // limpiar
      console.log('ficha')
      if (window.pendingRandomCards) {
        container.insertAdjacentHTML("beforeend", window.pendingRandomCards);
        delete window.pendingRandomCards;
        console.log(window.pendingRandomCards)
      }
    }

    /* const randomContainer = document.getElementById('random-cards');
    if (randomContainer && window.pendingRandomCards) {
        randomContainer.innerHTML = window.pendingRandomCards;
        delete window.pendingRandomCards;
    } */

    // Botón volver (SPA)
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', e => {
            e.preventDefault();
            window.history.back();
        });
    }
    
}

// Escucha el evento disparado por el mini-router
document.addEventListener('pdpLoaded', (e) => {
  initPdp();
});
