const path = require('path')
const TranspilePlugin = require('transpile-webpack-plugin');
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const ModifyWebpackPlugin = require("modify-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");
// const webpack = require('webpack');


module.exports = {
    mode: 'production',
    // devtool: 'cheap-module-source-map',
    devtool: 'eval',
    resolve: {
        extensions: [
            '.tsx',
            '.ts',
            '.js'
        ],
        preferRelative: true
    },
    plugins: [
        new TranspilePlugin({
            longestCommonDir: './src'
        }),
        new ModifyWebpackPlugin({
            include: [/xxxsinx\/.*\/.*.js$/],
            exclude: ['node_modules', 'src'],
            patterns: [
                {
                    reg: /(from ['"])(.+?\/.*)(\.js)/g,
                    newStr: '$1$2'
                },
                {
                    reg: /from '(.+?)'/,
                    newStr: "from 'xxxsinx/$1'"
                }
            ]
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "external/xxxsinx",
                    to: "xxxsinx"
                }
            ],
        }),
        new WebpackWatchedGlobEntries(),
        // new webpack.optimize.UglifyJsPlugin({
        //     options: {
        //         compress: {drop_debugger: false}
        //     }
        // })
    ],
    entry: WebpackWatchedGlobEntries.getEntries(
        [
            path.resolve(__dirname, 'src/*.ts'),
            // path.resolve(__dirname, 'external/xxxsinx/**/*.js')
        ],
        {
            ignore: [
                '**/*.gitignore'
            ]
        }
    ),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: false
    }
}
