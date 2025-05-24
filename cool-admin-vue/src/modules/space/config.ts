import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		ignore: {
			NProgress: ['/space/info/add']
		},

		components: [
			() => import('./components/space.vue'),
			() => import('./components/space-inner.vue')
		],

		views: [
			{
				meta: {
					label: '文件空间'
				},
				path: '/space/list',
				component: () => import('./views/list.vue')
			},
			{
				meta: {
					label: '论坛首页'
				},
				path: '/forum',
				component: () => import('./views/index.vue')
			},
			{
				meta: {
					label: '帖子详情'
				},
				path: '/forum/detail',
				component: () => import('./views/detail.vue')
			},
			{
				meta: {
					label: '我的帖子'
				},
				path: '/forum/mypost',
				component: () => import('./views/mypost.vue')
			},
			{
				meta: {
					label: '我的点赞和收藏'
				},
				path: '/forum/like',
				component: () => import('./views/like.vue')
			}
		]
	};
};
