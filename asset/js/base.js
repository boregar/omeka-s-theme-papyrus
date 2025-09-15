//---------------------------------------- variables globales

var osdViewer = null;
var osdSourceType = null;
var lgViewer = null;
var scrollDiff = null;
var isoGal = [];
var flkGalHome = null;

// ---------------------------------------- gestion des cookies

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/; SameSite=Lax";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// ---------------------------------------- gestion du spinner

function addSpinnerManager(overlay) {
  document.body.onbeforeunload = function(event) {
    // n'affiche pas le spinner s'il s'agit d'un lien vers un téléchargement
    var elt = event.target.activeElement;
    //console.log(elt);
    //event.returnValue = "\\o/";
    if (elt.matches('a') && elt.href.match(/\.pdf$/)) return;
    overlay.classList.add('is-active');
  };

  document.body.onpagehide = function() {
    overlay.classList.remove('is-active');
  };
}

//---------------------------------------- gestionnaire de l'icône de recherche

function addSearchManager(iconSearch) {
  iconSearch.addEventListener('click', function(event) {
    document.querySelector('overlay.search').classList.add('is-active');
    return false;
  });
  if (iconClose = document.querySelector('overlay.search #cm-close-icon')) {
    iconClose.addEventListener('click', function(event) {
      document.querySelector('overlay.search').classList.remove('is-active');
      return false;
    });
  }
}

//---------------------------------------- gestionnaire du header sticky

function addStickyHeaderManager(stickyHeader) {
  scrollDiff = document.querySelector('html').scrollHeight - document.querySelector('html').clientHeight;
  window.addEventListener('scroll', function(event) {
    // évite le cas où la réduction de hauteur du header (cf CSS) implique que la hauteur du HTML devienne inférieure à celle de la fenêtre --> son scrollTop repasse à 0 --> la réduction du header est annulée
    // note 1: 56 correspond à la hauteur du header une fois réduit
    // note 2: on ajoute stickyHeader.offsetTop pour le cas où il y a un autre élément avant le header, par exemple la barre d'admin d'Omeka
    if (scrollDiff <= (stickyHeader.offsetTop + 56)) {
      return false;
    }
    if (document.querySelector('html').scrollTop > 1) {
      stickyHeader.classList.add('cm-stick');
    } else {
      stickyHeader.classList.remove('cm-stick');
    }
  });
}

//---------------------------------------- gestionnaire du bouton "back-to-top"

function addBackToTopManager(btnBackToTop) {
  window.addEventListener('scroll', function(event) {
    if (document.querySelector('html').scrollTop > 200) {
      btnBackToTop.style.opacity = 0.5;
    } else {
      btnBackToTop.style.opacity = 0;
    }
  });
  btnBackToTop.addEventListener('click', function(event) {
    document.querySelector('html').scrollTop = 0;
    return false;
  });
}

//---------------------------------------- gestionnaire du menu burger

function addBurgerManager(burgerClass) {
  const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(burgerClass), 0);
  navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      const targetElem = document.getElementById(target);
      el.classList.toggle('bulma-is-active');
      targetElem.classList.toggle('bulma-is-active');
    });
  });
}

//---------------------------------------- gestionnaire de galerie flickity

