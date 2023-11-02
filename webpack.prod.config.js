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
        publicPath: "auto",
    },
    devtool: 'inline-source-map',
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.js','.html'],
    },
    optimization: {
        minimize: true,
    },
    performance: {
        hints: 'warning'
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
    ],

}