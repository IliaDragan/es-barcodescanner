const path = require("path");

const suspawn = require("suspawn");
const { spawnEvtest } = require("../../src/evtest");

const assert = require("assert");

describe("evtest specal key", function() {
  it("#left shift key", function() {
    const _process = spawnEvtest("mockup", null, function() {
      return suspawn("sh", [path.join(__dirname, "./cat-with-timeout.sh")]);
    });

    _process.emitter.on("scan", (scannedValue) => {
      assert.equal(scannedValue, "N123456789");
    });
  });
});
