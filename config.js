//var app_url = 'http://127.0.0.1:8889';
var app_url = 'https://api.fengjuanshop.com';
// 如果是本地测试环境
if(process.env.NODE_ENV === 'development'){
    //#ifdef H5
	app_url = 'https://api.fengjuanshop.com';
	//#endif
}
// 如果是生产环境，h5环境下直接读取url
if(process.env.NODE_ENV === 'production'){
    //#ifdef H5
	app_url = window.location.protocol+'//' + window.location.host;
	//#endif
}

export default {
	/*服务器地址*/
	app_url: app_url,
	/*appid*/
	appId: 'wx1deb8106fcb1b2c8',
	//h5发布路径
	h5_addr: '/h5',
} 