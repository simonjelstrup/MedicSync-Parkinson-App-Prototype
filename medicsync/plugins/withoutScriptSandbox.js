const { withXcodeProject } = require('@expo/config-plugins');

// Disables Xcode's User Script Sandboxing, which blocks expo-dev-client from
// writing ip.txt into the app bundle during a local device build.
module.exports = (config) =>
  withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const configs = project.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configs)) {
      const settings = configs[key]?.buildSettings;
      if (settings) {
        settings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
      }
    }
    return mod;
  });
