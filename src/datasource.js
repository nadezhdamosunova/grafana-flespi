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

// -----------------------------------
// query metrics values and convert into timeseries
// -----------------------------------
query(options) {
    console.log("before: " + JSON.stringify(options))
    var query = this.buildQueryParameters(options);
    console.log("in the middle: " + JSON.stringify(query))
    query.targets = query.targets.filter(t => !t.hide);
    console.log("after: " + JSON.stringify(query))

    if (query.targets == null || query.targets.length <= 0 || !query.targets[0].target || !query.targets[0].parameter) {
        // unknown target - return empty result - no data points
        return this.q.when({data: []});
    }
    // prepare params for request
    var svc_name = query.targets[0].target;
    var parameters = query.targets[0].parameter.replace(/[{})]/g, '');
    var from = parseInt(Date.parse(query.range.from) / 1000);
    var to = parseInt(Date.parse(query.range.to) / 1000);
    var interval_sec = query.scopedVars.__interval_ms.value / 1000;

    var request_params = {max_count: query.maxDataPoints, fields: parameters, left_key: from, right_key : to}
    if (interval_sec >= 60) {
        request_params.generalize = interval_sec;
    }

    return this.doRequest({
        url: this.url + '/containers/name=' + svc_name + '|*/messages?data=' + JSON.stringify(request_params),
        method: 'GET'
    }).then(response => {
        // parse response: convert container messages to timeseries
        var data = [];
        if (!response.data.result || response.data.result.length == 0) {
            // empty response - no data points
            return {data: data};
        }

        var dict = {}
        for (var i = 0; i < response.data.result.length; i++) {
            // for each item in `result` array, i.e. each container message
            var params = response.data.result[i].params;
            for (var param in params) {
                if (!dict[param]) {
                    dict[param] = {
                        datapoints: []
                    }
                }
                dict[param].datapoints.push([params[param], parseInt(response.data.result[i].key * 1000)]);
            }
        }
        // format parameters dictionary to timeseries
        for (var param in dict) {
            data.push({
                target: param,
                datapoints: dict[param].datapoints
            });
        }
        return {data: data};
    });
}
// -----------------------------------
// check connection to datasource
// -----------------------------------
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
// -----------------------------------
// query annotations from the datasource
// -----------------------------------
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

// -----------------------------------
// query possible metrics for the datasource
// -----------------------------------
metricFindQuery(query) {
    query = this.templateSrv.replace(query, null, 'glob')
    console.log(query)
// --- fetch all services
    if (query == "services.*") {
        return this.doRequest({
            url: this.url + '/containers/all',
            method: 'GET',
        }).then(response => {
            const res = [];
            const data = response.data.result;
            for (var i = 0; i < data.length; i++) {
                var label;
                if (data[i].name == undefined || data[i].name == null) {
                    continue
                } else {
                    var svc_name = data[i].name.split('|')
                    label = svc_name[0];
                }
                res.push({value: label, text: label})
            }
            return res;
        });
    }
// --- fetch parameters for services
    if (query.indexOf(".params.*") !== -1) {
        var svc_name = query.split('.')[0]
        console.log("++++++++++++ " + svc_name)
        return this.doRequest({
            url: this.url + '/containers/name=' + svc_name + '*?fields=parameters',
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
    }
// --- unknown metric query
    return this.doRequest({
           url: this.url + '/containers/all',
           method: 'GET',
    }).then(metrics => {
        return { status: "success", message: "Only `services` and `params` queries are supported", title: "Choose query" };
    });
  }

// -----------------------------------
// helper functions
// -----------------------------------
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
            parameter: this.templateSrv.replace(target.parameter, options.scopedVars, 'glob')
        };
    });
    options.targets = targets;
    return options;
}

}
