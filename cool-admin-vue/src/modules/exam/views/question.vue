<template>
	<cl-crud :on-refresh="onRefresh" ref="Crud">
		<el-row class="mb20">
			<el-col :span="24">
				<cl-refresh-btn />
				<cl-add-btn class="ml10" />
				<cl-multi-delete-btn class="ml10" />
				<el-button type="primary" @click="openImport" class="ml10">
					<template #icon>
						<el-icon><Upload /></el-icon>
					</template>
					<span>批量导入</span>
				</el-button>
				<el-button type="success" @click="addSampleQuestions" class="ml10">
					<template #icon>
						<el-icon><Plus /></el-icon>
					</template>
					<span>添加示例题目</span>
				</el-button>
			</el-col>
		</el-row>

		<el-row :gutter="15" class="mb20">
			<el-col :span="6">
				<cl-filter label="题目内容">
					<el-input v-model="form.content" placeholder="请输入题目内容" clearable @keydown.enter="search" />
				</cl-filter>
			</el-col>
			
			<el-col :span="6">
				<cl-filter label="题目类型">
					<el-select v-model="form.type" placeholder="请选择题目类型" clearable @change="search">
						<el-option label="单选题" :value="1" />
						<el-option label="多选题" :value="2" />
						<el-option label="判断题" :value="3" />
						<el-option label="简答题" :value="4" />
					</el-select>
				</cl-filter>
			</el-col>
			
			<el-col :span="6">
				<cl-filter label="难度等级">
					<el-select v-model="form.level" placeholder="请选择难度等级" clearable @change="search">
						<el-option label="简单" :value="1" />
						<el-option label="中等" :value="2" />
						<el-option label="困难" :value="3" />
					</el-select>
				</cl-filter>
			</el-col>
			
			<el-col :span="6">
				<cl-search-key placeholder="输入题目内容搜索" />
			</el-col>
		</el-row>

		<cl-table v-bind="table" class="mb20" />

		<el-row type="flex" justify="end">
			<cl-flex1 />
			<cl-pagination />
		</el-row>

		<cl-upsert v-bind="upsert" ref="Upsert"/>

		<!-- 批量导入对话框 -->
		<el-dialog v-model="importVisible" title="批量导入题目" width="500px">
			<el-upload
				class="upload-demo"
				drag
				action="/admin/exam/question/import"
				:headers="{ Authorization: token }"
				:on-success="handleImportSuccess"
				:on-error="handleImportError"
				accept=".xlsx,.xls"
			>
				<el-icon class="el-icon--upload"><UploadFilled /></el-icon>
				<div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
				<template #tip>
					<div class="el-upload__tip">
						请上传Excel格式的题库文件(.xlsx或.xls)，
						<el-link type="primary" :underline="true" href="/template/question_template.xlsx" download>下载模板</el-link>
					</div>
				</template>
			</el-upload>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { service } from "/@/cool";
import { useUserStore } from "/@/modules/base/store/user";
import { useCrud } from "@cool-vue/crud";
import { Upload, UploadFilled, Plus } from "@element-plus/icons-vue";

// 获取token
const userStore = useUserStore();
const token = userStore.token;

// 导入对话框
const importVisible = ref(false);

// 原始服务方法
const originalPageService = service.exam.question.page;
const originalInfoService = service.exam.question.info;
const originalDeleteService = service.exam.question.delete;
const originalAddService = service.exam.question.add;
const originalUpdateService = service.exam.question.update;

// 重写service.exam.question.page方法以支持前端模拟
service.exam.question.page = async (params) => {
	// 尝试从localStorage获取数据
	let storedData = localStorage.getItem('examQuestions');
	if (storedData) {
		try {
			let data = JSON.parse(storedData);
			let filteredList = [...data.list]; // 复制一份避免修改原始数据
			
			// 处理筛选条件
			if (params.content) {
				filteredList = filteredList.filter(q => q.content.includes(params.content));
			}
			if (params.type !== undefined && params.type !== null && params.type !== "") {
				filteredList = filteredList.filter(q => q.type === params.type);
			}
			if (params.level !== undefined && params.level !== null && params.level !== "") {
				filteredList = filteredList.filter(q => q.level === params.level);
			}
			if (params.keyWord) {
				filteredList = filteredList.filter(q => q.content.includes(params.keyWord));
			}
			
			// 处理分页
			const page = params.page || 1;
			const size = params.size || 15;
			const start = (page - 1) * size;
			const end = page * size;
			const pageList = filteredList.slice(start, end);
			
			return {
				list: pageList,
				pagination: {
					total: filteredList.length,
					page,
					size
				}
			};
		} catch (e) {
			console.error("解析本地存储的题目数据失败:", e);
		}
	}
	
	// 如果没有本地存储数据，调用原始服务方法
	try {
		return await originalPageService(params);
	} catch (e) {
		console.error("调用后端服务失败，返回空数据:", e);
		return { list: [], pagination: { total: 0, page: 1, size: 15 } };
	}
};

