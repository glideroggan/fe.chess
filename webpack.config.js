const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: {
            import: './src/bootstrap.ts',
        },
    },
    output: {
        publicPath: "http://localhost:8080/",
    },
    devtool: 'inline-source-map',
    mode: 'development',
    resolve: {
        extensions: ['.ts', '.js','.html'],
    },
    optimization: {
        minimize: true,
    },
    performance: {
        hints: false
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist/assets'),
            publicPath: '/assets'
        },
        port: 8080,
        // headers: {
        //     // Enable wide open CORS
        //     'Access-Control-Allow-Origin': '*',
        //     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        //     'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        // },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.json/,
                type: 'asset/resource'
            },
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            hash: true,
            minify: true
        }),
        new CopyWebpackPlugin({
            patterns:
                [
                    { from: 'src/assets/images', to: 'assets/images' },
                    { from: 'src/assets/css', to: 'assets/css' },
                ],
            options: { concurrency: 100 }
        }),
        // new ModuleFederationPlugin({
        //     name: "shell",
        //     filename: "remoteEntry.js",
        //     exposes: {
        //         achievementcard: './src/components/achievement-card/achievement-card',
        //         modal: './src/components/modal/modal',
        //     },
        //     shared: shared.shared
        // }),
    ],

}