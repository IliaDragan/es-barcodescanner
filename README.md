# Overview
Node js application for barcode scanner which is determined in unix system as "keyboard device" with possible names: "USB HJ ScannerApp", "Future             USB Virtual PS2 Port    ". Application used unix xinput for detach output from system (into focused text field) and evtest for watch "keyboard" events from scanner after when output will detached.

IMPORTANT! Only one barcode scanner device can be connected to the PC.

# Installation
This application will work only in unix systems, since in this app used next unix utils: `cat`, `evtest`, `xinput`.
Make sure what they are installed in your system. For check it run next command in termanal:
```bash
command -v cat || echo "cat not found"; command -v evtest || echo "evtest not found"; command -v xinput || echo "xinput not found"; command -v sudo || echo "sudo not found";
```

If you will not see any "not found" message then you can go to the next step otherwise install not found utils.
For example Ubuntu\Debian:
```bash
#install cat
sudo apt-get -y install cat;
#install evtest
sudo apt-get -y install evtest;
#install xinput
sudo apt-get -y install xinput;
#install sudo
sudo apt-get -y install sudo;
```

After when all required utilities was installed, clone this rep, go to project root directory and run `npm install`.
```bash
git clone git@github.com:inleadmedia/es-barcodescanner.git && cd ./es-barcodescanner && npm install;
```

Done project was installed and ready to work. If you want to use this project as dependency for another project jsut install it as npm git module.

# Usage
If you install this perository as npm dependency then you can use name from require without changes, otherwise you should use or relative path to index.js file for your custom name of repository. Evtest util required root access for execution because of this when `barcodeScanner.spawnEvtest` will called app will request sudo password (should be written manually) or for skip stap with password just run app as `sudo node ....`;

```javascript
const barcodeScanner = require("es-barcodescanner");
const logger = process.env.NODE_ENV !== 'production' ? console : null /* Use any logger what support console interface. */;

/* Disable scanner output into focused field. */
barcodeScanner.disableOutput((err) => {
  if (err) {
    if (logger) {
      console.error(err);
    }
    process.exit(1);
  }

  if (logger) {
    logger.info("Scanner output disabled");
  }
  
  /* Get scanner id and status from xinput unitl (only for show information, was not required for using scanner). */
  barcodeScanner.getScannerIdAndStatus((err, id, status) => {
    if (err) {
      if (logger) {
        logger.error(err);
      }
      process.exit(1);
    }
    /* Get scanner info. */
    barcodeScanner.getScanner((err, deviceInfo) => {
      if (err) {
        if (logger) {
          logger.error(err);
        }
        process.exit(1);
      }
      
      /* Get scanner event name from device list (required for watch events through evtest). */
      var eventName = barcodeScanner.getDeviceDevInputEvent(deviceInfo, logger);

      if (logger) {
        logger.info(`"Id (xinput): ${id}", "Output (xinput): ${status}", "Input event (/proc/bus/input/devices): ${eventName}"`);
      }

      try {
        /* Run evtest watching for scanner events. */
        var _process = barcodeScanner.spawnEvtest(eventName, logger);
      } catch (err) {
        if (logger) {
          logger.error(err);
        }
        return process.exit(1);
      }

      /* Handle scanned value. */
      _process.emitter.on("scan", (scannedValue) => {
        if (logger) {
          logger.info(`Barcode value: ${scannedValue}`);
        }
    
        /* Do something with scanned value. */
      });

      var ready = function() {
        if (logger) {
          logger.info("Scanner is ready.");
        }

        /* Do something when scanner is ready. */
      };

      /* Check if scanner is ready. In another case subscribe to "ready" event. */
      if (_process.isReady) {
        ready();
      } else {
        _process.emitter.once("ready", ready);
      }
    }, logger);
  }, logger);
}, logger);

```

# Features

In all example below logger should be support js console interface.

## getScannerIdAndStatus(callback, logger)
Get id and status of device by device name. Callback accept next arguments: `callback(err, xInputId, xInputStatus)`.

## disableOutput(callback, logger)
Find scanner device and disable output into system. Callback accept next arguments: `callback(err)` in case when `err` isn't provided then all is fine.

## enableOutput(callback, logger)
Find scanner device and enable output into system. Callback accept next arguments: `callback(err)` in case when `err` isn't provided then all is fine.

## getScanner(callback, logger)
Get scanner device info. Callback accept next arguments: `callback(err, deviceInfo)`.

## getDeviceDevInputEvent(device, logger)
Get event handler from device info. Will return string with event name or `undefined` in case when event name not found.

## spawnEvtest(eventName, logger)
Spawn evtest process under sudo and listen scanner "as keyboard" events. Will return next hash 
```javascript
{
  /* Instance of spawned evtest from suspawn node js module. */
  evtest: evtest, 
  /* 
   * Node js event emmiter. Possible events: "ready", "scan", "close". 
   * - "ready" will emited when evtest will be ready, also in this hash isReady will setuped into true.
   * - "scan" will emited when '\n' will be readed from evtest output.
   * - "close" will emited when suspawn module will emit "close".
   */
  emitter: emitter,
  /* Ready status, will automatically changed after when "ready" event was emitted. */
  isReady: false
}
```