function addFlickityManager(flkBlock, flbEnable = false) {
  // calcule le nombre de points à afficher en-dessous de la galerie
  var nGroupCells = Math.ceil(flkBlock.querySelectorAll('.cm-flk-cell').length / (32 * flkBlock.offsetWidth / 1088));
  // crée un carousel flickity
  var flkGal = new Flickity(flkBlock, {
    cellSelector: '.cm-flk-cell',
    contain: true,
    imagesLoaded: true,
    wrapAround: (flkBlock.getAttribute('data-wraparound') === 'true'),
    freeScroll: (flkBlock.getAttribute('data-freescroll') === 'true'),
    autoPlay: parseInt(flkBlock.getAttribute('data-autoplay')),
    pauseAutoPlayOnHover: false,
    prevNextButtons: (flkBlock.getAttribute('data-prevnextbuttons') !== 'false'),
    draggable: (flkBlock.getAttribute('data-draggable') !== 'false'),
    fade: (flkBlock.getAttribute('data-fade') === 'true'),
    groupCells: nGroupCells
  });
  // relance le player de la page d'accueil s'il est stoppé par un clic
  if (flkBlock.classList.contains('slider-home')) {
    flkGalHome = flkGal;
    flkGalHome.on('pointerDown', function( event, pointer ) {
      flkGalHome.playPlayer();
    });
  }
  // crée une galerie FsLightbox
  if (flbEnable) {
    // crée un identifiant unique pour la galerie fslightbox
    var idGal = Math.floor(Math.random() * 1000);
    flkBlock.querySelectorAll('a').forEach((item, i) => {
      /*
      item.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        var iImg = item.getAttribute('data-index');
        var tabImg = [];
        flkBlock.querySelectorAll('a img').forEach((img, i) => {
          tabImg.push(img.getAttribute('src').replace('/styles/flickity_standard/public', ''));
        });
        var lightbox = new FsLightbox();
        lightbox.props.sources = tabImg;
        lightbox.open(iImg);
      });
      */
      // associe chaque image du carousel à la galerie
      item.setAttribute('data-fslightbox', 'gal-flk-' + idGal);
      // ajoute la référence à l'image originale d'après celle de la miniature
      item.setAttribute('href', item.querySelector('img')?.getAttribute('src').replace('/files/medium/', '/files/original/'));
      // ajoute la légende
      item.setAttribute('data-caption', item.querySelector('.resource-name').innerText);
    });
    // met à jour la galerie
    refreshFsLightbox();
  }
}

//---------------------------------------- gestionnaire de galerie isotope

function addIsotopeManager(isotope, selector, sizer, origin, activate) {
  // ajoute l'élément sizer et crée la galerie
  isotope.insertAdjacentHTML('afterbegin', '<div class="cm-iso-sizer-' + sizer + '"></div>');
  newGal = new Isotope(isotope, {
    itemSelector: selector,
    percentPosition: (sizer !== 'auto'),
    originLeft: (origin === 'left'),
    layoutMode: 'masonry',
    masonry: {
      columnWidth: 'div.cm-iso-sizer-' + sizer
    },
    transitionDuration: '0.2s'
  });
  isoGal.push(newGal);

  // clic sur un élément de la galerie
  if (activate) {
    isotope.addEventListener('click', function(event) {
      var element = event.target.closest(selector);
      if (element.classList.contains('is-active')) {
        element.classList.remove('is-active');
      } else {
        isotope.querySelector('div.views-row.is-active')?.classList.remove('is-active');
        element.classList.add('is-active');
      }
      isoGal.forEach((item, i) => {
        item.arrange();
      });

    });
  }
}

//---------------------------------------- gestionnaire de la visionneuse LG

// note: cette fonction remplace le fichier par défaut /sites/omksa.boregar.org/omeka-s/application/asset/js/lg-itemfiles-config.js
function addMediaManagerLG(lgContainer) {
  /*
  lgContainer.addEventListener('lgContainerResize', (event) => {
    var scaleRatio = document.querySelector('.cm-item-viewer .lg-img-wrap').clientWidth / document.querySelector('.cm-item-viewer .lg-image').clientWidth;
    document.querySelector('.cm-item-viewer .lg-image').style.transform = 'scale3d(' + scaleRatio + ', ' + scaleRatio + ', ' + scaleRatio + ')';
  });

  lgContainer.addEventListener('lgSlideItemLoad', (event) => {
    setTimeout(function() {
      lgViewer.refreshOnResize();
    }, event.detail.delay + 200);
  });
  */
  lgViewer = lightGallery(lgContainer, {
      licenseKey: '999D4292-0B8E4F74-9CC803A5-D4AA79D6',
      container: lgContainer,
      /*dynamic: false,
      hash: true,
      closable: false,
      thumbnail: true,
      selector: '.media.resource',
      showMaximizeIcon: true,
      autoplayFirstVideo: false,
      exThumbImage: 'data-thumb',
      flipVertical: false,
      flipHorizontal: false,
      plugins: [
          lgThumbnail,lgZoom,lgVideo,lgHash,lgRotate
      ],
      showZoomInOutIcons: true,
      actualSize: false,*/
  });
  lgViewer.openGallery();
}

