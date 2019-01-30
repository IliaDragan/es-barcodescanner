const { getScannerIdAndStatus, disableOutput, enableOutput } = require("./src/xinput");
const { getScanner, getDeviceDevInputEvent } = require("./src/cat-devices");
const { spawnEvtest } = require("./src/evtest");

module.exports = {
  getScannerIdAndStatus,
  disableOutput,
  enableOutput,
  getScanner,
  getDeviceDevInputEvent,
  spawnEvtest
};
