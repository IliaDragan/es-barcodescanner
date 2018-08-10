const chalk = require("chalk");
/* Include exec from child_process for run xinput utility. */
const { exec } = require("child_process");
/* Name of master output device. */
const virtualCoreKeyboardName = "Virtual core keyboard";
/* Name of scanner device.  */
const scannerName = "USB HJ ScannerApp";

/* Regex for match device id in line of xinput --list output. */
const xinputIdRegex = /id=\d+/;

/*
 * Match and parse device id in raw xinput line.
 *
 * @param {!string} xinputLine - One line from "xinput --list" output.
 * @return {?number} - device id.
 */
function extractDeviceId(xinputLine) {
  var xinputId = xinputIdRegex.exec(xinputLine);
  if (xinputId === null) {
    return null;
  } else {
    xinputId = xinputId[0];
  }

  return parseInt(xinputId.split("=")[1], 10);
}

/* Regex for match device id with status text in line of xinput --list output. */
const xinputStatusRegex = /id=\d+\s+\[([^]+?)\]/i;
/* Regex for status text in result of previous regex. */
const xinputStatusEnabledRegex = /(master|slave)\s+keyboard\s+\(\d+\)/i;

/*
 * Match and parse device status in raw xinput line.
 *
 * @param {!string} xinputLine - One line from "xinput --list" output.
 * @return {string} - device status. One of: "output-disabled", "output-enabled", "unknown: $wrongStatus".
 */
function extractDeviceStatus(xinputLine) {
  var xinputStatus = xinputStatusRegex.exec(xinputLine);

  if (xinputStatus === null || xinputStatus[1] === undefined) {
    return `unknown: ${xinputLine}`;
  } else {
    xinputStatus = xinputStatus[1];
  }

  if (xinputStatus === "floating slave") {
    return "output-disabled";
  } else if (xinputStatusEnabledRegex.test(xinputStatus)) {
    return "output-enabled";
  } else {
    return `unknown: ${xinputLine}`;
  }
}

/*
 * getXinputDeviceIdAndStatus callback function.
 * @callback getXinputDeviceIdAndStatusCallback
 *
 * @param {object} err - Any error.
 * @param {string} id - Device id.
 * @param {string} status - Device status.
 */

/*
 * Get id and status of device by device name.
 *
 * @param {!string} deviceName - Name of device from xinput --list.
 * @param {!getXinputDeviceIdAndStatusCallback} callback
 */
function getXinputDeviceIdAndStatus(deviceName, callback) {
  if (process.env.VERBOSE) {
    console.info(chalk.gray(`Call "xinput --list"`));
  }
  exec("xinput --list", (err, stdout, stderr) => {
    if (err) {
      /* logger here. */
      return callback(err);
    }

    if (process.env.VERBOSE) {
      console.info(chalk.gray(stdout));
    }

    if (process.env.VERBOSE) {
      console.info(chalk.gray("Splitting stdout by line ending"));
    }
    var scannerDevices = stdout.split("\n").filter((line) => {
      return line.indexOf(deviceName) !== -1;
    });

    if (scannerDevices.length === 0) {
      err = new Error("Barcode scanner device not found!");
    } else if (scannerDevices.length > 1) {
      err = new Error("Too many scanner devices for one PC!");
    }

    if (err) {
      /* logger here. */
      return callback(err);
    }

    if (process.env.VERBOSE) {
      console.info(chalk.gray(`Id extracting for "${deviceName}"`));
    }
    var id = extractDeviceId(scannerDevices[0]);
    if (process.env.VERBOSE) {
      console.info(chalk.gray(`Id is "${id}"`));
    }

    if (process.env.VERBOSE) {
      console.info(chalk.gray(`Status extracting for "${deviceName}"`));
    }
    var status = extractDeviceStatus(scannerDevices[0]);
    if (process.env.VERBOSE) {
      console.info(chalk.gray(`Status is "${status}"`));
    }

    if (!id || status.startsWith("unknown:")) {
      err = new Error(`Wrong scanner device id or status. id:"${id}", status: "${status}"`);
    }

    if (err) {
      /* logger here. */
      return callback(err);
    }

    callback(null, id, status);
  });
}

/*
 * disableOutput callback function.
 * @callback disableOutputCallback
 *
 * @param {object} err - Any error.
 */

/*
 * Find scanner device and disable output into system.
 *
 * @param {!disableOutputCallback} callback
 */
function disableOutput(callback) {
  getXinputDeviceIdAndStatus(scannerName, (err, id, status) => {
    if (err) {
      return callback(err);
    }

    if (status === "output-disabled") {
      return callback();
    }

    if (process.env.VERBOSE) {
      console.info(chalk.gray(`Call "xinput float ${id}"`));
    }
    exec(`xinput float ${id}`, (err, stdout) => {
      if (err) {
        /* logger here. */
        return callback(err);
      }

      if (process.env.VERBOSE) {
        console.info(chalk.gray(stdout));
        console.info(chalk.gray("Cheking result."));
      }

      getXinputDeviceIdAndStatus(scannerName, (err, id, status) => {
        if (err) {
          return callback(err);
        }

        if (status === "output-disabled") {
          if (process.env.VERBOSE) {
            console.info(chalk.gray("Successful operation."));
          }

          return callback();
        } else {
          /* logger here. */
          err = new Error("Can't disable scanner output.");
          return callback(err);
        }
      });
    });
  });
}

/*
 * enableOutput callback function.
 * @callback enableOutputCallback
 *
 * @param {object} err - Any error.
 */

/*
 * Find scanner device and enable output into system.
 *
 * @param {!enableOutputCallback} callback
 */
function enableOutput(callback) {
  getXinputDeviceIdAndStatus(scannerName, (err, scannerId, status) => {
    if (err) {
      return callback(err);
    }

    if (status === "output-enabled") {
      return callback();
    }

    getXinputDeviceIdAndStatus(virtualCoreKeyboardName, (err, virtualCoreKeyboardId) => {
      if (err) {
        return callback(err);
      }

      if (process.env.VERBOSE) {
        console.info(chalk.gray(`Call "xinput reattach ${scannerId} ${virtualCoreKeyboardId}"`));
      }
      exec(`xinput reattach ${scannerId} ${virtualCoreKeyboardId}`, (err, stdout) => {
        if (err) {
          return callback(err);
        }

        if (process.env.VERBOSE) {
          console.info(chalk.gray(stdout));
          console.info(chalk.gray("Cheking result."));
        }

        getXinputDeviceIdAndStatus(scannerName, (err, id, status) => {
          if (err) {
            return callback(err);
          }

          if (status === "output-enabled") {
            if (process.env.VERBOSE) {
              console.info(chalk.gray("Successful operation."));
            }

            return callback();
          } else {
            /* logger here. */
            err = new Error("Can't enable scanner output.");
            return callback(err);
          }
        });
      });
    });
  });
}

module.exports = {
  disableOutput,
  enableOutput,
  /* Exports for tests, should not be used outside. */
  __extractDeviceId: extractDeviceId,
  __extractDeviceStatus: extractDeviceStatus
};
