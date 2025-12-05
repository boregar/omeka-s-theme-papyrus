<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

class LinkPretty extends AbstractHelper {
  public function __invoke($resource, $media = null, $imgSize = 'square', $linkTo = 'resource', $showAsCard = false) {
    $view = $this->getView();
    // détermine la nature de la ressource (items, item_sets)
    $resourceType = $resource->resourceName();
    $mediaType = null;
    // si aucun media n'est spécifié, cherche le média primaire
    if ($media) {
      $mediaType = $media->extension();
    } else {
      // si la ressource possède une image de type asset, on détermine sa nature (ex. image/jpeg)
      if ($resource->thumbnail()) {
        $mediaType = $resource->thumbnail()->mediaType();
      } else {
        $media = $resource->primaryMedia();
        $mediaType = $media?->extension();
      }
    }
    if ($mediaType) {
      // identifie la cible du lien (resource ou media)
      $target = null;
      switch($linkTo) {
        case 'resource':
          $target = $resource;
          break;
        case 'media':
          $target = ($media ?: $resource);
          break;
        default:
          $target = null;
      }
      switch($mediaType) {
        case 'docx':
        case 'xlsx':
        case 'pptx':
        case 'pdf':
          if ($showAsCard) {
            if ($resourceType === 'item_sets') {
              $count = $resource->itemCount();
              $content =  $count > 0 ? '<i class="fas fa-images"></i> ' . $count . ' éléments' : '<i class="fas fa-eye-slash"></i> Aucun élément';
            } else {
              $content = $view->ResourceClassIcon($resource);
            }
            $linkContent = sprintf('
              <div class="cm-item-img bulma-card-image"><img src="%s" alt="Document %s"></div>
              <div class="bulma-card-content">
                <div class="cm-item-title bulma-title is-size-6"><h3 class="resource-name">%s</h3></div>
                <div class="bulma-content"><p>%s</p></div>
              </div>',
              $view->assetUrl('img/document-' . $mediaType . '.jpg'),
              $mediaType,
              $resource->displayTitle(),
              $content
            );
            //$linkPretty = $linkContent;
            $linkPretty = ($target ? $target->linkRaw($linkContent, null, ['class' => 'resource-link']) : sprintf('<a class="resource-link">%s</a>', $linkContent));

          } else {
            $linkContent = sprintf('<img src="%s" alt="Document %s"><span class="resource-name">%s</span>', $view->assetUrl('img/document-' . $mediaType . '.jpg'), $mediaType, $resource->displayTitle());
            $linkPretty = ($target ? $target->linkRaw($linkContent, null, ['class' => 'resource-link']) : sprintf('<a class="resource-link">%s</a>', $linkContent));
          }
          break;
        default:
          //$linkPretty = $resource->linkPretty($imgSize);
          // note: on ne peut pas utiliser la méthode $resource->linkPretty() car elle ne tient pas compte du media et utilise uniquement le média primaire
          if ($showAsCard) {
            if ($resourceType === 'item_sets') {
              $count = $resource->itemCount();
              $content =  $count > 0 ? '<i class="fas fa-images"></i> ' . $count . ' éléments' : '<i class="fas fa-eye-slash"></i> Aucun élément';
            } else {
              $content = $view->ResourceClassIcon($resource);
            }
            $linkContent = sprintf('
              <div class="cm-item-img bulma-card-image">%s</div>
              <div class="bulma-card-content">
                <div class="cm-item-title bulma-title is-size-6"><h3 class="resource-name">%s</h3></div>
                <div class="bulma-content"><p>%s</p></div>
              </div>',
              $view->thumbnail($resource, $imgSize),
              $target ? $target->linkRaw($resource->displayTitle(), null, ['class' => 'resource-link']) : $resource->displayTitle(),
              $content
            );
            $linkPretty = $linkContent;
          } else {
            $linkContent = sprintf('%s<span class="resource-name">%s</span>', $view->thumbnail($media, $imgSize), $resource->displayTitle());
            $linkPretty = ($target ? $target->linkRaw($linkContent, null, ['class' => 'resource-link']) : sprintf('<a class="resource-link">%s</a>', $linkContent));
          }
      }
    } else {
      // l'item ne possède pas de média --> on affiche l'image générique
      $mediaType = 'generic';
      if ($showAsCard) {
        if ($resourceType === 'item_sets') {
          $count = $resource->itemCount();
          $content =  $count > 0 ? '<i class="fas fa-images"></i> ' . $count . ' éléments' : '<i class="fas fa-eye-slash"></i> Aucun élément';
        } else {
          $content = $view->ResourceClassIcon($resource);
        }
        $linkContent = sprintf('
          <div class="cm-item-img bulma-card-image"><img src="%s" alt="Document %s"></div>
          <div class="bulma-card-content">
            <div class="cm-item-title bulma-title is-size-6"><h3 class="resource-name">%s</h3></div>
            <div class="bulma-content"><p>%s</p></div>
          </div>',
          $view->assetUrl('img/media-' . $mediaType . '.jpg'),
          $mediaType,
          $linkTo ? $resource->linkRaw($resource->displayTitle(), null, ['class' => 'resource-link']) : $resource->displayTitle(),
          $content
        );
        $linkPretty = $linkContent;
      } else {
        $linkContent = sprintf('<img src="%s" alt="Document %s"><span class="resource-name">%s</span>', $view->assetUrl('img/media-' . $mediaType . '.jpg'), $mediaType, $resource->displayTitle());
        $linkPretty = ($linkTo ? $resource->linkRaw($linkContent, null, ['class' => 'resource-link']) : sprintf('<a class="resource-link">%s</a>', $linkContent));
      }
    }
    return '<!-- ' . $resourceType . ' -->' . $linkPretty;
  }
}
