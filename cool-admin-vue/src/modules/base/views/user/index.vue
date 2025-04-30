<template>
	<cl-view-group ref="ViewGroup">
		<template #left>
			<!-- 部门列表 -->
			<dept-list @refresh="refresh" @user-add="onUserAdd" />
		</template>

		<template #right>
			<cl-crud ref="Crud">
				<cl-row>
					<!-- 刷新按钮 -->
					<cl-refresh-btn />
					<!-- 新增按钮 -->
					<cl-add-btn />
					<!-- 批量删除按钮 -->
					<cl-multi-delete-btn />
					<!-- 批量导入按钮 -->
					<el-button
						v-permission="service.base.sys.user.permission.add"
						type="primary"
						@click="openImportDialog"
					>
						<el-icon><upload-filled /></el-icon>
						{{ $t('批量导入') }}
					</el-button>
					<!-- 用户转移 -->
					<el-button
						v-permission="service.base.sys.user.permission.move"
						type="success"
						:disabled="Table?.selection.length == 0"
						@click="toMove()"
					>
						{{ $t('转移') }}
					</el-button>
					<cl-flex1 />
					<cl-search-key :placeholder="$t('搜索用户名、姓名')" />
				</cl-row>

				<cl-row>
					<cl-table ref="Table">
						<!-- 单个转移 -->
						<template #slot-btn="{ scope }">
							<el-button
								v-permission="service.base.sys.user.permission.move"
								text
								@click="toMove(scope.row)"
							>
								{{ $t('转移') }}
							</el-button>
						</template>
					</cl-table>
				</cl-row>

				<cl-row>
					<cl-flex1 />
					<cl-pagination />
				</cl-row>

				<!-- 新增、编辑 -->
				<cl-upsert ref="Upsert" />

				<!-- 移动 -->
				<user-move :ref="setRefs('userMove')" />
				
				<!-- 批量导入对话框 -->
				<el-dialog v-model="importDialogVisible" :title="t('批量导入用户')" width="500px">
					<el-upload
						class="upload-demo"
						drag
						:action="uploadUrl"
						:headers="{ Authorization: user.token }"
						:before-upload="beforeUpload"
						:on-success="handleImportSuccess"
						:on-error="handleImportError"
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
					
					<div class="import-instruction">
						<p>{{ t('Excel表格必须包含以下列：') }}</p>
						<ul>
							<li>{{ t('用户名') }} <span class="required">*</span> {{ t('(必填)') }}</li>
							<li>{{ t('姓名') }} <span class="required">*</span> {{ t('(必填)') }}</li>
							<li>{{ t('昵称') }} <span class="required">*</span> {{ t('(必填)') }}</li>
							<li>{{ t('手机号码') }}</li>
							<li>{{ t('邮箱') }}</li>
							<li>{{ t('密码') }} {{ t('(默认123456)') }}</li>
							<li>{{ t('状态') }} {{ t('(0-禁用,1-启用，默认为1)') }}</li>
							<li>{{ t('备注') }}</li>
						</ul>
						<div class="tip">{{ t('提示：请先下载模板填写数据，然后上传。导入的用户默认分配到当前选中的部门。') }}</div>
					</div>

					<template #footer>
						<span class="dialog-footer">
							<el-button @click="importDialogVisible = false">{{ t('取消') }}</el-button>
							<el-button type="primary" @click="downloadImportTemplate">
								{{ t('下载模板') }}
							</el-button>
						</span>
					</template>
				</el-dialog>
			</cl-crud>
		</template>
	</cl-view-group>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'sys-user'
});

