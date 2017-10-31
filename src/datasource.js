import _ from "lodash";

export class FlespiDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    if (instanceSettings.jsonData != undefined) {
        this.url = instanceSettings.jsonData.uri;
        this.headers = {'Authorization': 'FlespiToken ' + instanceSettings.jsonData.token};
    } else {
        this.url = "";
        this.headers = {};
    }
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  query(options) {
    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets == null || query.targets.length <= 0) {
      return this.q.when({data: []});
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
    var request_params = {max_count: query.maxDataPoints, fields: fields, left_key: from, right_key : to}

    return this.doRequest({
      url: this.url + '/containers/' + container_id + '/messages?data=' + JSON.stringify(request_params),
      method: 'GET'
    }).then(response => {
        var data = [];
        if (!response.data.result || response.data.result.length == 0) {
          return {data: data};
        }
        // create object to store response data
        var dict = {}
        for (var i = 0; i < params.length; i++) {
          var target = { target: params[i], datapoints: []};
          dict[params[i]] = target;
        }
        // parse response
        for (var i = 0; i < response.data.result.length; i++) {
          // for each item in `result` array
          var item_params = response.data.result[i].params;
          for (var param in item_params) {
            // for each param in `params` object, except `time`
            if (param == "time")
              continue;
            var target = dict[param]
            target.datapoints.push([item_params[param], parseInt(item_params.time * 1000)]);
          }
        }
        // format object to send query result
        for (var param in dict) {
          data.push(dict[param]);
        }

        return {data: data};
      });
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/containers/all',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
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
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    if (query == "containers") {
      return this.doRequest({
        url: this.url + '/containers/all',
        method: 'GET',
      }).then(response => {
        const res = [];
        const data = response.data.result;
        for (var i = 0; i < data.length; i++) {
          var label;
          if (data[i].name == undefined || data[i].name == null) {
            label = data[i].id;
          } else {
            label = data[i].name + ' (' + data[i].id + ')';
          }
          res.push({value: data[i].id, text: label});
        }
        return res;
      });
    }
    if (query == "parameters") {
      return this.doRequest({
        url: this.url + '/containers/all?fields=parameters',
        method: 'GET',
      }).then(response => {
        const res = [];
        const data = response.data.result;

        for (let i = 0; i < data.length; i++) {
          var parameters = data[i].parameters;
            for (let j = 0; j < parameters.length; j++) {
              res.push({value: parameters[j], text: parameters[j]});
            }
        }
        return res;
      });
      return { status: "success", message: "Only `containers` and `parameters` queries are supported", title: "Choose query" };
    }
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    options.targets = _.filter(options.targets, target => {
      return target.parameter !== 'select parameter';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        parameter: this.templateSrv.replace(target.parameter, options.scopedVars, 'regex')
      };
    });

    options.targets = targets;

    return options;
  }
}
