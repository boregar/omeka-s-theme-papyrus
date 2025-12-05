<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

class ResourceClassIcon extends AbstractHelper {
  public function __invoke($resource) {
    $view = $this->getView();
    $resourceClasses = [
      'Resource' => 'fas fa-cube',
      'Image' => 'fas fa-image',
      'Document' => 'fas fa-file',
      'Event' => 'fas fa-calendar-alt'
    ];
    $resourceClass = ($resource->resourceClass()?->label()) ?: 'Resource';
    $sIcon = '<i class="' . (array_key_exists($resourceClass, $resourceClasses) ? $resourceClasses[$resourceClass] : $resourceClasses['Resource']) . '"></i>';
    $sLabel = $view->escapeHtml($view->translate($resourceClass));
    return "$sIcon $sLabel";
  }
}
