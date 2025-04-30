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
		name: "practice", // 直接指定名称
		label: "实践预约",
		options: {}, // 确保 options 为对象
		views: [
			{
				path: "/practice/admin/activity",
				component: () => import("./views/admin/activity.vue"),
				meta: {
					title: "实践活动管理"
				}
			},
			{
				path: "/practice/admin/reservation",
				component: () => import("./views/admin/reservation.vue"),
				meta: {
					title: "预约管理"
				}
			},
			{
				path: "/practice/student/activity",
				component: () => import("./views/student/activity.vue"),
				meta: {
					title: "实践活动"
				}
			},
			{
				path: "/practice/student/reservation",
				component: () => import("./views/student/reservation.vue"),
				meta: {
					title: "我的预约"
				}
			}
		],
		app
	});
}; 