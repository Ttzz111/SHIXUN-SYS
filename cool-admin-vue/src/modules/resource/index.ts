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
		name: "resource", // 直接指定名称，确保有值
		label: "资源库",
		options: {}, // 确保 options 为对象而非 undefined
		views: [
			{
				path: "/resource/category",
				component: () => import("./views/category.vue"),
				meta: {
					title: "资源分类"
				}
			},
			{
				path: "/resource/management",
				component: () => import("./views/management.vue"),
				meta: {
					title: "资源管理"
				}
			},
			{
				path: "/resource/audit",
				component: () => import("./views/audit.vue"),
				meta: {
					title: "资源审核"
				}
			}
		],
		app
	});
}; 