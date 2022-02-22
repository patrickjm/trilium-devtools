const path = require('path');

module.exports = {
  webpack: async (config, { configType }) => {
    config.entry = path.resolve(__dirname, 'src/index.ts');
    config.devtool = 'inline-source-map';
    config.module.rules.push({
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    });
    config.resolve.extensions = ['.tsx', '.ts', '.js'];

    return config;
  }
}