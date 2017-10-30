import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class FlespiDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);

    this.scope = $scope;
    this.target.target = this.target.target || 'select container';
    this.target.parameter = this.target.parameter || 'select parameter';
  }

  getOptions(query) {
    return this.datasource.metricFindQuery(query || '');
  }

  getContainers(query) {
    return this.datasource.metricFindQuery(query || 'containers');
  }

  getParameters(query) {
    return this.datasource.metricFindQuery(query || 'parameters');
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh();
  }
}

FlespiDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

