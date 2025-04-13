import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		enable: false,
		toolbar: {
			component: null,
			enable: false
		}
	};
};
