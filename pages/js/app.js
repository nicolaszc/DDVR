function initApp() {
 
  const headerAnchor = document.getElementById("header");
  const btnAbout = document.getElementById("btn-about");
  const toTop = document.querySelector('.to-top');
  const aboutClassToCheck = 'collapsed';
  let hasClass = true;

  const siteRoot = window.location.href;
  const iconAt = document.getElementById("icon-at");
  const iconLg = document.getElementById("icon-lg");
  const iconSm = document.getElementById("icon-sm");
  const metaSiteRoot = document.getElementById("site-root");
  iconAt.setAttribute('href', siteRoot + 'assets/img/ico.png');
  iconLg.setAttribute('href', siteRoot + 'assets/img/ico.png');
  iconSm.setAttribute('href', siteRoot + 'assets/img/ico.png');
  metaSiteRoot.setAttribute('content', siteRoot)

  // TO TOP
  if (toTop) {
    toTop.addEventListener('click', e => {
      e.preventDefault();
      headerAnchor.scrollIntoView();
    });
  }

  // ABOUT scroll
  if (btnAbout) {
    btnAbout.addEventListener('click', e => {
      hasClass = btnAbout.classList.contains(aboutClassToCheck);
      if (hasClass) headerAnchor.scrollIntoView();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("componentsLoaded", initApp);
} else {
  initApp();
}
