## flespi Datasource - a generic backend datasource

Plugin allows to use a [flespi container](https://flespi.io/docs/#/storage/!/containers) as grafana datasource.


## Installation

To install this plugin using the `grafana-cli` tool:
```
sudo grafana-cli plugins install flespi-datasource
sudo service grafana-server restart
```

### Dev setup

This plugin requires node 6.10.0

`npm install -g yarn`
`yarn install`
`npm run build`

To update dist automatically during development run:

`grunt watch`

### Changelog

1.0.0
  Initial implementation
