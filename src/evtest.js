/* Include suspawn for run evtest utility under sudo. */
const suspawn = require("suspawn");
/* Include EventEmitter for emit scan events. */
const EventEmitter = require("events");
/* Include chalk for add colors to output text in terminal. */
const chalk = require("chalk");

/*
 * @typedef evtestEventValue
 * @type {object}
 * @property {string} value - Property value.
 * @property {string=} code - Property value code.
 */

/*
 * @typedef evtestEvent
 * @type {object}
 * @property {evtestEventValue=} time - Timestamp.
 * @property {evtestEventValue} type - Evtest event type (in app used type with value: "EV_KEY").
 * @property {evtestEventValue=} code - Evtest value code of type.
 * @property {evtestEventValue} value - Object with event value "0" or "1", where "1" - pressed, "0"- released.
 */

/*
 * Parse evtest event line to object.
 * @param {!string} rawLine - Evtest event line.
 * @return {evtestEvent}
 */
function parseEvtestLine(rawLine) {
  /* Cut "Event:" from line. */
  var eventData = rawLine.split(":")[1];
  /* Handle line wihtout event. */
  if (!eventData) {
    return { type: { value: "null-string", code: null }, value: { value: eventData, code: null } };
  }

  /* Handle delimiter line, like empty but shows between events. */
  if (eventData.indexOf("SYN_REPORT") !== -1) {
    return { type: { value: "delimiter", code: null }, value: { value: eventData, code: null } };
  }

  /* Pasrse event props and save into object. */
  var event = {};

  eventData.split(", ").forEach((keyValue) => {
    keyValue = keyValue.trim().split(" ");
    if (keyValue.length === 2) {
      event[keyValue[0]] = { value: keyValue[1], code: null };
    } else if (keyValue.length === 3) {
      event[keyValue[0]] = {
        code: keyValue[1],
        /* substring for removing circle braces */
        value: keyValue[2].substring(1, keyValue[2].length - 1)
      };
    }
  }, {});

  return event;
}

/*
 * Stringify array of evtest events into string.
 *
 * @param {!evtestEvent[]} buffer - Array of evtest events.
 * @return {string} - Stringified buffer of event.code.value without "KEY_".
 */
function evtestBufferToStirng(buffer) {
  return buffer
    .map((event) => {
      return event.code.value.replace("KEY_", "");
    })
    .join("");
}

/*
 * @typedef spawnObject
 * @type {object}
 * @property {object} evtest - Instance of spawned evtest process. (All props and use see in https://nodejs.org/api/child_process.html)
 * @property {boolean} isReady - Spawned application ready status.
 * @property {object} emitter - Instance of nodejs event-emitter. 
 *   Has next events: 
 *     "scan" - will emitted when scanning was finished; 
 *     "close" - will emited if process will closed.
 *     "ready" - will emited once when scanner spawned will ready, 
 */

/*
 * Spawn evtest process under sudo and listen scanner ("as keyboard") events.
 *
 * @param {!string} eventName - Event name from "/dev/input" wich scanner was handled in system.
 * @param {?function} logger - logger should be comparable with native console.
 * @retrun {spawnObject}
 */
function spawnEvtest(eventName, logger) {
  var emitter = new EventEmitter();
  if (logger) {
    logger.info(chalk.gray(`Spawn evtest --grab /dev/input/${eventName}`));
  }
  var evtest = suspawn("evtest", ["--grab", `/dev/input/${eventName}`]);
  /* readMode required for skip evtest initialization output. */
  var readMode = false;
  var buffer = [];
  var returns = {
    evtest: evtest,
    emitter: emitter,
    isReady: false
  };

  var previousLastLine = "";
  evtest.stdout.on("data", (data) => {
    data = previousLastLine + data.toString();

    if (logger) {
      logger.info(chalk.gray(data));
    }

    /* Handle evtest initialization. */
    if (data.indexOf("Testing ... (interrupt to exit)") !== -1) {
      readMode = true;
      if (data.indexOf("This device is grabbed by another process.") !== -1) {
        var error = new Error(`Scanner is busy, close another read processes for "/dev/input/${eventName}" and try again.`);
        if (logger) {
          logger.error(error);
        }

        throw error;
      } else {
        if (logger) {
          logger.info(chalk.gray("Scanner is ready."));
        }

        returns.isReady = true;
        emitter.emit("ready");
      }

      return;
    }

    /* Do not run empty lines of lines before when evtest will inited. */
    if (!readMode || !data) {
      return;
    }

    data = data.split("\n");
    previousLastLine = data.pop();
    /* Split required since data can has several events at one time. */
    data.forEach((rawLine) => {
      var event = parseEvtestLine(rawLine);
      /* Handle only released keys. */
      if (event.type && event.type.value === "EV_KEY" && event.value && event.value.value === "0") {
        if (event.code.value === "KEY_ENTER") {
          var value = evtestBufferToStirng(buffer);
          if (logger) {
            logger.info(chalk.gray(`Scanning finished. Value: ${value}`));
          }

          emitter.emit("scan", value);
          buffer = [];
          return;
        }

        buffer.push(event);
      }
    });
  });

  if (logger) {
    evtest.stderr.on("data", (data) => {
      logger.error(data);
    });
  }

  evtest.on("close", emitter.emit.bind(emitter, "close"));

  if (logger) {
    logger.info(chalk.gray("Process spawned."));
  }

  return returns;
}

module.exports = {
  spawnEvtest: spawnEvtest,
  __parseEvtestLine: parseEvtestLine,
  __evtestBufferToStirng: evtestBufferToStirng
};
