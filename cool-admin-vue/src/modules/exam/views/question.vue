<template>
	<cl-crud @load="onLoad">
		<cl-row>
			<!-- 基础按钮 -->
			<cl-refresh-btn @click="refresh" />
			<cl-add-btn @click="add" />
			<cl-multi-delete-btn @click="deleteMulti" />
			
			<!-- 批量导入按钮 -->
			<el-button type="primary" @click="openImport">
				<el-icon><Upload /></el-icon>
				批量导入
			</el-button>
			
			<!-- 示例题目按钮 -->
			<el-button type="success" @click="addSampleQuestions">
				<el-icon><Plus /></el-icon>
				添加示例题目
			</el-button>
			
			<cl-flex1 />
			
			<!-- 搜索栏 -->
			<cl-search-key placeholder="输入题目内容搜索" />
		</cl-row>
		
		<cl-row>
			<!-- 表格组件 -->
			<cl-table ref="Table" @selection-change="selectionChange">
				<!-- 类型格式化 -->
				<template #column-type="{ scope }">
					<el-tag v-if="scope.row.type === 1" type="success">单选题</el-tag>
					<el-tag v-else-if="scope.row.type === 2" type="warning">多选题</el-tag>
					<el-tag v-else-if="scope.row.type === 3" type="info">判断题</el-tag>
					<el-tag v-else-if="scope.row.type === 4" type="danger">简答题</el-tag>
					<span v-else>未知类型</span>
				</template>
				
				<!-- 难度格式化 -->
				<template #column-level="{ scope }">
					<el-tag v-if="scope.row.level === 1" type="success">简单</el-tag>
					<el-tag v-else-if="scope.row.level === 2" type="warning">中等</el-tag>
					<el-tag v-else-if="scope.row.level === 3" type="danger">困难</el-tag>
					<span v-else>未知难度</span>
				</template>
			</cl-table>
		</cl-row>
		
		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
		
		<!-- 新增/编辑表单 -->
		<cl-upsert ref="Upsert" />
		
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
						<el-link type="primary" :underline="true" href="/admin/exam/question/template" download>下载模板</el-link>
					</div>
				</template>
			</el-upload>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCool } from "/@/cool";
import { useUserStore } from "/@/modules/base/store/user";
import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { Upload, UploadFilled, Plus } from "@element-plus/icons-vue";

// 获取服务和用户信息
const { service } = useCool();
const userStore = useUserStore();
const token = userStore.token;

// 导入对话框
const importVisible = ref(false);

// 选中的行
const selection = ref([]);

// CRUD实例
let crud = null;

