const { withEntitlementsPlist, withXcodeProject } = require('@expo/config-plugins');

// Strips Push Notifications in-memory before the native files are written to disk.
// A companion script (scripts/strip-push.js) handles any that survive to disk.
// Run "npm run prebuild:ios" instead of "npx expo run:ios --device" to keep ios/ clean.
// Remove this plugin when upgrading to a paid Apple Developer account.
module.exports = (config) => {
  // Remove aps-environment from the entitlements plist before it is written
  config = withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });

  // Remove com.apple.Push from the Xcode project capabilities before pbxproj is written
  config = withXcodeProject(config, (mod) => {
    const pbxProj = mod.modResults.pbxProjectSection();
    for (const key of Object.keys(pbxProj)) {
      if (key.endsWith('_comment')) continue;
      const targetAttributes = pbxProj[key]?.attributes?.TargetAttributes;
      if (!targetAttributes) continue;
      for (const tKey of Object.keys(targetAttributes)) {
        if (tKey.endsWith('_comment')) continue;
        const caps = targetAttributes[tKey]?.SystemCapabilities;
        if (caps) delete caps['com.apple.Push'];
      }
    }
    return mod;
  });

  return config;
};
