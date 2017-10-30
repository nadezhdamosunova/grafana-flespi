import {FlespiDatasource} from './datasource';
import {FlespiDatasourceQueryCtrl} from './query_ctrl';

class FlespiConfigCtrl {}
FlespiConfigCtrl.templateUrl = 'partials/config.html';

class FlespiQueryOptionsCtrl {}
FlespiQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

class FlespiAnnotationsQueryCtrl {}
FlespiAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html'

export {
  FlespiDatasource as Datasource,
  FlespiDatasourceQueryCtrl as QueryCtrl,
  FlespiConfigCtrl as ConfigCtrl,
  FlespiQueryOptionsCtrl as QueryOptionsCtrl,
  FlespiAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
