"use strict";
let path=require('path');
let webpack=require('webpack');

module.exports={
    devtool: "source-map",
    entry: {
        js: "./entry.js",
        html: "./html/index.html"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
        sourceMapFilename: "[file].map"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["react","es2015"],
                    //sourceMaps: true
                }
            },
            {
                test: /\.html$/,
                loader: "file?name=[name].[ext]"
            },
            {
                test: /\.scss$/,
                loader: "style!css!sass"
            },{
                test: /\.png$/,
                loader: "img"
            }
        ]
    },
    plugins: [
        //new webpack.HotModuleReplacementPlugin(),
        /*new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })*/
    ],
    
    devServer: {
        contentBase: "./dist",
        port: 8080,
        //hot: true,
        //inline: true
    }
};
