const chalk = require("chalk");
/* Include exec from child_process for run cat utility. */
const { exec } = require("child_process");
/* Name of scanner device.  */
const scannerName = "USB HJ ScannerApp";
/* File with list of devices.  */
const devicesFile = "/proc/bus/input/devices";

/* Regex for device value prefix */
const devicePrefixRegex = /([A-Z]): /i;
/* Regex for device key-value */
const deviceKeyValue = /([^=]+)=([^]*)/;

/*
 * @typedef DeviceKeyValue
 * @type {object}
 * @property {string} key - Device property key.
 * @property {string} value - Device property value.
 */

/*
 * Parse device key and value.
 *
 * @param {!string} datum - Device property line from "cat $devicesFile" wihtout prefix.
 * @return {DeviceKeyValue} Device property key and value.
 */
function parseDeviceKeyValue(datum) {
  /*
   * Exec result
   * keyValue[0] - input line
   * keyValue[1] - key
   * keyValue[2] - value
   */
  var keyValue = deviceKeyValue.exec(datum);

  return {
    key: keyValue[1],
    value: keyValue[2]
  };
}

/*
 * @typedef DeviceObjectProp
 * @type {object}
 * @propetry {string|array} value - Value of the property.
 * @propetry {string} prefix - Line prefix (props group).
 */

/*
 * There described only usable in this program props, other available props: 
 *  Vendor, Product, Version, Bus, Phys, Sysfs, Uniq, PROP, EV, KEY, MSC, LED, SW.
 * @typedef DeviceObject
 * @type {object}
 * @property {DeviceObjectProp} Name - Device name without quotes.
 * @property {DeviceObjectProp} Handlers - Array off system handlers.
 */

/*
 * Parse one device props.
 * 
 * @param {string} deviceString - One device lines group from "cat $devicesFile"
 * @return {DeviceObject}
 */
function parseDevice(deviceString) {
  var deviceObject = {};
  deviceString.split("\n").forEach(function(line) {
    /*
     * Split result
     *  - line[0] - Always empty string
     *  - line[1] - Line prefix
     *  - line[2] - Other data
     */
    line = line.split(devicePrefixRegex);
    /* 
     * Skip empty lines. 
     */
    if (line.length === 3) {
      var keyValue = parseDeviceKeyValue(line[2]);
      /* Custom line values. */
      switch (keyValue.key) {
        case "Bus":
          var otherKeyValue = keyValue.value.split(" ");
          /* Parsed value for "Bus". */
          keyValue.value = otherKeyValue.shift();
          otherKeyValue.forEach((l) => {
            var keyValue = parseDeviceKeyValue(l);

            deviceObject[keyValue.key] = {
              value: keyValue.value,
              prefix: line[1]
            };
          });
          break;
        case "Name":
          /* Remove quotes if first and list chars is double quote. */
          if (keyValue.value[0] === '"' && keyValue.value[keyValue.value.length - 1] === '"') {
            keyValue.value = keyValue.value.substring(1, keyValue.value.length - 1);
          }
          break;
        case "Handlers":
          /* Slipt handlers. */
          keyValue.value = keyValue.value.split(" ");
          break;
      }

      deviceObject[keyValue.key] = {
        value: keyValue.value,
        prefix: line[1]
      };
    }
  });

  return deviceObject;
}

/*
 * devicesList callback function.
 * @callback devicesListCallback
 *
 * @param {object} err - Any error.
 * @param {DeviceObject[]} devices - List of devices
 */

/*
 * Get list of devices info from system\file
 *
 * @param {?string} filename - Path to the file with devices (by default: /proc/bus/input/devices)
 * @param {devicesListCallback} callback.
 * @param {?function} logger - logger should be comparable with native console.
 */
function devicesList(filename, callback, logger) {
  if (filename instanceof Function && !callback) {
    callback = filename;
    filename = null;
  }

  if (!filename) {
    filename = devicesFile;
  }

  if (logger) {
    logger.info(chalk.gray(`Call "cat ${filename}"`));
  }
  exec(`cat ${filename}`, (err, stdout) => {
    if (err) {
      if (logger) {
        logger.error(err);
      }
      return callback(err);
    }

    if (logger) {
      logger.info(chalk.gray(stdout));
    }

    if (logger) {
      logger.info(chalk.gray("Devices parsing."));
    }
    callback(null, stdout.split("\n\n").map(parseDevice));
  });
}

/*
 * getScanner callback function.
 * @callback getScannerCallback
 *
 * @param {object} err - Any error.
 * @param {DeviceObject} scanner - Info of the scanner device.
 */

/*
 * Get scanner device info
 *
 * @param {?string} filename - Path to the file with devices (by default: used file from devicesList)
 * @param {getScannerCallback} callback.
 * @param {?function} logger - logger should be comparable with native console.
 */
function getScanner(filename, callback, logger) {
  if (filename instanceof Function && !callback) {
    callback = filename;
    filename = null;
  }

  devicesList(filename, (err, devices) => {
    if (err) {
      return callback(err);
    }

    if (logger) {
      logger.info(chalk.gray("Find scanner device."));
    }

    var device = devices.find((device) => {
      return device.Name.value === scannerName;
    });

    callback(null, device);
  });
}

/*
 * Regex for match event in device Handlers.
 */
const devInputEventRegex = /^event\d+$/;

/*
 * Get event handler from device info.
 *
 * @param {DeviceObject} device - Device info.
 * @param {?function} logger - logger should be comparable with native console.
 * @return {string} - Event name.
 */
function getDeviceDevInputEvent(device, logger) {
  if (logger) {
    logger.info(chalk.gray("Find device event."));
  }

  return device.Handlers.value.find((v) => {
    return devInputEventRegex.test(v);
  });
}

module.exports = {
  devicesList,
  getScanner,
  getDeviceDevInputEvent,
  /* Exports for tests, should not be used outside. */
  __parseDeviceKeyValue: parseDeviceKeyValue,
  __parseDevice: parseDevice
};
