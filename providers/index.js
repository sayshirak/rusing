const env = require("../config/env");
const staticJsonProvider = require("./static-json-provider");
const apiProvider = require("./api-provider");

const provider = env.dataSourceMode === "api" ? apiProvider : staticJsonProvider;

module.exports = provider;
