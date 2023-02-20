var fs = require("fs");
var path = require("path");

var assert = require("assert");
var diff = require("deep-object-diff").diff;
var deepEqual = assert.deepStrictEqual || assert.deepEqual;

var catDevices = require("../../src/cat-devices");

var mockupDevice = fs.readFileSync(path.join(__dirname, "./mockup-device.txt"), "utf-8");
var expectedDevice = JSON.parse(fs.readFileSync(path.join(__dirname, "./expected-device.json"), "utf-8"));

//var mockupDevices = fs.readFileSync(path.join(__dirname, "./mockup-devices.txt"), "utf-8");
var expectedDevices = JSON.parse(fs.readFileSync(path.join(__dirname, "./expected-devices.json"), "utf-8"));

describe("cat devices", function() {
  it("#parse device property key-value", function() {
    var actual = catDevices.__parseDeviceKeyValue("Phys=ALSA");
    var expected = {
      key: "Phys",
      value: "ALSA"
    };

    deepEqual(actual, expected, ". Diff(expected, actual):" + JSON.stringify(diff(expected, actual), null, 2));
  });

  it("#parse device", function() {
    var actual = catDevices.__parseDevice(mockupDevice);

    deepEqual(actual, expectedDevice, ". Diff(expected, actual):" + JSON.stringify(diff(expectedDevice, actual), null, 2));
  });

  it("#get device dev input event", function() {
    var actual = catDevices.getDeviceDevInputEvent(expectedDevice);

    assert.equal(actual, "event4");
  });

  it("#get devices list (async)", function(done) {
    catDevices.devicesList(path.join(__dirname, "./mockup-devices.txt"), function(err, devices) {
      if (err) {
        return done(err);
      }

      try {
        deepEqual(devices, expectedDevices, ". Diff(expected, actual):" + JSON.stringify(diff(expectedDevices, devices), null, 2));
      } catch (e) {
        return done(e);
      }

      done();
    });
  });

  it("#get scanner device (async)", function(done) {
    catDevices.getScanner(path.join(__dirname, "./mockup-devices.txt"), function(err, scanner) {
      if (err) {
        return done(err);
      }

      try {
        deepEqual(scanner, expectedDevice, ". Diff(expected, actual):" + JSON.stringify(diff(expectedDevice, scanner), null, 2));
      } catch (e) {
        return done(e);
      }

      done();
    });
  });
});
