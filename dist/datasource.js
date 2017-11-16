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

        // -----------------------------------
        // query metrics values and convert into timeseries
        // -----------------------------------


        _createClass(FlespiDatasource, [{
          key: 'query',
          value: function query(options) {
            console.log("before: " + JSON.stringify(options));
            var query = this.buildQueryParameters(options);
            console.log("in the middle: " + JSON.stringify(query));
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });
            console.log("after: " + JSON.stringify(query));

            if (query.targets == null || query.targets.length <= 0 || !query.targets[0].target || !query.targets[0].parameter) {
              return this.q.when({ data: [] });
            }
            // prepare params for request
            var svc_name = query.targets[0].target;
            var parameters = query.targets[0].parameter.replace(/[{})]/g, '');
            var from = parseInt(Date.parse(query.range.from) / 1000);
            var to = parseInt(Date.parse(query.range.to) / 1000);
            var interval_sec = query.scopedVars.__interval_ms.value / 1000;

            var request_params = { max_count: query.maxDataPoints, fields: parameters, left_key: from, right_key: to };
            if (interval_sec >= 60) {
              request_params.generalize = interval_sec;
            }

            return this.doRequest({
              url: this.url + '/containers/name=' + svc_name + '|*/messages?data=' + JSON.stringify(request_params),
              method: 'GET'
            }).then(function (response) {
              var data = [];
              if (!response.data.result || response.data.result.length == 0) {
                return { data: data };
              }
              // create object to store response data
              var dict = {};
              var params = parameters.split(',');
              for (var i = 0; i < params.length; i++) {
                var target = { target: params[i], datapoints: [] };
                dict[params[i]] = target;
              }
              // parse response
              for (var i = 0; i < response.data.result.length; i++) {
                // for each item in `result` array
                var item_params = response.data.result[i].params;
                for (var param in item_params) {
                  var target = dict[param];
                  target.datapoints.push([item_params[param], parseInt(response.data.result[i].key * 1000)]);
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
            query = this.templateSrv.replace(query, null, 'glob');
            console.log(query);
            // -----------------------------------
            // fetch all services
            // -----------------------------------
            if (query == "services.*") {
              return this.doRequest({
                url: this.url + '/containers/all',
                method: 'GET'
              }).then(function (response) {
                var res = [];
                var data = response.data.result;
                for (var i = 0; i < data.length; i++) {
                  var label;
                  if (data[i].name == undefined || data[i].name == null) {
                    continue;
                  } else {
                    var svc_name = data[i].name.split('|');
                    label = svc_name[0];
                  }
                  res.push({ value: label, text: label });
                }
                return res;
              });
            }
            // -----------------------------------
            // fetch parameters for services
            // -----------------------------------
            if (query.indexOf(".params.*") !== -1) {
              var svc_name = query.split('.')[0];
              console.log("++++++++++++ " + svc_name);
              return this.doRequest({
                url: this.url + '/containers/name=' + svc_name + '*?fields=parameters',
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
            }
            // -----------------------------------
            // for unknown metric query
            // -----------------------------------
            return this.doRequest({
              url: this.url + '/containers/all',
              method: 'GET'
            }).then(function (metrics) {
              return { status: "success", message: "Only `services` and `params` queries are supported", title: "Choose query" };
            });
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
                parameter: _this.templateSrv.replace(target.parameter, options.scopedVars, 'glob')
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
