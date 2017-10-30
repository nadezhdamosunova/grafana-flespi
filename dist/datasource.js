'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, FlespiDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
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

      _export('FlespiDatasource', FlespiDatasource = function () {
        function FlespiDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, FlespiDatasource);

          this.type = instanceSettings.type;
          if (instanceSettings.jsonData != undefined) {
            this.url = instanceSettings.jsonData.uri;
            this.headers = { 'Authorization': 'FlespiToken ' + instanceSettings.jsonData.token };
          } else {
            this.url = "";
            this.headers = {};
          }
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(FlespiDatasource, [{
          key: 'query',
          value: function query(options) {
            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets == null || query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }
            // prepare params for request
            var container_id = query.targets[0].target;
            var parameters = query.targets[0].parameter.replace(/[\(\)]/g, '');
            var params = parameters.split('|');
            var from = parseInt(Date.parse(query.range.from) / 1000);
            var to = parseInt(Date.parse(query.range.to) / 1000);
            var fields = "time";
            for (var i = 0; i < params.length; i++) {
              fields = fields + "," + params[i];
            }
            var request_params = { max_count: query.maxDataPoints, fields: fields, left_key: from, right_key: to };

            return this.doRequest({
              url: this.url + '/containers/' + container_id + '/messages?data=' + JSON.stringify(request_params),
              method: 'GET'
            }).then(function (response) {
              var data = [];
              if (!response.data.result || response.data.result.length == 0) {
                return { data: data };
              }
              // create object to store response data
              var dict = {};
              for (var i = 0; i < params.length; i++) {
                var target = { target: params[i], datapoints: [] };
                dict[params[i]] = target;
              }
              // parse response
              for (var i = 0; i < response.data.result.length; i++) {
                // for each item in `result` array
                var item_params = response.data.result[i].params;
                for (var param in item_params) {
                  // for each param in `params` object, except `time`
                  if (param == "time") continue;
                  var target = dict[param];
                  target.datapoints.push([item_params[param], parseInt(item_params.time * 1000)]);
                }
              }
              // format object to send query result
              for (var param in dict) {
                data.push(dict[param]);
              }

              return { data: data };
            });
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.doRequest({
              url: this.url + '/containers/all',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
            var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
            var annotationQuery = {
              range: options.range,
              annotation: {
                name: options.annotation.name,
                datasource: options.annotation.datasource,
                enable: options.annotation.enable,
                iconColor: options.annotation.iconColor,
                query: query
              },
              rangeRaw: options.rangeRaw
            };

            return this.doRequest({
              url: this.url + '/annotations',
              method: 'POST',
              data: annotationQuery
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            if (query == "containers") {
              return this.doRequest({
                url: this.url + '/containers/all',
                method: 'GET'
              }).then(function (response) {
                var res = [];
                var data = response.data.result;

                for (var i = 0; i < data.length; i++) {
                  res.push({ value: data[i].id, text: data[i].id });
                }
                return res;
              });
            }
            if (query == "parameters") {
              return this.doRequest({
                url: this.url + '/containers/all?fields=parameters',
                method: 'GET'
              }).then(function (response) {
                var res = [];
                var data = response.data.result;

                for (var i = 0; i < data.length; i++) {
                  var parameters = data[i].parameters;
                  for (var j = 0; j < parameters.length; j++) {
                    res.push({ value: parameters[j], text: parameters[j] });
                  }
                }
                return res;
              });
              return { status: "success", message: "Only `containers` and `parameters` queries are supported", title: "Choose query" };
            }
          }
        }, {
          key: 'doRequest',
          value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;

            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            options.targets = _.filter(options.targets, function (target) {
              return target.parameter !== 'select parameter';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                refId: target.refId,
                hide: target.hide,
                parameter: _this.templateSrv.replace(target.parameter, options.scopedVars, 'regex')
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return FlespiDatasource;
      }());

      _export('FlespiDatasource', FlespiDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
