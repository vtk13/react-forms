const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    externals: [nodeExternals()],
    entry: './src/server.ts',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.server.json',
                },
            },
            // {test: /\.js$/, loader: 'source-map-loader'},
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    // devtool: 'inline-source-map',
    devtool: 'source-map',
};
