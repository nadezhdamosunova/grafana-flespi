'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!'], function (_export, _context) {
  "use strict";

  var QueryCtrl, _createClass, FlespiDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('FlespiDatasourceQueryCtrl', FlespiDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(FlespiDatasourceQueryCtrl, _QueryCtrl);

        function FlespiDatasourceQueryCtrl($scope, $injector) {
          _classCallCheck(this, FlespiDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, (FlespiDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(FlespiDatasourceQueryCtrl)).call(this, $scope, $injector));

          _this.scope = $scope;
          _this.target.target = _this.target.target || 'select container';
          _this.target.parameter = _this.target.parameter || 'select parameter';
          return _this;
        }

        _createClass(FlespiDatasourceQueryCtrl, [{
          key: 'getOptions',
          value: function getOptions(query) {
            return this.datasource.metricFindQuery(query || '');
          }
        }, {
          key: 'getContainers',
          value: function getContainers(query) {
            return this.datasource.metricFindQuery(query || 'containers');
          }
        }, {
          key: 'getParameters',
          value: function getParameters(query) {
            return this.datasource.metricFindQuery(query || 'parameters');
          }
        }, {
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.panelCtrl.refresh();
          }
        }]);

        return FlespiDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('FlespiDatasourceQueryCtrl', FlespiDatasourceQueryCtrl);

      FlespiDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
