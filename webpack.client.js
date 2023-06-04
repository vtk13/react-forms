const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'build/pub'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public', 'index.html'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.client.json',
                },
            },
            // {test: /\.js$/, loader: 'source-map-loader'},
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    // devtool: 'inline-source-map',
    devtool: 'source-map',
};
