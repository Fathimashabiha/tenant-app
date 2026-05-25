const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Lower parallel workers to reduce memory use during bundling on Windows.
config.maxWorkers = 2;

module.exports = config;