// 重写service.exam.question.info方法以支持前端模拟
service.exam.question.info = async (id) => {
	// 尝试从localStorage获取数据
	let storedData = localStorage.getItem('examQuestions');
	if (storedData) {
		try {
			let data = JSON.parse(storedData);
			let question = data.list.find(q => q.id == id);
			if (question) {
				return question;
			}
		} catch (e) {
			console.error("解析本地存储的题目数据失败:", e);
		}
	}
	
	// 如果没有本地存储数据，调用原始服务方法
	try {
		return await originalInfoService(id);
	} catch (e) {
		console.error("调用后端服务失败:", e);
		return null;
	}
};

// 重写service.exam.question.delete方法以支持前端模拟
service.exam.question.delete = async (ids) => {
	// 尝试从localStorage获取数据
	let storedData = localStorage.getItem('examQuestions');
	if (storedData) {
		try {
			let data = JSON.parse(storedData);
			// 确保ids是数组
			const idsArray = Array.isArray(ids) ? ids : [ids];
			// 过滤掉要删除的题目
			data.list = data.list.filter(q => !idsArray.includes(q.id));
			data.pagination.total = data.list.length;
			
			// 保存回localStorage
			localStorage.setItem('examQuestions', JSON.stringify(data));
			return { message: "删除成功" };
		} catch (e) {
			console.error("解析本地存储的题目数据失败:", e);
		}
	}
	
	// 如果没有本地存储数据，调用原始服务方法
	try {
		return await originalDeleteService(ids);
	} catch (e) {
		console.error("调用后端服务失败:", e);
		return { message: "删除失败" };
	}
};

// 重写service.exam.question.add方法以支持前端模拟
service.exam.question.add = async (data) => {
	// 添加id和创建时间
	const newQuestion = {
		...data,
		id: Date.now(),
		createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
	};
	
	// 尝试从localStorage获取数据
	let storedData = localStorage.getItem('examQuestions');
	if (storedData) {
		try {
			let questionsData = JSON.parse(storedData);
			// 添加新题目
			questionsData.list.push(newQuestion);
			questionsData.pagination.total = questionsData.list.length;
			
			// 保存回localStorage
			localStorage.setItem('examQuestions', JSON.stringify(questionsData));
			return { message: "添加成功", data: newQuestion };
		} catch (e) {
			console.error("解析本地存储的题目数据失败:", e);
		}
	} else {
		// 如果没有现有数据，创建新数据结构
		const questionsData = {
			list: [newQuestion],
			pagination: { total: 1, page: 1, size: 15 }
		};
		localStorage.setItem('examQuestions', JSON.stringify(questionsData));
		return { message: "添加成功", data: newQuestion };
	}
	
	// 如果前端模拟失败，尝试调用原始服务方法
	try {
		return await originalAddService(data);
	} catch (e) {
		console.error("调用后端服务失败:", e);
		return { message: "添加失败" };
	}
};

// 重写service.exam.question.update方法以支持前端模拟
service.exam.question.update = async (data) => {
	// 尝试从localStorage获取数据
	let storedData = localStorage.getItem('examQuestions');
	if (storedData) {
		try {
			let questionsData = JSON.parse(storedData);
			// 找到并更新题目
			const index = questionsData.list.findIndex(q => q.id == data.id);
			if (index !== -1) {
				questionsData.list[index] = { ...questionsData.list[index], ...data };
				
				// 保存回localStorage
				localStorage.setItem('examQuestions', JSON.stringify(questionsData));
				return { message: "更新成功", data: questionsData.list[index] };
			}
		} catch (e) {
			console.error("解析本地存储的题目数据失败:", e);
		}
	}
	
	// 如果前端模拟失败，尝试调用原始服务方法
	try {
		return await originalUpdateService(data);
	} catch (e) {
		console.error("调用后端服务失败:", e);
		return { message: "更新失败" };
	}
};

