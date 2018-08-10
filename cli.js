const program = require("commander");
const chalk = require("chalk");

const xinput = require("./src/xinput");
const catDevices = require("./src/cat-devices");

program
  .option("--disable-output", "Disable barcode scanner output into system (xinput).")
  .option("--enable-output", "Disable barcode scanner output into system (xinput).")
  .option("--get-handler-event", "Print handler event name of scanner (used for evtest).")
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

if (program.getHandlerEvent) {
  catDevices.getScanner((err, scanner) => {
    if (err) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    var eventName = catDevices.getDeviceDevInputEvent(scanner);

    console.log(chalk.green(`Scanner event handler name: "${eventName}"`));
  });
}
