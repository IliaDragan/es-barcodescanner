/* List of known devices for detecting app from cat-devices and xinput. */
var knownDevices = [
  {
    name: "USB HJ ScannerApp",
    vendor: "0483",
    product: "5741"
  },
  {
    name: "Future             USB Virtual PS2 Port    ",
    vendor: "04b4",
    product: "0100"
  },
  {
    name: "Newland Auto-ID FM100 HID KBW",
    vendor: "1eab",
    product: "1603"
  }
];

module.exports = {
  /* Direct comparison. Used in cat-devices. */
  checkByName: function(name) {
    return knownDevices.some(function(knownDevice) {
      return knownDevice.name === name;
    });
  },
  /* Match in string. Used in xinput. */
  findByName: function(data) {
    return knownDevices.some(function(knownDevice) {
      return data.indexOf(knownDevice.name) !== -1;
    });
  },
  /* Compare by vendonId and productId. Not used but provided. */
  checkByVendorProduct: function(vendor, product) {
    return knownDevices.some(function(knownDevice) {
      return knownDevice.vendor === vendor && knownDevice.product === product;
    });
  }
};
