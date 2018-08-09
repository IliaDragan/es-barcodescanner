const program = require("commander");
const chalk = require("chalk");

const xinput = require("./src/xinput");

program
  .option("--disable-output", "Disable barcode scanner output into system.")
  .option("--enable-output", "Disable barcode scanner output into system.")
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
