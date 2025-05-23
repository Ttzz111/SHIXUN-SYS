import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		enable: false,
		options: {
			index: 'https://cool-js.com',
			api: 'https://service.cool-js.com/api'
		},
		toolbar: {
			h5: false,
			order: 1,
			component: null,
			enable: false
		},
		pages: [
			{
				path: '/helper/ai-code',
				meta: {
					label: 'Ai 极速编码',
					keepAlive: true
				},
				component: () => import('./views/ai-code.vue')
			}
		]
	};
};