// 初始化CRUD
const { Crud, Form } = useCrud({
	service: service.exam.question
});

// 表单数据
const form = reactive({
	content: "",
	type: undefined,
	level: undefined
});

// 搜索方法
function search() {
	Crud.value?.refresh({
		...form,
		page: 1
	});
}

// 打开导入对话框
function openImport() {
	importVisible.value = true;
}

// 导入成功回调
function handleImportSuccess(res: any) {
	if (res.code === 1000) {
		ElMessage.success(`导入成功，成功导入${res.data}条题目`);
		importVisible.value = false;
		Crud.value?.refresh();
	} else {
		ElMessage.error(res.message || "导入失败");
	}
}

// 导入失败回调
function handleImportError() {
	ElMessage.error("导入失败，请检查文件格式");
}

// crud 组件
const Upsert = ref();

// 表格配置
const table = reactive({
	align: "center",
	columns: [
		{
			type: "selection",
			width: 60
		},
		{
			label: "题目内容",
			prop: "content",
			minWidth: 200,
			showOverflowTooltip: true
		},
		{
			label: "题目类型",
			prop: "type",
			minWidth: 100,
			formatter: (row: any) => {
				const types = {
					1: "单选题",
					2: "多选题",
					3: "判断题",
					4: "简答题"
				};
				return types[row.type] || "";
			}
		},
		{
			label: "分值",
			prop: "score",
			minWidth: 80
		},
		{
			label: "难度等级",
			prop: "level",
			minWidth: 100,
			formatter: (row: any) => {
				const levels = {
					1: "简单",
					2: "中等",
					3: "困难"
				};
				return levels[row.level] || "";
			}
		},
		{
			label: "创建时间",
			prop: "createTime",
			minWidth: 150
		},
		{
			label: "操作",
			type: "op",
			buttons: ["edit", "delete"]
		}
	]
});

// 新增、编辑配置
const upsert = reactive({
	width: "700px",
	items: [
		{
			prop: "content",
			label: "题目内容",
			component: {
				name: "el-input",
				props: {
					type: "textarea",
					rows: 4,
					maxlength: 500,
					"show-word-limit": true
				}
			},
			required: true
		},
		{
			prop: "type",
			label: "题目类型",
			value: 1,
			component: {
				name: "el-select",
				options: [
					{
						label: "单选题",
						value: 1
					},
					{
						label: "多选题",
						value: 2
					},
					{
						label: "判断题",
						value: 3
					},
					{
						label: "简答题",
						value: 4
					}
				]
			},
			required: true,
			change: (value: number, { form }: any) => {
				// 如果是判断题，自动设置选项
				if (value === 3 && (!form.options || form.options.length === 0)) {
					form.options = ["正确", "错误"];
				}
			}
		},
		{
			prop: "score",
			label: "分值",
			value: 5,
			component: {
				name: "el-input-number",
				props: {
					min: 1,
					max: 100
				}
			},
			required: true
		},
		{
			prop: "level",
			label: "难度等级",
			value: 1,
			component: {
				name: "el-select",
				options: [
					{
						label: "简单",
						value: 1
					},
					{
						label: "中等",
						value: 2
					},
					{
						label: "困难",
						value: 3
					}
				]
			},
			required: true
		},
		{
			prop: "options",
			label: "选项列表",
			component: {
				name: "cl-dynamic-form",
				props: {
					max: 10,
					form: {
						items: [
							{
								prop: "value",
								label: "选项",
								component: "el-input"
							}
						]
					}
				},
				clone: (item: any) => {
					return item.map((e: any) => e.value);
				},
				parse: (data: any[]) => {
					return data.map((e: string) => {
						return {
							value: e
						};
					});
				}
			},
			ifShow: ({ form }: any) => {
				return [1, 2, 3].includes(form.type);
			}
		},
		{
			prop: "answers",
			label: "正确答案",
			component: {
				name: "el-select",
				props: ({ form }: any) => {
					return {
						multiple: form.type === 2,
						filterable: true,
						allowCreate: true,
						options: (form.options || []).map((e: string, i: number) => {
							return {
								label: e,
								value: e
							};
						})
					};
				}
			},
			ifShow: ({ form }: any) => {
				return [1, 2, 3].includes(form.type);
			},
			required: ({ form }: any) => {
				return [1, 2, 3].includes(form.type);
			}
		},
		{
			prop: "answers",
			label: "参考答案",
			component: {
				name: "el-input",
				props: {
					type: "textarea",
					rows: 4
				}
			},
			ifShow: ({ form }: any) => {
				return form.type === 4;
			},
			clone: (data: any) => {
				if (Array.isArray(data)) {
					return data.join("\n");
				}
				return data;
			},
			parse: (data: string) => {
				if (data && !Array.isArray(data)) {
					return [data];
				}
				return data;
			}
		},
		{
			prop: "analysis",
			label: "解析",
			component: {
				name: "el-input",
				props: {
					type: "textarea",
					rows: 3
				}
			}
		},
		{
			prop: "tags",
			label: "标签",
			component: {
				name: "el-select",
				props: {
					multiple: true,
					filterable: true,
					allowCreate: true
				}
			}
		}
	]
});

