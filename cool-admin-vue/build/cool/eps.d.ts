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

	interface ExamQuestionEntity {
		/**
		 * 题目内容
		 */
		content?: string;

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

	type json = any;

	interface BaseSysRole {
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
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysRoleEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysRoleEntity[];
			[key: string]: any;
		}>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysRoleEntity[]>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			update: string;
			add: string;
			info: string;
			page: string;
			list: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			update: boolean;
			add: boolean;
			info: boolean;
			page: boolean;
			list: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysParam {
		/**
		 * 根据键返回网页的参数值
		 */
		html(data: { key: string }): Promise<any>;

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
		info(data: { id: integer }): Promise<BaseSysParamEntity>;

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
			html: string;
			add: string;
			delete: string;
			update: string;
			info: string;
			page: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			html: boolean;
			add: boolean;
			delete: boolean;
			update: boolean;
			info: boolean;
			page: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysMenu {
		/**
		 * 导出
		 */
		export(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysMenuEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysMenuEntity[];
			[key: string]: any;
		}>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysMenuEntity[]>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 创建代码
		 */
		create(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 导入
		 */
		import(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			export: string;
			info: string;
			page: string;
			list: string;
			delete: string;
			create: string;
			update: string;
			add: string;
			import: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			export: boolean;
			info: boolean;
			page: boolean;
			list: boolean;
			delete: boolean;
			create: boolean;
			update: boolean;
			add: boolean;
			import: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysUser {
		/**
		 * 移动部门
		 */
		move(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 下载用户导入模板
		 */
		downloadTemplate(data: { token?: string }): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysUserEntity>;

		/**
		 * 批量导入用户
		 */
		importUsers(data: { departmentId: integer }): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysUserEntity[];
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
			move: string;
			delete: string;
			downloadTemplate: string;
			update: string;
			info: string;
			importUsers: string;
			page: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			move: boolean;
			delete: boolean;
			downloadTemplate: boolean;
			update: boolean;
			info: boolean;
			importUsers: boolean;
			page: boolean;
			add: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysDepartment {
		/**
		 * 排序
		 */
		order(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysDepartmentEntity[]>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { order: string; delete: string; add: string; list: string; update: string };

		/**
		 * 权限状态
		 */
		_permission: {
			order: boolean;
			delete: boolean;
			add: boolean;
			list: boolean;
			update: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysLog {
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
		 * 获得日志报错时间
		 */
		getKeep(data?: any): Promise<any>;

		/**
		 * 清理日志
		 */
		clear(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { page: string; setKeep: string; getKeep: string; clear: string };

		/**
		 * 权限状态
		 */
		_permission: { page: boolean; setKeep: boolean; getKeep: boolean; clear: boolean };

		request: Service["request"];
	}

	interface BaseComm {
		/**
		 * 权限与菜单
		 */
		permmenu(data?: any): Promise<any>;

		/**
		 * 修改个人信息
		 */
		personUpdate(data?: any): Promise<any>;

		/**
		 * 编程
		 */
		program(data?: any): Promise<any>;

		/**
		 * 实体信息与路径
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 文件上传模式
		 */
		uploadMode(data?: any): Promise<any>;

		/**
		 * 个人信息
		 */
		person(data?: any): Promise<any>;

		/**
		 * 文件上传
		 */
		upload(data?: any): Promise<any>;

		/**
		 * 退出
		 */
		logout(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			permmenu: string;
			personUpdate: string;
			program: string;
			eps: string;
			uploadMode: string;
			person: string;
			upload: string;
			logout: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			permmenu: boolean;
			personUpdate: boolean;
			program: boolean;
			eps: boolean;
			uploadMode: boolean;
			person: boolean;
			upload: boolean;
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
		 * 获得网页内容的参数值
		 */
		html(data?: any): Promise<any>;

		/**
		 * 刷新token
		 */
		refreshToken(data: { refreshToken: string }): Promise<any>;

		/**
		 * 登录
		 */
		login(data?: any): Promise<any>;

		/**
		 * check
		 */
		check(data?: any): Promise<any>;

		/**
		 * gen
		 */
		gen(data: { type?: string }): Promise<any>;

		/**
		 * 实体信息与路径
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			captcha: string;
			html: string;
			refreshToken: string;
			login: string;
			check: string;
			gen: string;
			eps: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			captcha: boolean;
			html: boolean;
			refreshToken: boolean;
			login: boolean;
			check: boolean;
			gen: boolean;
			eps: boolean;
		};

		request: Service["request"];
	}

	interface BaseCoding {
		/**
		 * 创建代码
		 */
		createCode(data?: any): Promise<any>;

		/**
		 * 获取模块目录结构
		 */
		getModuleTree(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { createCode: string; getModuleTree: string };

		/**
		 * 权限状态
		 */
		_permission: { createCode: boolean; getModuleTree: boolean };

		request: Service["request"];
	}

	interface ExamQuestion {
		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<ExamQuestionEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: ExamQuestionEntity[];
			[key: string]: any;
		}>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<ExamQuestionEntity[]>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 批量导入题目
		 */
		import(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 下载题目导入模板
		 */
		template(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			info: string;
			page: string;
			delete: string;
			list: string;
			update: string;
			import: string;
			add: string;
			template: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			info: boolean;
			page: boolean;
			delete: boolean;
			list: boolean;
			update: boolean;
			import: boolean;
			add: boolean;
			template: boolean;
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
		 * 下载用户导入模板
		 */
		downloadTemplate(data?: any): Promise<any>;

		/**
		 * 批量导入用户
		 */
		importUsers(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<UserInfoEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: UserInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<UserInfoEntity[]>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			update: string;
			downloadTemplate: string;
			importUsers: string;
			info: string;
			page: string;
			list: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			update: boolean;
			downloadTemplate: boolean;
			importUsers: boolean;
			info: boolean;
			page: boolean;
			list: boolean;
			add: boolean;
		};

		request: Service["request"];
	}

	interface DictInfo {
		/**
		 * 获得字典数据
		 */
		data(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<DictInfoEntity>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: DictInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<DictInfoEntity[]>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 获得字典数据
		 */
		types(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			data: string;
			info: string;
			add: string;
			page: string;
			delete: string;
			list: string;
			update: string;
			types: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			data: boolean;
			info: boolean;
			add: boolean;
			page: boolean;
			delete: boolean;
			list: boolean;
			update: boolean;
			types: boolean;
		};

		request: Service["request"];
	}

	interface DictType {
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
		 * 信息
		 */
		info(data: { id: integer }): Promise<DictTypeEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: DictTypeEntity[];
			[key: string]: any;
		}>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<DictTypeEntity[]>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			update: string;
			add: string;
			info: string;
			page: string;
			list: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			update: boolean;
			add: boolean;
			info: boolean;
			page: boolean;
			list: boolean;
		};

		request: Service["request"];
	}

	interface SpaceType {
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
		info(data: { id: integer }): Promise<SpaceTypeEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: SpaceTypeEntity[];
			[key: string]: any;
		}>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<SpaceTypeEntity[]>;

		/**
		 * 权限标识
		 */
		permission: {
			add: string;
			delete: string;
			update: string;
			info: string;
			page: string;
			list: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			add: boolean;
			delete: boolean;
			update: boolean;
			info: boolean;
			page: boolean;
			list: boolean;
		};

		request: Service["request"];
	}

	interface SpaceInfo {
		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<SpaceInfoEntity>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: SpaceInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<SpaceInfoEntity[]>;

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
		 * 权限标识
		 */
		permission: {
			info: string;
			page: string;
			list: string;
			delete: string;
			update: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			info: boolean;
			page: boolean;
			list: boolean;
			delete: boolean;
			update: boolean;
			add: boolean;
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
				param: BaseSysParam;
				menu: BaseSysMenu;
				user: BaseSysUser;
				department: BaseSysDepartment;
				log: BaseSysLog;
			};
			comm: BaseComm;
			open: BaseOpen;
			coding: BaseCoding;
		};
		exam: { question: ExamQuestion };
		user: { info: UserInfo };
		dict: { info: DictInfo; type: DictType };
		space: { type: SpaceType; info: SpaceInfo };
	};

	type DictKey = "undefined";
}