// 初始化表格
const Table = useTable({
	columns: [
		{
			type: "selection",
			width: 60
		},
		{
			label: "题目内容",
			prop: "content",
			minWidth: 180,
			showOverflowTooltip: true
		},
		{
			label: "题目类型",
			prop: "type",
			minWidth: 100
		},
		{
			label: "分值",
			prop: "score",
			minWidth: 80
		},
		{
			label: "难度等级",
			prop: "level",
			minWidth: 100
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

// 初始化表单
const Upsert = useUpsert({
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
						options: (form.options || []).map((e: string) => {
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

// CRUD初始化加载事件
function onLoad({ ctx, app }: any) {
	console.log("CRUD组件已加载", ctx, app);
	crud = app;
	app.refresh();
}

// 选择变更事件
function selectionChange(val: any) {
	selection.value = val;
}

// 刷新列表
function refresh() {
	console.log("刷新按钮被点击");
	if (crud) {
		crud.refresh();
	}
}

// 新增
function add() {
	console.log("新增按钮被点击");
	if (crud) {
		crud.rowAdd();
	}
}

// 批量删除
function deleteMulti() {
	console.log("批量删除按钮被点击", selection.value);
	if (crud && selection.value.length > 0) {
		crud.rowDelete(...selection.value);
	}
}

// 打开导入对话框
function openImport() {
	console.log("打开导入对话框");
	importVisible.value = true;
}

// 导入成功回调
function handleImportSuccess(res: any) {
	if (res.code === 1000) {
		ElMessage.success(`导入成功，成功导入${res.data}条题目`);
		importVisible.value = false;
		if (crud) {
			crud.refresh();
		}
	} else {
		ElMessage.error(res.message || "导入失败");
	}
}

// 导入失败回调
function handleImportError() {
	ElMessage.error("导入失败，请检查文件格式");
}

// 添加示例题目
async function addSampleQuestions() {
	console.log("添加示例题目方法被调用");
	try {
		// 确认提示
		await ElMessageBox.confirm("将添加10道工程实训和虚拟实训的示例题目，是否确认？", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning"
		});

		const engineeringQuestions = [
			{
				content: "在软件工程中，需求分析阶段的主要任务是什么？",
				type: 1,
				score: 5,
				level: 2,
				options: ["编写代码", "确定软件需要实现的功能", "进行系统测试", "部署软件"],
				answers: ["确定软件需要实现的功能"],
				analysis: "需求分析是软件工程的第一步，主要任务是明确用户需求，确定软件需要实现的功能。",
				tags: ["软件工程", "需求分析"]
			},
			{
				content: "Git版本控制系统中，以下哪些命令用于将本地更改提交到远程仓库？",
				type: 2,
				score: 8,
				level: 2,
				options: ["git pull", "git push", "git commit", "git fetch", "git merge"],
				answers: ["git commit", "git push"],
				analysis: "git commit用于将更改提交到本地仓库，git push用于将本地更改推送到远程仓库。",
				tags: ["Git", "版本控制"]
			},
			{
				content: "在软件测试中，单元测试主要关注的是程序的最小可测试单元。",
				type: 3,
				score: 3,
				level: 1,
				options: ["正确", "错误"],
				answers: ["正确"],
				analysis: "单元测试是对软件中的最小可测试单元进行检查和验证的过程，通常是函数或方法。",
				tags: ["软件测试", "单元测试"]
			},
			{
				content: "请简述敏捷开发方法与传统瀑布模型的主要区别。",
				type: 4,
				score: 10,
				level: 3,
				answers: ["敏捷开发强调迭代、增量式开发，强调团队协作和快速响应变化，而瀑布模型是一种线性开发方法，按照固定的阶段顺序进行，不易应对需求变更。"],
				analysis: "敏捷开发和瀑布模型的主要区别在于开发流程、需求变更处理方式和交付周期等方面。",
				tags: ["软件工程", "开发方法"]
			},
			{
				content: "在Java编程中，关于接口和抽象类的描述，以下哪项是正确的？",
				type: 1,
				score: 5,
				level: 2,
				options: ["接口可以包含实现代码，抽象类不能", "一个类可以实现多个接口，但只能继承一个抽象类", "抽象类中的方法必须是抽象的", "接口中不能定义变量"],
				answers: ["一个类可以实现多个接口，但只能继承一个抽象类"],
				analysis: "Java支持多接口实现，但只支持单继承，即一个类只能继承一个抽象类或具体类。",
				tags: ["Java", "面向对象"]
			}
		];

		const virtualTrainingQuestions = [
			{
				content: "在云计算环境下，IaaS（基础设施即服务）提供的主要资源是什么？",
				type: 1,
				score: 5,
				level: 2,
				options: ["操作系统", "应用程序", "计算资源和存储资源", "开发环境"],
				answers: ["计算资源和存储资源"],
				analysis: "IaaS主要提供虚拟化的计算资源、存储资源和网络资源等基础设施服务。",
				tags: ["云计算", "虚拟化"]
			},
			{
				content: "以下哪些是容器化技术的优势？",
				type: 2,
				score: 8,
				level: 2,
				options: ["轻量级", "隔离性好", "可移植性强", "启动速度快", "资源占用少"],
				answers: ["轻量级", "可移植性强", "启动速度快", "资源占用少"],
				analysis: "容器化技术相比虚拟机具有轻量级、启动快速、资源占用少、可移植性强等优势。",
				tags: ["容器", "Docker"]
			},
			{
				content: "网络安全中，HTTPS协议使用的是对称加密技术。",
				type: 3,
				score: 3,
				level: 1,
				options: ["正确", "错误"],
				answers: ["错误"],
				analysis: "HTTPS协议使用的是非对称加密和对称加密的组合，非对称加密用于密钥交换，对称加密用于数据传输。",
				tags: ["网络安全", "HTTPS"]
			},
			{
				content: "请简述虚拟化技术在现代数据中心中的应用和优势。",
				type: 4,
				score: 10,
				level: 3,
				answers: ["虚拟化技术使数据中心能够更高效地利用硬件资源，提高资源利用率，实现灵活的资源分配和管理，降低能耗和成本，同时提高系统可用性和灾难恢复能力。"],
				analysis: "虚拟化是现代数据中心的核心技术，促进了云计算的发展，解决了资源利用率低下和管理复杂等问题。",
				tags: ["虚拟化", "数据中心"]
			},
			{
				content: "在大数据处理中，Hadoop的核心组件包括哪些？",
				type: 2,
				score: 6,
				level: 2,
				options: ["HDFS", "MapReduce", "YARN", "HBase", "Spark"],
				answers: ["HDFS", "MapReduce", "YARN"],
				analysis: "Hadoop的三个核心组件是HDFS（分布式文件系统）、MapReduce（分布式计算框架）和YARN（资源管理系统）。",
				tags: ["大数据", "Hadoop"]
			}
		];
		
		// 组合所有示例题目
		const allQuestions = [...engineeringQuestions, ...virtualTrainingQuestions];
		
		// 批量保存到后端
		let successCount = 0;
		let failCount = 0;
		
		for (const question of allQuestions) {
			try {
				await service.exam.question.add(question);
				successCount++;
			} catch (e) {
				console.error("添加题目失败", e);
				failCount++;
			}
		}
		
		// 刷新列表
		if (crud) {
			crud.refresh();
		}
		
		// 成功提示
		if (successCount > 0) {
			ElMessage.success(`已添加${successCount}道示例题目` + (failCount > 0 ? `，${failCount}道添加失败` : ''));
		} else {
			ElMessage.error("添加示例题目失败");
		}
	} catch (err) {
		// 用户取消或出错
		console.log("用户取消添加示例题目", err);
	}
}
</script>

<style lang="scss" scoped>
:deep(.cl-crud) {
  padding: 10px;
}

:deep(.el-tag) {
  margin-right: 6px;
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