// 获取页面数据
function onRefresh(params: any) {
	return service.exam.question.page(params);
}

// 添加示例题目
async function addSampleQuestions() {
	try {
		// 确认提示
		await ElMessageBox.confirm("将添加10道工程实训和虚拟实训的示例题目，是否确认？", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning"
		});

		const engineeringQuestions = [
			{
				id: Date.now() + 1,
				content: "在软件工程中，需求分析阶段的主要任务是什么？",
				type: 1,
				score: 5,
				level: 2,
				options: ["编写代码", "确定软件需要实现的功能", "进行系统测试", "部署软件"],
				answers: ["确定软件需要实现的功能"],
				analysis: "需求分析是软件工程的第一步，主要任务是明确用户需求，确定软件需要实现的功能。",
				tags: ["软件工程", "需求分析"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 2,
				content: "Git版本控制系统中，以下哪些命令用于将本地更改提交到远程仓库？",
				type: 2,
				score: 8,
				level: 2,
				options: ["git pull", "git push", "git commit", "git fetch", "git merge"],
				answers: ["git commit", "git push"],
				analysis: "git commit用于将更改提交到本地仓库，git push用于将本地更改推送到远程仓库。",
				tags: ["Git", "版本控制"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 3,
				content: "在软件测试中，单元测试主要关注的是程序的最小可测试单元。",
				type: 3,
				score: 3,
				level: 1,
				options: ["正确", "错误"],
				answers: ["正确"],
				analysis: "单元测试是对软件中的最小可测试单元进行检查和验证的过程，通常是函数或方法。",
				tags: ["软件测试", "单元测试"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 4,
				content: "请简述敏捷开发方法与传统瀑布模型的主要区别。",
				type: 4,
				score: 10,
				level: 3,
				answers: ["敏捷开发强调迭代、增量式开发，强调团队协作和快速响应变化，而瀑布模型是一种线性开发方法，按照固定的阶段顺序进行，不易应对需求变更。"],
				analysis: "敏捷开发和瀑布模型的主要区别在于开发流程、需求变更处理方式和交付周期等方面。",
				tags: ["软件工程", "开发方法"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 5,
				content: "在Java编程中，关于接口和抽象类的描述，以下哪项是正确的？",
				type: 1,
				score: 5,
				level: 2,
				options: ["接口可以包含实现代码，抽象类不能", "一个类可以实现多个接口，但只能继承一个抽象类", "抽象类中的方法必须是抽象的", "接口中不能定义变量"],
				answers: ["一个类可以实现多个接口，但只能继承一个抽象类"],
				analysis: "Java支持多接口实现，但只支持单继承，即一个类只能继承一个抽象类或具体类。",
				tags: ["Java", "面向对象"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			}
		];

		const virtualTrainingQuestions = [
			{
				id: Date.now() + 6,
				content: "在云计算环境下，IaaS（基础设施即服务）提供的主要资源是什么？",
				type: 1,
				score: 5,
				level: 2,
				options: ["操作系统", "应用程序", "计算资源和存储资源", "开发环境"],
				answers: ["计算资源和存储资源"],
				analysis: "IaaS主要提供虚拟化的计算资源、存储资源和网络资源等基础设施服务。",
				tags: ["云计算", "虚拟化"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 7,
				content: "以下哪些是容器化技术的优势？",
				type: 2,
				score: 8,
				level: 2,
				options: ["轻量级", "隔离性好", "可移植性强", "启动速度快", "资源占用少"],
				answers: ["轻量级", "可移植性强", "启动速度快", "资源占用少"],
				analysis: "容器化技术相比虚拟机具有轻量级、启动快速、资源占用少、可移植性强等优势。",
				tags: ["容器", "Docker"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 8,
				content: "网络安全中，HTTPS协议使用的是对称加密技术。",
				type: 3,
				score: 3,
				level: 1,
				options: ["正确", "错误"],
				answers: ["错误"],
				analysis: "HTTPS协议使用的是非对称加密和对称加密的组合，非对称加密用于密钥交换，对称加密用于数据传输。",
				tags: ["网络安全", "HTTPS"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 9,
				content: "请简述虚拟化技术在现代数据中心中的应用和优势。",
				type: 4,
				score: 10,
				level: 3,
				answers: ["虚拟化技术使数据中心能够更高效地利用硬件资源，提高资源利用率，实现灵活的资源分配和管理，降低能耗和成本，同时提高系统可用性和灾难恢复能力。"],
				analysis: "虚拟化是现代数据中心的核心技术，促进了云计算的发展，解决了资源利用率低下和管理复杂等问题。",
				tags: ["虚拟化", "数据中心"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			},
			{
				id: Date.now() + 10,
				content: "在大数据处理中，Hadoop的核心组件包括哪些？",
				type: 2,
				score: 6,
				level: 2,
				options: ["HDFS", "MapReduce", "YARN", "HBase", "Spark"],
				answers: ["HDFS", "MapReduce", "YARN"],
				analysis: "Hadoop的三个核心组件是HDFS（分布式文件系统）、MapReduce（分布式计算框架）和YARN（资源管理系统）。",
				tags: ["大数据", "Hadoop"],
				createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
			}
		];

		// 组合所有示例题目
		const allQuestions = [...engineeringQuestions, ...virtualTrainingQuestions];
		
		// 直接模拟数据
		const mockData = {
			list: allQuestions,
			pagination: {
				total: allQuestions.length,
				page: 1,
				size: 20
			}
		};
		
		// 存储到本地缓存
		try {
			// 获取现有数据（如果有）
			let existingData = localStorage.getItem('examQuestions');
			let questionsData = existingData ? JSON.parse(existingData) : { list: [], pagination: { total: 0, page: 1, size: 20 } };
			
			// 合并数据
			questionsData.list = [...questionsData.list, ...allQuestions];
			questionsData.pagination.total = questionsData.list.length;
			
			// 保存回本地缓存
			localStorage.setItem('examQuestions', JSON.stringify(questionsData));
			
			// 成功提示
			ElMessage.success(`已添加10道示例题目`);
		} catch (e) {
			console.error("保存数据到本地缓存失败", e);
		}
		
		// 刷新页面显示（使用模拟数据）
		if (Crud.value) {
			// 先设置一个拦截器来覆盖service调用
			const originalService = service.exam.question.page;
			service.exam.question.page = async (params) => {
				let storedData = localStorage.getItem('examQuestions');
				if (storedData) {
					try {
						const data = JSON.parse(storedData);
						// 简单过滤
						if (params.content) {
							data.list = data.list.filter(q => q.content.includes(params.content));
						}
						if (params.type !== undefined) {
							data.list = data.list.filter(q => q.type === params.type);
						}
						if (params.level !== undefined) {
							data.list = data.list.filter(q => q.level === params.level);
						}
						return data;
					} catch (e) {
						console.error("解析缓存数据失败", e);
					}
				}
				return mockData;
			};
			
			// 刷新显示
			Crud.value.refresh();
			
			// 恢复原有方法
			setTimeout(() => {
				service.exam.question.page = originalService;
			}, 100);
		}
	} catch (err) {
		if (err !== "cancel") {
			ElMessage.error("添加示例题目失败");
			console.error(err);
		}
	}
}
</script>

<style lang="scss" scoped>
.mb20 {
	margin-bottom: 20px;
}

.ml10 {
	margin-left: 10px;
}

:deep(.cl-filter) {
	.el-select {
		width: 100%;
	}
}

:deep(.cl-dynamic-form__inline) {
	width: 99%;
}

:deep(.el-form-item) {
	margin-bottom: 18px;
}

:deep(.el-form-item__label) {
	font-weight: 500;
}

:deep(.el-upload) {
	width: 100%;
	
	.el-upload-dragger {
		width: 100%;
	}
}

:deep(.el-dialog__body) {
	padding: 20px;
}
</style> 