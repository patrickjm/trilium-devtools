import webpack from 'webpack';
import { existsSync } from 'fs';
import { resolve } from 'path';
import fetch from 'node-fetch';

function getConfigFile() {
  const dir = process.cwd();
  const configPath = resolve(dir, 'trilium-devtools.config.js');
  if (!existsSync(configPath)) {
    throw new Error('No config file found at: ' + configPath);
  }
  return require(configPath);
}

class TriliumReloader {
  constructor(public apiUrl: string) {}

  callReload = async (data: string) => {
    return fetch(this.apiUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: data
    })
  }
}

class HotReloadPlugin implements webpack.WebpackPluginInstance {
  constructor(private reloader: TriliumReloader) { }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.afterEmit.tap('HotReload', (compilation: webpack.Compilation) => {
      if (Object.getOwnPropertyNames(compilation.assets).length > 1) {
        console.error('Error: Your webpack is configured to emit more than one asset file which is not supported.', compilation.assets);
        process.exit(1);
      }
    })
    compiler.hooks.assetEmitted.tap(
      'HotReloadPlugin',
      (file, { content, source, outputPath, compilation, targetPath }) => {
        console.log('assetEmitted!', resolve(outputPath, file));
        console.log(targetPath);
        console.log(content.toString()); // <Buffer 66 6f 6f 62 61 72>
        this.reloader.callReload(content.toString());
      }
    );
  }
}

export async function startWebpack() {
  const config = getConfigFile();
  const defaultWebpackConfig: webpack.Configuration = {
    watch: true,
    module: {
      rules: []
    },
    resolve: {
      extensions: []
    },
    output: {
      path: resolve(process.cwd(), 'dist'),
      filename: 'bundle.js',
    },
    plugins: []
  };
  const webpackConfig = await config?.webpack(defaultWebpackConfig, { configType: 'DEVELOPMENT' });
  const reloader = new TriliumReloader('http://localhost:3001/dev/update');
  webpackConfig!.plugins.push(new HotReloadPlugin(reloader));
  console.log('Webpack config', JSON.stringify(webpackConfig));

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error("Error", err);
    }
    console.log("Done!");
  });
}