import { useTable, useUpsert, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import DeptList from './components/dept-list.vue';
import UserMove from './components/user-move.vue';
import { useViewGroup } from '/@/plugins/view';
import { useI18n } from 'vue-i18n';
import { Plugins } from '/#/crud';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { config } from '/@/config';
import { useBase } from '/$/base';

const { service, refs, setRefs } = useCool();
const { t } = useI18n();
const { user } = useBase();

// API基础URL
const apiBaseUrl = import.meta.env.VITE_API_URL || config.baseUrl || '';

// 导入对话框
const importDialogVisible = ref(false);

// 上传URL
const uploadUrl = computed(() => {
	return `${service.baseUrl}/admin/base/sys/user/importUsers?departmentId=${ViewGroup.value?.selected?.id || ''}`;
});

// 打开导入对话框
function openImportDialog() {
	// 检查是否选择了部门
	if (!ViewGroup.value?.selected?.id) {
		ElMessage.warning(t('请先选择一个部门!'));
		return;
	}
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
function handleImportSuccess(res) {
	if (res.code === 1000) {
		ElMessage.success(t('导入成功!'));
		importDialogVisible.value = false;
		// 刷新表格数据
		Crud.value?.refresh();
	} else {
		ElMessage.error(t(res.message) || t('导入失败!'));
	}
}

// 上传失败处理
function handleImportError(error) {
	console.error('上传失败:', error);
	ElMessage.error(t('上传失败，请稍后重试!'));
}

// 下载导入模板
function downloadImportTemplate() {
	const url = `${service.baseUrl}/admin/base/sys/user/downloadTemplate`;
	
	// 使用service层的内置下载方法（会自动处理token和错误）
	service.download(url, 'user_import_template.xls');
}

const { ViewGroup } = useViewGroup({
	title: t('用户列表')
});

// cl-crud
const Crud = useCrud({
	service: service.base.sys.user
});

// cl-table
const Table = useTable({
	columns: [
		{
			type: 'selection',
			width: 60
		},
		{
			prop: 'headImg',
			label: t('头像'),
			component: {
				name: 'cl-avatar',
				props: {
					size: 32
				}
			}
		},
		{
			prop: 'username',
			label: t('用户名'),
			minWidth: 150
		},
		{
			prop: 'name',
			label: t('姓名'),
			minWidth: 120
		},
		{
			prop: 'nickName',
			label: t('昵称'),
			minWidth: 120
		},
		{
			prop: 'departmentName',
			label: t('部门名称'),
			minWidth: 120
		},
		{
			prop: 'roleName',
			label: t('角色'),
			headerAlign: 'center',
			minWidth: 160,
			dict: [],
			formatter(row) {
				return row.roleName?.split(',');
			}
		},
		{
			prop: 'status',
			label: t('状态'),
			minWidth: 100,
			component: {
				name: 'cl-switch'
			}
		},
		{
			prop: 'phone',
			label: t('手机号码'),
			minWidth: 120
		},
		{
			prop: 'remark',
			label: t('备注'),
			minWidth: 200,
			showOverflowTooltip: true
		},
		{
			prop: 'createTime',
			label: t('创建时间'),
			sortable: 'desc',
			minWidth: 170
		},
		{
			type: 'op',
			buttons: ['slot-btn', 'edit', 'delete'],
			width: 270
		}
	]
});

// cl-upsert
const Upsert = useUpsert({
	dialog: {
		width: '800px'
	},

	items: [
		{
			prop: 'headImg',
			label: t('头像'),
			component: {
				name: 'cl-upload',
				props: {
					text: t('选择头像')
				}
			}
		},
		{
			prop: 'name',
			label: t('姓名'),
			span: 12,
			required: true,
			component: {
				name: 'el-input'
			}
		},
		{
			prop: 'nickName',
			label: t('昵称'),
			required: true,
			span: 12,
			component: {
				name: 'el-input'
			}
		},
		{
			prop: 'username',
			label: t('用户名'),
			required: true,
			span: 12,
			component: {
				name: 'el-input'
			}
		},
		() => {
			return {
				prop: 'password',
				label: t('密码'),
				span: 12,
				required: Upsert.value?.mode == 'add',
				component: {
					name: 'el-input',
					props: {
						type: 'password',
						showPassword: true,
						autocomplete: 'new-password'
					}
				},
				rules: [
					{
						min: 6,
						max: 16,
						message: t('密码长度在 6 到 16 个字符')
					}
				]
			};
		},
		{
			prop: 'roleIdList',
			label: t('角色'),
			value: [],
			required: true,
			component: {
				name: 'el-select',
				options: [],
				props: {
					multiple: true,
					'multiple-limit': 3
				}
			}
		},
		{
			prop: 'phone',
			label: t('手机号码'),
			span: 12,
			component: {
				name: 'el-input'
			}
		},
		{
			prop: 'email',
			label: t('邮箱'),
			span: 12,
			component: {
				name: 'el-input'
			}
		},
		{
			prop: 'remark',
			label: t('备注'),
			component: {
				name: 'el-input',
				props: {
					type: 'textarea',
					rows: 4
				}
			}
		},
		{
			prop: 'status',
			label: t('状态'),
			value: 1,
			component: {
				name: 'el-radio-group',
				options: [
					{
						label: t('启用'),
						value: 1
					},
					{
						label: t('禁用'),
						value: 0
					}
				]
			}
		}
	],

	onSubmit(data, { next }) {
		next({
			departmentId: ViewGroup.value?.selected?.id,
			...data
		});
	},

	async onOpen() {
		// 设置权限列表
		service.base.sys.role.list().then(res => {
			Upsert.value?.setOptions(
				'roleIdList',
				res.map(e => {
					return {
						label: e.name || '',
						value: e.id
					};
				})
			);
		});
	},

	plugins: [Plugins.Form.setFocus('name')]
});

// 刷新列表
function refresh(params?: any) {
	Crud.value?.refresh(params);
}

// 新增成员
function onUserAdd({ id }: Eps.BaseSysDepartmentEntity) {
	Crud.value?.rowAppend({
		departmentId: id
	});
}

// 移动成员
async function toMove(item?: Eps.BaseSysDepartmentEntity) {
	let ids: number[] = [];

	if (item) {
		ids = [item.id!];
	} else {
		ids = Table.value?.selection.map(e => e.id) || [];
	}

	refs.userMove.open(ids);
}
</script>

<style lang="scss" scoped>
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
	
	.el-button {
		margin-left: 10px;
	}
}

.import-instruction {
	margin-top: 20px;
	text-align: left;
	padding: 10px;
	background-color: var(--el-fill-color-light);
	border-radius: 4px;
	font-size: 14px;
	
	p {
		margin-bottom: 8px;
		font-weight: bold;
	}
	
	ul {
		margin: 0;
		padding-left: 20px;
		
		li {
			margin-bottom: 5px;
		}
	}
	
	.required {
		color: var(--el-color-danger);
		margin-right: 2px;
	}
	
	.tip {
		margin-top: 10px;
		color: var(--el-text-color-secondary);
		font-size: 13px;
		line-height: 1.4;
		padding: 8px;
		border-radius: 4px;
		background-color: var(--el-color-info-light);
	}
}

.upload-demo {
	.el-upload {
		width: 100%;
	}
	
	.el-upload-dragger {
		width: 100%;
	}
}
</style>

