import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
export const plugins = [
    new MonacoWebpackPlugin({
        // available options are documented at https://github.com/microsoft/monaco-editor/blob/main/webpack-plugin/README.md#options
        languages: ['json', 'markdown']
    })
];
