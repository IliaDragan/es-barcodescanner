var knownDevices = [{
  name: "USB HJ ScannerApp",
  vendor: "0483",
  product: "5741"
}, {
  name: "Future             USB Virtual PS2 Port    ",
  vendor: "04b4",
  product: "0100"
}];

module.exports = {
  checkByName: function(name) {
    return knownDevices.some(function(knownDevice) {
      return knownDevice.name === name;
    });
  },
  findByName: function(data){
    return knownDevices.some(function(knownDevice) {
      return data.indexOf(knownDevice.name) !== -1;
    });
  },
  checkByVendorProduct: function(vendor, product) {
    return knownDevices.some(function(knownDevice) {
      return knownDevice.vendor === vendor && knownDevice.product === product;
    });
  }
}
