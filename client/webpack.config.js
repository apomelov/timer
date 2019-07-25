const path = require('path');
const webpack = require("webpack");

const HtmlWebPackPlugin = require("html-webpack-plugin");

const jsLoader = {
    loader: "babel-loader",
    options: {
        presets: ["env", "react", "stage-0"]
    }
};

const htmlLoader = {
    loader: "html-loader",
    options: {minimize: true}
};

const limitedUrlLoader = {
    loader: "url-loader",
    options: {
        limit: 10,
        name: "images/[hash:12].[ext]"
    }
};

module.exports = (env, argv) => {
    const PROD = argv.mode === "production";
    const DEV = !PROD;

    return {
        devtool: PROD ? undefined : "cheap-module-eval-source-map",
    
        entry: ["babel-polyfill", "./src/main/javascript/index.js"],
        output: {
            path: path.resolve(__dirname, 'build/generated-resources/static'),
            filename: "bundle.js"
        },
        optimization: {
            splitChunks: {
                chunks: "all"
            }
        },
        devServer: {
            port: 9000,
            proxy: {
                "/api": "http://localhost:8080",
                "/socket": {
                    target: "ws://localhost:8080",
                    ws: true
                }
            }
        },
        watchOptions: {
            ignored: ['files/**/*.js', 'node_modules']
        },
        module: {
            rules: [
                { test: /\.js$/,   use: jsLoader, exclude: /node_modules/ },
                { test: /\.html$/, use: htmlLoader },
                {
                    test: /\.p?css$/,
                    use: [{
                        loader: 'style-loader',
                    }, {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        }
                    }, {
                        loader: 'postcss-loader'
                    }]
                },
                { test: /\.(svg|png|jpe?g|gif|ico)$/, use: limitedUrlLoader },
                { test: /\.(woff2?|ttf|eot)$/, use: limitedUrlLoader }
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                React: "react",
            }),
            new HtmlWebPackPlugin({
                template: "./index.html",
                filename: "./index.html"
            })
        ]
    }
};
