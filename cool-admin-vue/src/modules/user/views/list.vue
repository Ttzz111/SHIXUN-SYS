<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 批量导入按钮 -->
			<el-button type="primary" @click="openImportDialog">
				<el-icon><upload-filled /></el-icon>
				{{ t('批量导入') }}
			</el-button>
			<!-- 删除按钮 -->
			<cl-multi-delete-btn />
			<cl-flex1 />

			<!-- 搜索 -->
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<!-- 分页控件 -->
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />

		<!-- 批量导入对话框 -->
		<el-dialog v-model="importDialogVisible" :title="t('批量导入用户')" width="500px">
			<el-upload
				class="upload-demo"
				drag
				:action="uploadUrl"
				:headers="uploadHeaders"
				:before-upload="beforeUpload"
				:on-success="handleSuccess"
				:on-error="handleError"
				accept=".xlsx, .xls"
			>
				<el-icon class="el-icon--upload">
					<upload-filled />
				</el-icon>
				<div class="el-upload__text">
					{{ t('拖拽文件到此处或') }} <em>{{ t('点击上传') }}</em>
				</div>
				<template #tip>
					<div class="el-upload__tip">
						{{ t('请上传Excel文件，仅支持.xlsx、.xls格式') }}
					</div>
				</template>
			</el-upload>

			<template #footer>
				<span class="dialog-footer">
					<el-button @click="importDialogVisible = false">{{ t('取消') }}</el-button>
					<el-button type="primary" @click="downloadTemplate">
						{{ t('下载模板') }}
					</el-button>
				</span>
			</template>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'user-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useI18n } from 'vue-i18n';
import { useCool } from '/@/cool';
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';

const { t } = useI18n();
const { service, router, mitt } = useCool();

// 导入对话框
const importDialogVisible = ref(false);
const uploadUrl = `${service.baseUrl}/admin/user/info/importUsers`;
const uploadHeaders = {
	Authorization: localStorage.getItem('token') || '',
};

// 打开导入对话框
function openImportDialog() {
	importDialogVisible.value = true;
}

// 上传前验证
function beforeUpload(file) {
	const isExcel = 
		file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
		file.type === 'application/vnd.ms-excel';
	
	if (!isExcel) {
		ElMessage.error(t('请上传Excel文件!'));
		return false;
	}
	
	return true;
}

// 上传成功处理
function handleSuccess(res) {
	if (res.code === 1000) {
		ElMessage.success(t('导入成功!'));
		importDialogVisible.value = false;
		// 刷新表格数据
		Table.value?.refresh();
	} else {
		ElMessage.error(res.message || t('导入失败!'));
	}
}

// 上传失败处理
function handleError() {
	ElMessage.error(t('上传失败，请稍后重试!'));
}

// 下载模板
function downloadTemplate() {
	// 创建下载链接并点击
	const downloadUrl = `${service.baseUrl}/admin/user/info/downloadTemplate`;
	const link = document.createElement('a');
	link.href = downloadUrl;
	link.setAttribute('download', 'user_import_template.xls');
	
	// 添加认证信息
	fetch(downloadUrl, {
		headers: {
			Authorization: localStorage.getItem('token') || ''
		}
	})
	.then(response => response.blob())
	.then(blob => {
		const url = window.URL.createObjectURL(blob);
		link.href = url;
		document.body.appendChild(link);
		link.click();
		// 清理
		window.URL.revokeObjectURL(url);
		document.body.removeChild(link);
	})
	.catch(() => {
		ElMessage.error(t('模板下载失败!'));
	});
}

const options = reactive({
	gender: [
		{
			label: t('未知'),
			value: 0,
			type: 'info'
		},
		{
			label: t('男'),
			value: 1,
			type: 'success'
		},
		{
			label: t('女'),
			value: 2,
			type: 'danger'
		}
	],
	status: [
		{
			label: t('禁用'),
			value: 0,
			type: 'danger'
		},
		{
			label: t('正常'),
			value: 1,
			type: 'success'
		},
		{
			label: t('已注销'),
			value: 2,
			type: 'warning'
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{
			type: 'selection',
			width: 60
		},
		{
			label: t('昵称'),
			prop: 'nickName',
			minWidth: 150
		},
		{
			label: t('头像'),
			prop: 'avatarUrl',
			minWidth: 100,
			component: {
				name: 'cl-avatar'
			}
		},
		{
			label: t('手机号'),
			prop: 'phone',
			minWidth: 120
		},
		{
			label: t('性别'),
			prop: 'gender',
			dict: options.gender,
			minWidth: 120
		},
		{
			label: t('状态'),
			prop: 'status',
			minWidth: 120,
			dict: options.status
		},
		{
			label: t('创建时间'),
			prop: 'createTime',
			sortable: 'desc',
			minWidth: 170
		},
		{
			type: 'op'
		}
	]
});

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			prop: 'avatarUrl',
			label: t('头像'),
			component: { name: 'cl-upload' }
		},
		{
			prop: 'nickName',
			label: t('昵称'),
			component: { name: 'el-input' },
			required: true
		},
		{
			prop: 'phone',
			label: t('手机号'),
			component: {
				name: 'el-input',
				props: {
					maxlength: 11
				}
			}
		},
		{
			prop: 'gender',
			label: t('性别'),
			value: 1,
			component: {
				name: 'el-radio-group',
				options: options.gender
			}
		},
		{
			prop: 'status',
			label: t('状态'),
			value: 1,
			component: {
				name: 'el-radio-group',
				options: options.status
			}
		}
	]
});

// cl-search
const Search = useSearch();

// cl-crud
const Crud = useCrud(
	{
		service: service.user.info
	},
	app => {
		app.refresh();
	}
);
</script>
