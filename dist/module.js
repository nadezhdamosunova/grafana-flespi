'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var FlespiDatasource, FlespiDatasourceQueryCtrl, FlespiConfigCtrl, FlespiQueryOptionsCtrl, FlespiAnnotationsQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      FlespiDatasource = _datasource.FlespiDatasource;
    }, function (_query_ctrl) {
      FlespiDatasourceQueryCtrl = _query_ctrl.FlespiDatasourceQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', FlespiConfigCtrl = function FlespiConfigCtrl() {
        _classCallCheck(this, FlespiConfigCtrl);
      });

      FlespiConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', FlespiQueryOptionsCtrl = function FlespiQueryOptionsCtrl() {
        _classCallCheck(this, FlespiQueryOptionsCtrl);
      });

      FlespiQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('AnnotationsQueryCtrl', FlespiAnnotationsQueryCtrl = function FlespiAnnotationsQueryCtrl() {
        _classCallCheck(this, FlespiAnnotationsQueryCtrl);
      });

      FlespiAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

      _export('Datasource', FlespiDatasource);

      _export('QueryCtrl', FlespiDatasourceQueryCtrl);

      _export('ConfigCtrl', FlespiConfigCtrl);

      _export('QueryOptionsCtrl', FlespiQueryOptionsCtrl);

      _export('AnnotationsQueryCtrl', FlespiAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
