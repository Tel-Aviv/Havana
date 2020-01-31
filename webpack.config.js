var path = require('path');

module.exports = {
    entry: {
        bundle: path.resolve(__dirname, './src/index.js'),
        // ssr_bundle: './src/ssr/index.js'
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: [/node_modules/, 
                      '/ssr/index.js'],
            use: ['babel-loader']
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },    
        {
            test: /\.less$/,
            use: [{
                loader: 'less-loader',
                options: {
                    modifyVars: {
                        'primary-color': '#1DA57A',
                        'link-color': '#1DA57A',
                        'border-radius-base': '2px',
                    },
                    javascriptEnabled: true
                }
            }]
            
        },
        {
            test: /\.(gif|png|jpe?g|svg)$/i,
            use: [
                'file-loader',             
            ]
        }      
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    performance: {
        hints: false
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        chunkFilename: '[name].bundle.js'
        // filename: 'bundle.js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true
    },    
    devtool: 'source-map',
}