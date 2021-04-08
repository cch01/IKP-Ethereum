const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: ['@babel/polyfill', './src/app/javascripts/app.js']
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js'
  },
  plugins: [new CopyWebpackPlugin(
    {
      patterns:[
        { from: './src/app/index.html', to: "index.html" },
        { from: './src/app/javascripts', to: 'javascripts'},
        { from: './src/app/stylesheets', to: 'stylesheets'},
      ]
    }
  )],
  devtool: "source-map ./src",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  }
}
