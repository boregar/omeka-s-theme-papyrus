//---------------------------------------- variables globales

const omekaVars = {};       // contient les variables créées par les templates .phtml dans la zone backend > frontend
const distUrl = 'https://dist.boregar.org';  // URL de l'hôte hébergeant les librairies et les polices

var osdViewer = null;       // visionneuse OSD
var lgViewer = null;        // visionneuse LightGallery
var scrollDiff = null;      // voir le header sticky
var isoGal = [];            // galeries Isotope
var flkGalHome = null;      // galerie Flickity de la page d'accueil

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

function setSpinnerOn() {
  document.querySelector('overlay.spinner').classList.add('is-active');
}

function setSpinnerOff() {
  document.querySelector('overlay.spinner').classList.remove('is-active');
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
    //wrapAround: (flkBlock.getAttribute('data-wraparound') === 'true'),
    freeScroll: (flkBlock.getAttribute('data-freescroll') === 'true'),
    autoPlay: ((sPlay = flkBlock.getAttribute('data-autoplay')) ? (isNaN(iPlay = parseInt(sPlay)) ? true : iPlay) : false),
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
      /*var element = event.target.closest(selector);
      if (element.classList.contains('is-active')) {
        element.classList.remove('is-active');
      } else {
        isotope.querySelector('div.views-row.is-active')?.classList.remove('is-active');
        element.classList.add('is-active');
      }
      isoGal.forEach((item, i) => {
        item.arrange();
      });*/
      if (!isotope.classList.contains('cm-view-grid')) {
        return false;
      }
      var element = event.target.closest(selector);
      element.classList.toggle('cm-iso-wide');
      isoGal[0].arrange();
    });
  }
}

//---------------------------------------- gestionnaire de la visionneuse OpenSeadragon

function addViewerManager(viewerLink) {
  viewerLink.addEventListener('click', function(event) {
    event.preventDefault();
    //event.stopPropagation();
    // la source de la visionneuse a été définie dans le template common/resource-page-block-layout/media-list
    if ((tileSources = omekaVars.tileSources) && tileSources.length) {
      setSpinnerOn();
      osdView(tileSources);
    }
    return false;
  });
}

// visualisation d'une source d'images
function osdView(tileSources) {

  // si le viewer a déjà été créé, on charge simplement les images
  if (osdViewer) {
    osdViewer.close().open(tileSources);
    // ajoute un gestionnaire pour préparer la 1ère page --> supprimé juste après le chargement de la 1ère page
    //osdViewer.addHandler('open', osdPreparePage);
  }
  // sinon on crée le viewer
  else {
    // la valeur par défaut de crossOriginPolicy (false) empêche l'affichage des images (canvas) dans Firefox
    // on peut utiliser l'option "crossOriginPolicy: 'Anonymous'" mais elle n'est pas utilisée par le viewer de la referenceStrip
    // --> on modifie directement la valeur définie par défaut
    OpenSeadragon.DEFAULT_SETTINGS.crossOriginPolicy = 'Anonymous';
    // initialise le viewer
    osdViewer = OpenSeadragon({
      id: 'osdViewer',
      //preload: true,
      prefixUrl: distUrl + '/libraries/openseadragon/images/',
      immediateRender: false,
      //toolbar: 'osdControls',
      autoHideControls: false,
      showNavigationControl: true,
      navigationControlAnchor: OpenSeadragon.ControlAnchor.TOP_RIGHT,
      showZoomControl: true,
      showHomeControl: true,
      showFullPageControl: false,
      showRotationControl: true,
      showFlipControl: true,
      showSequenceControl: true,
      sequenceControlAnchor: OpenSeadragon.ControlAnchor.TOP_RIGHT,
      //zoomInButton: 'osdZoomIn',
      //zoomOutButton: 'osdZoomOut',
      //homeButton: 'osdZoomReset',
      //nextButton: 'osdNext',
      //previousButton: 'osdPrevious',
      //rotateRightButton: 'osdRotate',
      //preserveViewport: false,
      defaultZoomLevel: 0,
      maxZoomLevel: 3,
      maxZoomPixelRatio: 12,
      minZoomLevel: 0.2,
      minZoomImageRatio: 0.8,
      sequenceMode: true,
      showReferenceStrip: true,
      //referenceStripScroll: 'vertical',
      /*viewportMargins: {
        top: 20,
        left: 0,
        right: 0,
        bottom: 20
      },*/
      //crossOriginPolicy: 'Anonymous',
      tileSources: tileSources
    });

    var closeButton = new OpenSeadragon.Button({
      tooltip: 'Close',
      srcRest: distUrl + '/libraries/openseadragon/images/close_rest.png',
      srcGroup: distUrl + '/libraries/openseadragon/images/close_grouphover.png',
      srcDown: distUrl + '/libraries/openseadragon/images/close_pressed.png',
      srcHover: distUrl + '/libraries/openseadragon/images/close_hover.png',
      onClick: osdClose
    });
    osdViewer.addControl(closeButton.element, {
      anchor: OpenSeadragon.ControlAnchor.TOP_RIGHT
    });

    /*
    // clic sur le bouton close
    document.querySelector('overlay.cm-item-viewer div[title="Close"]')?.addEventListener('click', function(event) {
      osdClose(event);
		});
    */

    // ajoute un gestionnaire pour préparer la 1ère page --> supprimé juste après le chargement de la 1ère page
    //osdViewer.addHandler('open', osdPreparePage);
    // ajoute le gestionnaire de changement de page (la valeur 'zzz' est passée à osdPreparePage dans event.userData)
    //osdViewer.addHandler('page', osdPreparePage, 'zzz');
    // ajoute le gestionnaire de chargement des tiles
    osdViewer.addHandler('tile-loaded', osdTileLoaded);
    // ajoute le gestionnaire de destruction du viewer
    //osdViewer.addHandler('destroy', osdDestroy);

  }
}

