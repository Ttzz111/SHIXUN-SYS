import { createApp } from "vue";
import config from "./config";
import { module } from "/@/cool";

export default () => {
	// 创建模块
	const app = createApp({});
	
	// 获取配置
	const conf = config();

	// 模块配置
	module.add({
		name: "exam", 
		label: "在线测试",
		options: conf.options || {}, 
		views: conf.views,
		app
	});
}; 