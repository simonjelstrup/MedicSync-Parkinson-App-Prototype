const { withEntitlementsPlist } = require('@expo/config-plugins');

module.exports = function withNfcEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    mod.modResults['com.apple.developer.nfc.readersession.formats'] = ['NDEF', 'TAG'];
    return mod;
  });
};
