import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		label: "在线测试",
		name: "exam",
		options: {
			// 模块选项配置
		},
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
		]
	};
}; 