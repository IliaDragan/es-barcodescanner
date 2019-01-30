const fs = require("fs");
const path = require("path");
const assert = require("assert");

const xinput = require("../../src/xinput");

/* Load test data. */
const mockupDataEnabled = fs.readFileSync(path.join(__dirname, "mockup-data-enabled.txt"), "utf-8").split("\n");
const mockupDataDisabled = fs.readFileSync(path.join(__dirname, "mockup-data-disabled.txt"), "utf-8").split("\n");

/* Name of master output device. */
const virtualCoreKeyboardName = "Virtual core keyboard";
/* Name of scanner device.  */
const scannerName = "USB HJ ScannerApp";

/* Line numbers from mockup data with testable devices. */
const lineNumberWithScannerDevice = 15;
const lineNumberWithVirtualCoreKeyboardDevice = 5;

describe("xinput id", function() {
  it("#id of enabled scanner device", function() {
    var actualId = xinput.__extractDeviceId(mockupDataEnabled[lineNumberWithScannerDevice]);
    assert.equal(actualId, 10);
  });

  it("#id of disabled scanner device", function() {
    var actualId = xinput.__extractDeviceId(mockupDataDisabled[lineNumberWithScannerDevice]);
    assert.equal(actualId, 10);
  });

  it("#id of virtual core keyboard", function() {
    var actualId = xinput.__extractDeviceId(mockupDataEnabled[lineNumberWithVirtualCoreKeyboardDevice]);
    assert.equal(actualId, 3);
  });
});

describe("xinput status", function() {
  it("#status of enabled scanner device", function() {
    var actualId = xinput.__extractDeviceStatus(mockupDataEnabled[lineNumberWithScannerDevice]);
    assert.equal(actualId, "output-enabled");
  });

  it("#status of disabled scanner device", function() {
    var actualId = xinput.__extractDeviceStatus(mockupDataDisabled[lineNumberWithScannerDevice]);
    assert.equal(actualId, "output-disabled");
  });

  it("#status of virtual core keyboard", function() {
    var actualId = xinput.__extractDeviceStatus(mockupDataEnabled[lineNumberWithVirtualCoreKeyboardDevice]);
    assert.equal(actualId, "output-enabled");
  });
});
