/*
 * 支付
 */
export const pay = (result, self, success, fail) => {
	if (result.code === -10) {
		self.showError(result.msg);
		return false;
	}

	// 发起微信支付
	if (result.data.payType == 20) {
		//小程序支付
		// #ifdef  MP-WEIXIN	
		uni.requestPayment({
			provider: 'wxpay',
			timeStamp: result.data.payment.timeStamp,
			nonceStr: result.data.payment.nonceStr,
			package: result.data.payment.packageValue,
			signType: 'MD5',
			paySign: result.data.payment.paySign,
			success: res => {
				paySuccess(result, self, success);
			},
			fail: res => {
				self.showError('订单未支付成功', () => {
					payError(result, fail, self);
				});
			},
		});
		// #endif
		//公众号支付
		// #ifdef  H5
		if (self.isWeixin()) {
			WeixinJSBridge.invoke('getBrandWCPayRequest', JSON.parse(result.data.payment),
				function(res) {
					if (res.err_msg == "get_brand_wcpay_request:ok") {
						paySuccess(result, self, success);
					} else if (res.err_msg == "get_brand_wcpay_request:cancel") {
						self.showSuccess('支付取消', () => {
							payError(result, fail, self);
						});
					} else {
						self.showError('订单未支付成功', () => {
							payError(result, fail, self);
						});
					}
				}
			);
		} else {
			let order_id = result.data.order_id;
			if (result.data.payType == 40) {
				order_id = result.data.order_advance_id;
			}
			//h5支付
			self.gotoPage('/pages/order/pay-h5/pay-h5?order_id=' + order_id + '&order_type=' + result.data
				.orderType);
			return;
		}
		// #endif
		// #ifdef  APP-PLUS
		//微信支付
		wxAppPay(result, self, success, fail);
		// #endif
	}
	// 余额支付
	if (result.data.payType == 10) {
		paySuccess(result, self, success);
	}
	// 支付宝支付
	if (result.data.payType == 30) {
		// #ifdef  APP-PLUS
		aliAppPay(result, self, success, fail);
		// #endif
		// #ifdef  H5
		let order_id = result.data.order_id;
		if (result.data.orderType == 40) {
			order_id = result.data.order_advance_id;
		}
		self.gotoPage('/pages/order/alipay-h5/alipay-h5?order_id=' + order_id + '&order_type=' + result
			.data.order_type);
		// #endif
	}
}

/*跳到支付成功页*/
function paySuccess(result, self, success) {
	if (success) {
		success(result);
		return;
	}
	gotoSuccess(result, self);
}
/*跳到支付成功页*/
function gotoSuccess(result, self) {
	self.gotoPage('/pages/order/pay-success/pay-success?order_id=' + result.data.order_id, 'reLaunch');
}

/*支付失败跳订单详情*/
function payError(result, fail, self) {
	if (fail) {
		fail(result);
		return;
	}
	self.gotoPage('/pages/order/order-detail?order_id=' + result.data.order_id, 'redirect');
}

function wxAppPay(result, self, success, fail) {
	// 获取支付通道  
	plus.payment.getChannels(function(channels) {
		self.channel = channels[0];
		console.log(self.channel);
		uni.requestPayment({
			provider: 'wxpay',
			orderInfo: result.data.payment,
			success(res) {
				paySuccess(result, self, success);
			},
			fail(error) {
				console.log(error);
				self.showError('订单未支付成功', () => {
					payError(result, fail);
				});
			},
		});
	}, function(e) {
		console.log("获取支付通道失败：" + e.message);
	});
}

function aliAppPay(result, self, success, fail) {
	console.log(result.data.payment);
	uni.requestPayment({
		provider: 'alipay',
		orderInfo: result.data.payment,
		success(res) {
			paySuccess(result, self, success);
		},
		fail(error) {
			console.log(error);
			self.showError('订单未支付成功', () => {
				payError(result, fail, self);
			});
		},
	});
}