//---------------------------------------- main

document.addEventListener('DOMContentLoaded', function () {

  // adapte la hauteur de la section hero de la page d'accueil pour qu'elle remplisse l'écran
  if (headerFS = document.querySelector('.cm-page-header.cm-fullscreen')) {
    var homeHeroOffsetY = document.querySelector('.bulma-navbar').clientHeight + (document.getElementById('user-bar') ? document.getElementById('user-bar').clientHeight : 0) - 1;
    headerFS.style.height = 'calc(100vh - ' + homeHeroOffsetY.toString() + 'px)';
  }

  // ajoute le gestionnaire du spinner
  if (overlay = document.querySelector('overlay.spinner')) {
    addSpinnerManager(overlay);
  }

  //ajoute le gestionnaire du header sticky
  if (stickyHeader = document.querySelector('header')) {
    addStickyHeaderManager(stickyHeader);
  }

  // ajoute le gestionnaire du bouton de recherche
  if (iconSearch = document.getElementById('cm-search-icon')) {
    addSearchManager(iconSearch);
  }

  // ajoute le gestionnaire du bouton réinitialisation de la recherche
  if (iconReset = document.getElementById('cm-reset-icon')) {
    // réagit seulement si l'évènement vient d'un clic sur l'icône et non d'une propagation de la touche entrée sur la zone de texte
    iconReset.addEventListener('click', function(event) {
      if (event.explicitOriginalTarget.id === 'cm-reset-icon') {
        document.querySelector('#search-form #cm-fulltext').value = '';
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  // ajoute le gestionnaire du bouton "back to top"
  if (btnBackToTop = document.querySelector('a.back-to-top')) {
    addBackToTopManager(btnBackToTop);
  }

  // ajoute le gestionnaire du menu burger
  if (burger = document.querySelector('.bulma-navbar-burger')) {
    addBurgerManager('.bulma-navbar-burger');
  }

  // ajoute le gestionnaire de galerie flickity
  if (document.querySelector('.cm-flk-block')) {
    document.querySelectorAll('.cm-flk-block').forEach((item, i) => {
      addFlickityManager(item);
    });
  }

  // ajoute le gestionnaire de galerie isotope
  if (document.querySelector('.cm-iso-block')) {
    document.querySelectorAll('.cm-iso-block').forEach((item, i) => {
      addIsotopeManager(item, 'li.cm-iso-cell', '25', 'left', false);
    });
  }

  // ajoute le gestionnaire de la visionneuse
  if (lgContainer = document.getElementById('itemfiles')) {
    addMediaManagerLG(lgContainer);
  }
  // si un viewer OSD est déjà instancié, on peut obtenir une référence de cette manière
  /*
  if (osdContainer = document.querySelector('.openseadragon')) {
    var originalIsOpen = OpenSeadragon.Viewer.prototype.isOpen;
    OpenSeadragon.Viewer.prototype.isOpen = function() {
      // Now we know the viewer!
      osdViewer = this;
      //osdViewer.addHandler('tile-loaded', osdFitViewer);
      //osdViewer.addHandler('resize', osdFitViewer);
      // Reinstate the original, since we only need to run our version once
      OpenSeadragon.Viewer.prototype.isOpen = originalIsOpen;
      // Call the original
      return originalIsOpen.call(this);
    }
  }
  */

  setTimeout(function() {
    // force la galerie isotope à se réarranger (bug d'affichage)
    if (isoGal.length) {
      isoGal.forEach((item, i) => {
        item.arrange();
      });
    }
  }, 200);

}, false);
