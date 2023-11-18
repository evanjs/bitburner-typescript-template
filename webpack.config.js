const path = require('path')
const TranspilePlugin = require('transpile-webpack-plugin');

const glob = require('glob');

function getEntries(pattern) {
    const entries = {};

    glob.sync(pattern).forEach((file) => {
        // console.log(`Original name: ${file}`)
        let replaced = file.replace('src/', '')
        // console.log(`New name: ${replaced}`)
        entries[replaced] = path.join(__dirname, file);
    });

    return entries;
}

module.exports = {
    mode: 'development',
    resolve: {
        extensions: [
            '.tsx',
            '.ts',
            '.js'
        ],
        preferRelative: true
    },
    entry: getEntries('src/*.ts'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]',
    },
    plugins: [
        new TranspilePlugin({
            longestCommonDir: './src'
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    }
}
