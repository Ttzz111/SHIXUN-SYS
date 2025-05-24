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

	type json = any;

	interface BaseSysUser {
		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysUserEntity>;

		/**
		 * 下载用户导入模板
		 */
		downloadTemplate(data: { token?: string }): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysUserEntity[];
			[key: string]: any;
		}>;

		/**
		 * 批量导入用户
		 */
		importUsers(data: { departmentId: integer }): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 移动部门
		 */
		move(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			info: string;
			downloadTemplate: string;
			add: string;
			page: string;
			importUsers: string;
			update: string;
			delete: string;
			move: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			info: boolean;
			downloadTemplate: boolean;
			add: boolean;
			page: boolean;
			importUsers: boolean;
			update: boolean;
			delete: boolean;
			move: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysParam {
		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysParamEntity[];
			[key: string]: any;
		}>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 根据键返回网页的参数值
		 */
		html(data: { key: string }): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysParamEntity>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			page: string;
			update: string;
			html: string;
			delete: string;
			info: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			page: boolean;
			update: boolean;
			html: boolean;
			delete: boolean;
			info: boolean;
			add: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysLog {
		/**
		 * 清理日志
		 */
		clear(data?: any): Promise<any>;

		/**
		 * 获得日志报错时间
		 */
		getKeep(data?: any): Promise<any>;

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
		permission: { clear: string; getKeep: string; page: string; setKeep: string };

		/**
		 * 权限状态
		 */
		_permission: { clear: boolean; getKeep: boolean; page: boolean; setKeep: boolean };

		request: Service["request"];
	}

	interface BaseSysDepartment {
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
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 排序
		 */
		order(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { update: string; list: string; add: string; delete: string; order: string };

		/**
		 * 权限状态
		 */
		_permission: {
			update: boolean;
			list: boolean;
			add: boolean;
			delete: boolean;
			order: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysMenu {
		/**
		 * 导入
		 */
		import(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysMenuEntity>;

		/**
		 * 创建代码
		 */
		create(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<BaseSysMenuEntity[]>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: BaseSysMenuEntity[];
			[key: string]: any;
		}>;

		/**
		 * 导出
		 */
		export(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			import: string;
			add: string;
			update: string;
			info: string;
			create: string;
			delete: string;
			list: string;
			page: string;
			export: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			import: boolean;
			add: boolean;
			update: boolean;
			info: boolean;
			create: boolean;
			delete: boolean;
			list: boolean;
			page: boolean;
			export: boolean;
		};

		request: Service["request"];
	}

	interface BaseSysRole {
		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

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
		 * 信息
		 */
		info(data: { id: integer }): Promise<BaseSysRoleEntity>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			delete: string;
			list: string;
			page: string;
			add: string;
			info: string;
			update: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			delete: boolean;
			list: boolean;
			page: boolean;
			add: boolean;
			info: boolean;
			update: boolean;
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

	interface BaseOpen {
		/**
		 * check
		 */
		check(data?: any): Promise<any>;

		/**
		 * 刷新token
		 */
		refreshToken(data: { refreshToken: string }): Promise<any>;

		/**
		 * gen
		 */
		gen(data: { type?: string }): Promise<any>;

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
		 * 登录
		 */
		login(data?: any): Promise<any>;

		/**
		 * 实体信息与路径
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			check: string;
			refreshToken: string;
			gen: string;
			captcha: string;
			html: string;
			login: string;
			eps: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			check: boolean;
			refreshToken: boolean;
			gen: boolean;
			captcha: boolean;
			html: boolean;
			login: boolean;
			eps: boolean;
		};

		request: Service["request"];
	}

	interface BaseComm {
		/**
		 * 个人信息
		 */
		person(data?: any): Promise<any>;

		/**
		 * 实体信息与路径
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 文件上传模式
		 */
		uploadMode(data?: any): Promise<any>;

		/**
		 * 退出
		 */
		logout(data?: any): Promise<any>;

		/**
		 * 文件上传
		 */
		upload(data?: any): Promise<any>;

		/**
		 * 编程
		 */
		program(data?: any): Promise<any>;

		/**
		 * 权限与菜单
		 */
		permmenu(data?: any): Promise<any>;

		/**
		 * 修改个人信息
		 */
		personUpdate(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			person: string;
			eps: string;
			uploadMode: string;
			logout: string;
			upload: string;
			program: string;
			permmenu: string;
			personUpdate: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			person: boolean;
			eps: boolean;
			uploadMode: boolean;
			logout: boolean;
			upload: boolean;
			program: boolean;
			permmenu: boolean;
			personUpdate: boolean;
		};

		request: Service["request"];
	}

	interface SpaceInfo {
		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<SpaceInfoEntity>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<SpaceInfoEntity[]>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: SpaceInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 权限标识
		 */
		permission: {
			add: string;
			info: string;
			update: string;
			delete: string;
			list: string;
			page: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			add: boolean;
			info: boolean;
			update: boolean;
			delete: boolean;
			list: boolean;
			page: boolean;
		};

		request: Service["request"];
	}

	interface SpaceType {
		/**
		 * 查询
		 */
		list(data?: any): Promise<SpaceTypeEntity[]>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: SpaceTypeEntity[];
			[key: string]: any;
		}>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<SpaceTypeEntity>;

		/**
		 * 权限标识
		 */
		permission: {
			list: string;
			page: string;
			update: string;
			delete: string;
			add: string;
			info: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			list: boolean;
			page: boolean;
			update: boolean;
			delete: boolean;
			add: boolean;
			info: boolean;
		};

		request: Service["request"];
	}

	interface UserInfo {
		/**
		 * 下载用户导入模板
		 */
		downloadTemplate(data?: any): Promise<any>;

		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<UserInfoEntity[]>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: UserInfoEntity[];
			[key: string]: any;
		}>;

		/**
		 * 批量导入用户
		 */
		importUsers(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<UserInfoEntity>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			downloadTemplate: string;
			add: string;
			list: string;
			page: string;
			importUsers: string;
			update: string;
			info: string;
			delete: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			downloadTemplate: boolean;
			add: boolean;
			list: boolean;
			page: boolean;
			importUsers: boolean;
			update: boolean;
			info: boolean;
			delete: boolean;
		};

		request: Service["request"];
	}

	interface ExamQuestion {
		/**
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<ExamQuestionEntity>;

		/**
		 * 批量导入题目
		 */
		import(data?: any): Promise<any>;

		/**
		 * 下载题目导入模板
		 */
		template(data?: any): Promise<any>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<ExamQuestionEntity[]>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 分页
		 */
		page(data?: any): Promise<{
			pagination: { size: number; page: number; total: number; [key: string]: any };
			list: ExamQuestionEntity[];
			[key: string]: any;
		}>;

		/**
		 * 权限标识
		 */
		permission: {
			add: string;
			info: string;
			import: string;
			template: string;
			update: string;
			list: string;
			delete: string;
			page: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			add: boolean;
			info: boolean;
			import: boolean;
			template: boolean;
			update: boolean;
			list: boolean;
			delete: boolean;
			page: boolean;
		};

		request: Service["request"];
	}

	interface DictType {
		/**
		 * 查询
		 */
		list(data?: any): Promise<DictTypeEntity[]>;

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
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<DictTypeEntity>;

		/**
		 * 权限标识
		 */
		permission: {
			list: string;
			page: string;
			add: string;
			update: string;
			delete: string;
			info: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			list: boolean;
			page: boolean;
			add: boolean;
			update: boolean;
			delete: boolean;
			info: boolean;
		};

		request: Service["request"];
	}

	interface DictInfo {
		/**
		 * 信息
		 */
		info(data: { id: integer }): Promise<DictInfoEntity>;

		/**
		 * 查询
		 */
		list(data?: any): Promise<DictInfoEntity[]>;

		/**
		 * 修改
		 */
		update(data?: any): Promise<any>;

		/**
		 * 删除
		 */
		delete(data?: any): Promise<any>;

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
		 * 新增
		 */
		add(data?: any): Promise<any>;

		/**
		 * 获得字典数据
		 */
		data(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			info: string;
			list: string;
			update: string;
			delete: string;
			page: string;
			types: string;
			add: string;
			data: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			info: boolean;
			list: boolean;
			update: boolean;
			delete: boolean;
			page: boolean;
			types: boolean;
			add: boolean;
			data: boolean;
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
				user: BaseSysUser;
				param: BaseSysParam;
				log: BaseSysLog;
				department: BaseSysDepartment;
				menu: BaseSysMenu;
				role: BaseSysRole;
			};
			coding: BaseCoding;
			open: BaseOpen;
			comm: BaseComm;
		};
		space: { info: SpaceInfo; type: SpaceType };
		user: { info: UserInfo };
		exam: { question: ExamQuestion };
		dict: { type: DictType; info: DictInfo };
	};

	type DictKey = "undefined";
}
