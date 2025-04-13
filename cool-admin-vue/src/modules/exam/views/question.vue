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
import { ElMessage } from "element-plus";
import { service } from "/@/cool";
import { useUserStore } from "/@/modules/base/store/user";
import { useCrud } from "@cool-vue/crud";
import { Upload, UploadFilled } from "@element-plus/icons-vue";

// 获取token
const userStore = useUserStore();
const token = userStore.token;

// 导入对话框
const importVisible = ref(false);

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