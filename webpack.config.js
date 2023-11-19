const path = require('path')
const TranspilePlugin = require('transpile-webpack-plugin');
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const CopyPlugin = require("copy-webpack-plugin");

function replaceWithPatternAndLog(content, pattern, replace) {
    console.log(`Finding pattern ${pattern} and replacing using string: ${replace}`);
    return String(content).replace(pattern, replace);
}

function prefixImportsWithModuleName(content, moduleName) {
    const pattern = /(from ['"])(.+?\/.*)(\.js)/g;
    const replace = `$1${moduleName}$2`;
    return replaceWithPatternAndLog(content, pattern, replace)
}

function removeJsFromImport(content) {
    const pattern = /(from.*?)(\.js)/g;
    const replace = '$1';
    return replaceWithPatternAndLog(content, pattern, replace);
}

function fixImports(content, moduleName) {
    let modifiedText = prefixImportsWithModuleName(content, 'xxxsinx');
    modifiedText = removeJsFromImport(modifiedText)
    return modifiedText;
}

module.exports = {
    mode: 'production',
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
        new CopyPlugin({
            patterns: [
                {
                    from: "external/xxxsinx",
                    to: "xxxsinx",
                    globOptions: {
                        caseSensitiveMatch: false,
                        ignore: [
                            "**/*.gitignore",
                            "**/readme.*"
                        ]
                    },
                    transform: {
                        transformer(content, path) {
                            return Promise.resolve(fixImports(content));
                        }
                    }
                }
            ],
        }),
        new WebpackWatchedGlobEntries(),
    ],
    entry: WebpackWatchedGlobEntries.getEntries(
        [
            path.resolve(__dirname, 'src/*.ts'),
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
