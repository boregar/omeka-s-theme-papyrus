<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

class GetItems extends AbstractHelper {
  public function __invoke($itemSetId) {
    $view = $this->getView();
    return $view->api()->search('items', ['item_set_id' => $itemSetId, 'sort_by' => 'dcterms:title', 'sort_order' => 'asc', 'limit' => 10])->getContent();
  }
}
