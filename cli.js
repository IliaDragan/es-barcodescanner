const program = require("commander");
const chalk = require("chalk");
const { table } = require("table");

const { getScannerIdAndStatus, disableOutput, enableOutput } = require("./src/xinput");
const { getScanner, getDeviceDevInputEvent } = require("./src/cat-devices");
const { spawnEvtest } = require("./src/evtest");

program
  .option("--run-test-scanner", "Run scanner application wihtout socket server and disable output as keyboard.")
  .option("--scanner-status", 'Show barcode scanner output id and status from "xinput" and event handler name.')
  .option("--disable-output", "Disable barcode scanner output into system (xinput).")
  .option("--enable-output", "Disable barcode scanner output into system (xinput).")
  .option("--silent", "No printing")
  .option("-v, --verbose", "Print additional info")
  .parse(process.argv);

if (program.silent) {
  Object.keys(console).forEach((logType) => {
    console[logType] = () => {};
  });
}
var logger;
if (program.verbose) {
  logger = console;
}

var actions = {
  scannerStatus: function(callback) {
    getScannerIdAndStatus((err, id, status) => {
      if (err) {
        console.error(chalk.red(err.message));
        process.exit(1);
      }

      getScanner((err, scanner) => {
        if (err) {
          console.error(chalk.red(err.message));
          process.exit(1);
        }

        var eventName = getDeviceDevInputEvent(scanner, logger);

        console.log(table([["Id (xinput)", "Output (xinput)", "Input event (/proc/bus/input/devices)"], [id, status, eventName]]));
        callback && callback(id, status, eventName);
      }, logger);
    }, logger);
  },
  disableOutput: function(callback) {
    disableOutput((err) => {
      if (err) {
        console.error(chalk.red(err.message));
        process.exit(1);
      }

      console.log(chalk.green("Scanner output disabled"));
      callback && callback();
    }, logger);
  },
  enableOutput: function(callback) {
    enableOutput((err) => {
      if (err) {
        console.error(chalk.red(err.message));
        process.exit(1);
      }

      console.log(chalk.green("Scanner output enabled"));
      callback && callback();
    }, logger);
  }
};
if (program.scannerStatus) {
  actions.scannerStatus();
}

if (program.disableOutput) {
  actions.disableOutput();
}

if (program.enableOutput) {
  actions.enableOutput();
}

if (program.runTestScanner) {
  actions.disableOutput(() => {
    actions.scannerStatus((id, status, eventName) => {
      try {
        var _process = spawnEvtest(eventName, logger);
      } catch (err) {
        console.error(chalk.red(err.message));
        return process.exit(1);
      }

      _process.emitter.on("scan", (scannedValue) => {
        console.log("Barcode value:", chalk.green(scannedValue));
      });

      var ready = function() {
        console.log(chalk.green("Scanner is ready."));
      };

      if (_process.isReady) {
        ready();
      } else {
        _process.emitter.once("ready", ready);
      }
    });
  });
}
