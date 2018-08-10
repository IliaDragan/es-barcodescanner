const program = require("commander");
const chalk = require("chalk");
const { table } = require("table");

const xinput = require("./src/xinput");
const catDevices = require("./src/cat-devices");

program
  .option("--scanner-status", 'Show barcode scanner output id and status from "xinput" and event handler name.')
  .option("--disable-output", "Disable barcode scanner output into system (xinput).")
  .option("--enable-output", "Disable barcode scanner output into system (xinput).")
  .option("--silent", "No printing")
  .option("-v, --verbose", "Print additional info")
  .parse(process.argv);

if (program.silent) {
  Object.keys(console).forEach(function(logType) {
    console[logType] = () => {};
  });
}

if (program.verbose) {
  process.env.VERBOSE = true;
}

if (program.scannerStatus) {
  xinput.getScannerIdAndStatus((err, id, status) => {
    if (err) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    catDevices.getScanner((err, scanner) => {
      if (err) {
        console.error(chalk.red(err.message));
        process.exit(1);
      }

      var eventName = catDevices.getDeviceDevInputEvent(scanner);

      console.log(table([["Id (xinput)", "Output (xinput)", "Input event (/proc/bus/input/devices)"], [id, status, eventName]]));
    });
  });
}

if (program.disableOutput) {
  xinput.disableOutput((err) => {
    if (err) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    console.log(chalk.green("Scanner output disabled"));
  });
}

if (program.enableOutput) {
  xinput.enableOutput((err) => {
    if (err) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    console.log(chalk.green("Scanner output enabled"));
  });
}
