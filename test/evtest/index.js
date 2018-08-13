var fs = require("fs");
var path = require("path");

var assert = require("assert");
var diff = require("deep-object-diff").diff;
var deepEqual = assert.deepStrictEqual || assert.deepEqual;

var evtest = require("../../src/evtest");

var mockupEvent = fs.readFileSync(path.join(__dirname, "./mockup-event.txt"), "utf-8");
var expectedEvent = JSON.parse(fs.readFileSync(path.join(__dirname, "./expected-event.json"), "utf-8"));

var mockupBuffer = JSON.parse(fs.readFileSync(path.join(__dirname, "./mockup-buffer.json"), "utf-8"));
var expectedStringifiedBuffer = fs.readFileSync(path.join(__dirname, "./expected-stringified-buffer.txt"), "utf-8");

describe("evtest", function() {
  it("#parse event", function() {
    var actual = evtest.__parseEvtestLine(mockupEvent);

    deepEqual(actual, expectedEvent, ". Diff(expected, actual):" + JSON.stringify(diff(expectedEvent, actual), null, 2));
  });

  it("#stringify buffer", function() {
    var actual = evtest.__evtestBufferToStirng(mockupBuffer);

    assert.equal(actual, expectedStringifiedBuffer);
  });
});

