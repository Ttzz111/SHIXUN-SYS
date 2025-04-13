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
		views: [
			{
				path: "/exam/question",
				component: () => import("./views/question.vue"),
				meta: {
					title: "题库管理"
				}
			},
			{
				path: "/exam/paper",
				component: () => import("./views/paper.vue"),
				meta: {
					title: "试卷管理"
				}
			},
			{
				path: "/exam/test",
				component: () => import("./views/test.vue"),
				meta: {
					title: "考试管理"
				}
			}
		],
		app
	});
}; 