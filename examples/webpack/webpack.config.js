const path = require('path');

const config = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: {
      type: 'module',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'cheap-module-source-map',
  experiments: {
    outputModule: true,
    // buildHttp: ['https://esm.sh/', 'https://cdn.esm.sh/'],
  },
  externals: {
    react: 'https://esm.sh/react@17.0.2',
    'react-dom': 'https://esm.sh/react-dom@17.0.2',
  },
  externalsType: 'module',
};

module.exports = config;