function osdTileLoaded(event) {
  document.querySelector('overlay.cm-item-viewer').classList.add('is-active');
  setSpinnerOff();
}

function osdClose(event) {
	if (!osdViewer) return;
  osdViewer.tileSources = [];
  osdViewer.close();
  document.querySelector('overlay.cm-item-viewer').classList.remove('is-active');
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

//---------------------------------------- positionne le mode de visualisation

function toggleViewMode(ctrlGroup, viewMode) {
  if (!['list', 'cards', 'grid'].includes(viewMode)) {
    viewMode = 'cards';
  }
  ctrlGroup.querySelector('button[data-setting="view-mode"].is-active')?.classList.remove('is-active');
  btnActive = ctrlGroup.querySelector('button[data-setting="view-mode"][data-value="' + viewMode + '"]');
  btnActive.classList.add('is-active');
  if (isoBlock = document.querySelector('.cm-iso-block')) {
    isoBlock.classList.forEach((item, i) => {
      if (item.match(/cm-view-.+/)) {
        isoBlock.classList.remove(item);
      }
    });
    isoBlock.querySelectorAll('.cm-iso-wide').forEach((item, i) => {
      item.classList.remove('cm-iso-wide');
    });
    isoBlock.classList.add('cm-view-' + viewMode);
    isoGal[0].arrange();
  }
  setCookie('MRMViewMode', viewMode, 30);
}

//---------------------------------------- positionne le nombre d'éléments par page

function togglePerPage(ctrlGroup, perPage) {
  if (!['12', '24', '48'].includes(perPage)) {
    perPage = omekaVars.perPage;
  }
  ctrlGroup.querySelector('button[data-setting="per-page"].is-active')?.classList.remove('is-active');
  btnActive = ctrlGroup.querySelector('button[data-setting="per-page"][data-value="' + perPage + '"]');
  btnActive.classList.add('is-active');
  query = window.location.search;
  queryNew = null;
  if (query) {
    if (query.match(/per_page=(\d+)/)) {
      if (query.match(/per_page=(\d+)/)[1] !== perPage) {
        queryNew = query.replace(query.match(/per_page=(\d+)/)[0], 'per_page=' + perPage);
      }
    } else if (perPage !== omekaVars.perPage) {
      queryNew = query + '&per_page=' + perPage;
    }
  } else if (perPage !== omekaVars.perPage) {
    queryNew = '?per_page=' + perPage;
  }
  if (queryNew) {
    window.location = window.location.pathname + queryNew;
  }
  return false;
}

//---------------------------------------- positionne le classement

function toggleSortBy(ctrlGroup, sortBy) {
  if (!['star', 'id', 'rico:identifier', 'title', 'numeric:timestamp:674', 'random'].includes(sortBy)) {
    sortBy = 'rico:identifier';
  }
  ctrlGroup.querySelector('button[data-setting="sort-by"].is-active')?.classList.remove('is-active');
  btnActive = ctrlGroup.querySelector('button[data-setting="sort-by"][data-value="' + sortBy + '"]');
  btnActive.classList.add('is-active');
  query = window.location.search;
  queryNew = null;
  if (query) {
    if (query.match(/sort_by=([a-z1-9:]+)/)) {
      if (query.match(/sort_by=([a-z1-9:]+)/)[1] !== sortBy) {
        queryNew = query.replace(query.match(/sort_by=([a-z1-9:]+)/)[0], 'sort_by=' + sortBy);
      }
    } else if (sortBy !== omekaVars.sortBy) {
      queryNew = query + '&sort_by=' + sortBy;
    }
  } else if (sortBy !== omekaVars.sortBy) {
    queryNew = '?sort_by=' + sortBy;
  }
  if (queryNew) {
    window.location = window.location.pathname + queryNew;
  }
  return false;
}

//---------------------------------------- positionne le classement

function toggleSortOrder(ctrlGroup, sortOrder) {
  if (!['asc', 'desc'].includes(sortOrder)) {
    sortBy = 'asc';
  }
  ctrlGroup.querySelector('button[data-setting="sort-order"].is-active')?.classList.remove('is-active');
  btnActive = ctrlGroup.querySelector('button[data-setting="sort-order"][data-value="' + sortOrder + '"]');
  btnActive.classList.add('is-active');
  query = window.location.search;
  queryNew = null;
  if (query) {
    if (query.match(/sort_order=((asc|desc))/)) {
      if (query.match(/sort_order=((asc|desc))/)[1] !== sortOrder) {
        queryNew = query.replace(query.match(/sort_order=((asc|desc))/)[0], 'sort_order=' + sortOrder);
      }
    } else if (sortOrder !== omekaVars.sortOrder) {
      queryNew = query + '&sort_order=' + sortOrder;
    }
  } else if (sortOrder !== omekaVars.sortOrder) {
    queryNew = '?sort_order=' + sortOrder;
  }
  if (queryNew) {
    window.location = window.location.pathname + queryNew;
  }
  return false;
}
//---------------------------------------- gestionnaire du layout

function addCtrlManager(ctrlGroup) {
  // ajoute le gestionnaire de clic
  ctrlGroup.addEventListener('click', function(event) {
    var btn = event.target.closest('button');
    // ne traite pas le clic si le bouton est déjà actif
    if (btn.classList.contains('is-active')) {
      return false;
    }
    // identifie les paramètres du bouton
    var dataSetting = btn.getAttribute('data-setting');
    var dataValue = btn.getAttribute('data-value');
    switch(dataSetting) {
      // mode de visualisation
      case 'view-mode':
        toggleViewMode(ctrlGroup, dataValue);
        break;
      // nombre d'éléments par page
      case 'per-page':
        togglePerPage(ctrlGroup, dataValue);
        break;
      // classement
      case 'sort-by':
        toggleSortBy(ctrlGroup, dataValue);
        break;
      // ordre de tri
      case 'sort-order':
        toggleSortOrder(ctrlGroup, dataValue);
        break;
      // default
      default:
    }
  });
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
      addIsotopeManager(item, 'li.cm-iso-cell', '25', 'left', true);
    });
  }

  // ajoute le gestionnaire de la visionneuse
  if (lgContainer = document.getElementById('itemfiles')) {
    addMediaManagerLG(lgContainer);
  }
  /*
  // si un viewer OSD est déjà instancié, on peut obtenir une référence de cette manière
  if (osdContainer = document.querySelector('.openseadragon')) {
    var originalIsOpen = OpenSeadragon.Viewer.prototype.isOpen;
    OpenSeadragon.Viewer.prototype.isOpen = function() {
      // Now we know the viewer!
      osdViewer = this;
      //osdViewer.addHandler('tile-loaded', osdFitViewer);
      //osdViewer.addHandler('resize', osdFitViewer);

      // fixe le niveau de zoom maximum
      osdViewer.viewport.maxZoomLevel = 3;

      // Reinstate the original, since we only need to run our version once
      OpenSeadragon.Viewer.prototype.isOpen = originalIsOpen;
      // Call the original
      return originalIsOpen.call(this);
    }
  }
  */
  if (visionneuse = document.getElementById('osdViewer')) {
    if (document.querySelector('.media-list.cm-flk-block .cm-flk-cell a.resource-link')) {
      addViewerManager(document.querySelector('.media-list.cm-flk-block'));
    }
  }

  // ajoute le gestionnaire du layout
  if (ctrlLayout = document.querySelector('.cm-search-layout')) {
    // positionne le mode de visualisation d'après le cookie
    toggleViewMode(ctrlLayout, getCookie('MRMViewMode'));
    togglePerPage(ctrlLayout, omekaVars.perPage);
    addCtrlManager(ctrlLayout);
  }

  // ajoute le gestionnaire des filtres
  if (ctrlSort = document.querySelector('.cm-search-sort')) {
    toggleSortBy(ctrlSort, omekaVars.sortBy);
    toggleSortOrder(ctrlSort, omekaVars.sortOrder);
    addCtrlManager(ctrlSort);
  }

  setTimeout(function() {
    // force la galerie isotope à se réarranger (bug d'affichage)
    if (isoGal.length) {
      isoGal.forEach((item, i) => {
        item.arrange();
      });
    }

    // l'éditeur de pages d'Omeka-S ne permet pas d'affecter un id aux blocs --> on ajoute au bloc la classe "cm-anchor-[id]" dans l'éditeur
    // puis, côté client, si l'URL contient une ancre de type "cm-anchor", on récupère l'id et on se positionne sur le bloc correspondant
    if (anchorId = window.location.search.match(/^\?a=([a-z0-9\-]+)$/)) {
      if (elem = document.querySelector('.cm-anchor-' + anchorId[1])) {
        elem.scrollIntoView();
        // compense le problème de l'offset négatif d'Omeka
        setTimeout(function() {
          elem.scrollIntoView();
        }, 200);
      }
    }

    // si la page correspond au résultat d'une recherche, se positionne sur les résultats
    if (window.location.search && (searchHeader = document.querySelector('.cm-search-header'))) {
      searchHeader.scrollIntoView();
      // compense le problème de l'offset négatif d'Omeka
      setTimeout(function() {
        searchHeader.scrollIntoView();
      }, 200);
    }

  }, 200);

}, false);
