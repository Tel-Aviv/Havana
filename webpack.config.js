const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
    plugins: [
        new FileManagerPlugin({
          onEnd: {
            copy: [
                { 
                    source: './dist/', 
                    destination: 'C:\\Dev\\Havana\\PS\\PS\\' 
                }
            ]
          }
        })
    ],
    entry: {
        bundle: path.resolve(__dirname, './src/index.js'),
        // ssr_bundle: './src/ssr/index.js'
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            include: path.resolve(__dirname, 'src'),          
            use: ['babel-loader']
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },    
        {
            // This will embed LESS into CSS styles in html page, but
            // the content of LESS files will not be exported as css-rules but only collected
            // to be rendered into a style-tag. See https://stackoverflow.com/questions/56900096/less-style-not-applied-to-react-component-in-reactwebpack-application/56900253#56900253
            test: /\.less$/,
            use: [
                {
                    loader: "style-loader"
                }, {
                    loader: 'css-loader' // translates CSS into CommonJS
                },{
                    loader: 'less-loader',
                    options: {
                        modifyVars: {
                            'primary-color': '#1DA57A',
                            'link-color': '#1DA57A',
                            'border-radius-base': '2px'
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
        extensions: ['*', '.js', '.jsx', 'less'],
        alias: {
            "@components": path.resolve(__dirname, "src/components"),
        }        
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