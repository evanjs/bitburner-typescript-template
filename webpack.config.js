const path = require('path')
const TranspilePlugin = require('transpile-webpack-plugin');
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");

function replaceWithPatternAndLog(content, pattern, replace) {
    // console.log(`Finding pattern ${pattern} and replacing using string: ${replace}`);
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
    let modifiedText = prefixImportsWithModuleName(content, moduleName);
    modifiedText = removeJsFromImport(modifiedText)
    return modifiedText;
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
    plugins: [
        new WebpackWatchedGlobEntries(),
        new ESLintWebpackPlugin({
            extensions: ['js', 'ts']
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "./external/xxxsinx",
                    to: "xxxsinx",
                    globOptions: {
                        caseSensitiveMatch: false,
                        ignore: [
                            "**/*.gitignore",
                            "**/*.git",
                            "**/readme.*"
                        ]
                    },
                    transform: {
                        transformer(content, path) {
                            return Promise.resolve(fixImports('xxxsinx'));
                        }
                    }
                }
            ],
        }),

    ],
    entry:
        WebpackWatchedGlobEntries.getEntries(
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
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: [
                    /node_modules/
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    },
                },
                enforce: "pre",
            }
        ]
    }
}
