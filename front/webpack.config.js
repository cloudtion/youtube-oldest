
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.s?css$/i,
            use: [
              // Creates `style` nodes from JS strings
              "style-loader",
              // Translates CSS into CommonJS
              "css-loader",
              // Compiles Sass to CSS
              "sass-loader",
            ],
        },
    ],
    },
    resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Youtube Oldest to Newest',
        }),
        new Dotenv({
            path: process.env.NODE_ENV==='development'? path.join(__dirname, 'dev.env') : path.join(__dirname, 'prod.env')
        }),
    ],
    output: {
        path: path.join(__dirname, '..', 'public'),
        filename: '[contenthash].bundle.js'
    },
    devServer: {
        historyApiFallback: true,
    },

}