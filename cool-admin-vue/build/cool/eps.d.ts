declare namespace Eps {
	interface BaseSysRoleEntity {
		/**
		 * 用户ID
		 */
		userId?: number;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface BaseSysMenuEntity {
		/**
		 * 父菜单ID
		 */
		parentId?: number;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface BaseSysUserEntity {
		/**
		 * 部门ID
		 */
		departmentId?: number;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface BaseSysParamEntity {
		/**
		 * 键
		 */
		keyName?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface BaseSysLogEntity {
		/**
		 * 用户ID
		 */
		userId?: number;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface BaseSysDepartmentEntity {
		/**
		 * 部门名称
		 */
		name?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface SpaceInfoEntity {
		/**
		 * 地址
		 */
		url?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface SpaceTypeEntity {
		/**
		 * 类别名称
		 */
		name?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface UserInfoEntity {
		/**
		 * 登录唯一ID
		 */
		unionid?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface DictInfoEntity {
		/**
		 * 类型ID
		 */
		typeId?: number;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface DictTypeEntity {
		/**
		 * 名称
		 */
		name?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	type json = any;

	interface BaseSysRole {
		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysRoleEntity>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysRoleEntity[]>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysRoleEntity[];
			[key: string]: any;
		}>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			info: string;
			update: string;
			list: string;
			page: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			info: boolean;
			update: boolean;
			list: boolean;
			page: boolean;
			add: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysMenu {
		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysMenuEntity[]>;

		/**
		 * 导出
		 */
		export(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysMenuEntity[];
			[key: string]: any;
		}>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 创建代码
		 */
		create(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysMenuEntity>;

		/**
		 * 导入
		 */
		import(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			list: string;
			export: string;
			delete: string;
			page: string;
			update: string;
			create: string;
			add: string;
			info: string;
			import: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			list: boolean;
			export: boolean;
			delete: boolean;
			page: boolean;
			update: boolean;
			create: boolean;
			add: boolean;
			info: boolean;
			import: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysUser {
		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysUserEntity[];
			[key: string]: any;
		}>;

		/**
		 * 移动部门
		 */
		move(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysUserEntity>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			page: string;
			move: string;
			info: string;
			add: string;
			delete: string;
			update: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			page: boolean;
			move: boolean;
			info: boolean;
			add: boolean;
			delete: boolean;
			update: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysParam {
		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysParamEntity>;

		/**
		 * 根据键返回网页的参数值
		 */
		html(data: { key: string }): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysParamEntity[];
			[key: string]: any;
		}>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			update: string;
			info: string;
			html: string;
			add: string;
			page: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			update: boolean;
			info: boolean;
			html: boolean;
			add: boolean;
			page: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysLog {
		/**
		 * 获得日志报错时间
		 */
		getKeep(data?: any): Promise<any>;

		/**
		 * 清理日志
		 */
		clear(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysLogEntity[];
			[key: string]: any;
		}>;

		/**
		 * 设置日志保存时间
		 */
		setKeep(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { getKeep: string; clear: string; page: string; setKeep: string };

		/**
		 * 权限状态
		 */
		_permission: { getKeep: boolean; clear: boolean; page: boolean; setKeep: boolean };

		request: Service["request"];
	}

	interface BaseSysDepartment {
		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 排序
		 */
		order(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysDepartmentEntity[]>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { delete: string; order: string; update: string; list: string; add: string };

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			order: boolean;
			update: boolean;
			list: boolean;
			add: boolean;
		};

		request: Service["request"];
	}

	interface BaseComm {
		/**
		 * 修改个人信息
		 */
		personUpdate(data?: any): Promise<any>;

		/**
		 * 个人信息
		 */
		person(data?: any): Promise<any>;

		/**
		 * 文件上传
		 */
		upload(data?: any): Promise<any>;

		/**
		 * 实体信息与路径
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 编程
		 */
		program(data?: any): Promise<any>;

		/**
		 * 权限与菜单
		 */
		permmenu(data?: any): Promise<any>;

		/**
		 * 文件上传模式
		 */
		uploadMode(data?: any): Promise<any>;

		/**
		 * 退出
		 */
		logout(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			personUpdate: string;
			person: string;
			upload: string;
			eps: string;
			program: string;
			permmenu: string;
			uploadMode: string;
			logout: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			personUpdate: boolean;
			person: boolean;
			upload: boolean;
			eps: boolean;
			program: boolean;
			permmenu: boolean;
			uploadMode: boolean;
			logout: boolean;
		};

		request: Service["request"];
	}

	interface BaseOpen {
		/**
		 * 验证码
		 */
		captcha(data: {
			/** 类型：svg|base64  */
			type?: string;
			/** 宽度  */
			width?: integer;
			/** 高度  */
			height?: integer;
		}): Promise<any>;

		/**
		 * 登录
		 */
		login(data?: any): Promise<any>;

		/**
		 * 刷新token
		 */
		refreshToken(data: { refreshToken: string }): Promise<any>;

		/**
		 * check
		 */
		check(data?: any): Promise<any>;

		/**
		 * gen
		 */
		gen(data: { type?: string }): Promise<any>;

		/**
		 * 获得网页内容的参数值
		 */
		html(data?: any): Promise<any>;

		/**
		 * 实体信息与路径
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			captcha: string;
			login: string;
			refreshToken: string;
			check: string;
			gen: string;
			html: string;
			eps: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			captcha: boolean;
			login: boolean;
			refreshToken: boolean;
			check: boolean;
			gen: boolean;
			html: boolean;
			eps: boolean;
		};

		request: Service["request"];
	}

	interface BaseCoding {
		/**
		 * 获取模块目录结构
		 */
		getModuleTree(data?: any): Promise<any>;

		/**
		 * 创建代码
		 */
		createCode(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { getModuleTree: string; createCode: string };

		/**
		 * 权限状态
		 */
		_permission: { getModuleTree: boolean; createCode: boolean };

		request: Service["request"];
	}

	interface SpaceInfo {
		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: SpaceInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<SpaceInfoEntity>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<SpaceInfoEntity[]>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			page: string;
			delete: string;
			update: string;
			info: string;
			list: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			page: boolean;
			delete: boolean;
			update: boolean;
			info: boolean;
			list: boolean;
			add: boolean;
		};

		request: Service["request"];
	}

	interface SpaceType {
		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: SpaceTypeEntity[];
			[key: string]: any;
		}>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<SpaceTypeEntity>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<SpaceTypeEntity[]>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			page: string;
			add: string;
			info: string;
			delete: string;
			list: string;
			update: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			page: boolean;
			add: boolean;
			info: boolean;
			delete: boolean;
			list: boolean;
			update: boolean;
		};

		request: Service["request"];
	}

	interface UserInfo {
		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: UserInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<UserInfoEntity>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<UserInfoEntity[]>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			update: string;
			add: string;
			page: string;
			info: string;
			list: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			update: boolean;
			add: boolean;
			page: boolean;
			info: boolean;
			list: boolean;
		};

		request: Service["request"];
	}

	interface DictInfo {
		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 获得字典数据
		 */
		data(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: DictInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 获得字典数据
		 */
		types(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<DictInfoEntity>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<DictInfoEntity[]>;

		/**
		 * 权限标识
		 */
		permission: {
			add: string;
			delete: string;
			update: string;
			data: string;
			page: string;
			types: string;
			info: string;
			list: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			add: boolean;
			delete: boolean;
			update: boolean;
			data: boolean;
			page: boolean;
			types: boolean;
			info: boolean;
			list: boolean;
		};

		request: Service["request"];
	}

	interface DictType {
		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: DictTypeEntity[];
			[key: string]: any;
		}>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<DictTypeEntity>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<DictTypeEntity[]>;

		/**
		 * 权限标识
		 */
		permission: {
			page: string;
			add: string;
			delete: string;
			update: string;
			info: string;
			list: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			page: boolean;
			add: boolean;
			delete: boolean;
			update: boolean;
			info: boolean;
			list: boolean;
		};

		request: Service["request"];
	}

	type Service = {
		/**
		 * 基础请求
		 */
		request(options?: {
			url: string;
			method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
			data?: any;
			params?: any;
			headers?: {
				authorization?: string;
				[key: string]: any;
			};
			timeout?: number;
			proxy?: boolean;
			[key: string]: any;
		}): Promise<any>;

		base: {
			sys: {
				role: BaseSysRole;
				menu: BaseSysMenu;
				user: BaseSysUser;
				param: BaseSysParam;
				log: BaseSysLog;
				department: BaseSysDepartment;
			};
			comm: BaseComm;
			open: BaseOpen;
			coding: BaseCoding;
		};
		space: { info: SpaceInfo; type: SpaceType };
		user: { info: UserInfo };
		dict: { info: DictInfo; type: DictType };
	};

	type DictKey = string;
}
