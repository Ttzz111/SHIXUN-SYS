<template>
	<div class="resource-upload page-container">
		<!-- 蓝色横幅Banner -->
		<div class="banner-box">
			<h1>资源上传</h1>
			<p>上传的资源将经过教师审核后发布，支持文档、图片、视频等多种格式</p>
		</div>
		
		<!-- 操作栏 -->
		<cl-crud ref="Crud">
			<!-- 上传表单区域 -->
			<div class="content-box">
				<div class="section-title">资源上传</div>
				<el-card class="upload-card" shadow="never">
					<el-form 
						:model="resourceForm" 
						:rules="rules" 
						ref="formRef" 
						label-width="100px"
						class="resource-form"
					>
						<el-form-item label="资源名称" prop="name" required>
							<el-input v-model="resourceForm.name" placeholder="请输入资源名称"></el-input>
						</el-form-item>
						
						<el-form-item label="所属分类" prop="categoryId" required>
							<el-cascader
								v-model="resourceForm.categoryId"
								:options="categoryOptions"
								:props="{
									checkStrictly: true,
									label: 'name',
									value: 'id',
									emitPath: false
								}"
								placeholder="请选择资源分类"
								clearable
								style="width: 100%;"
							></el-cascader>
						</el-form-item>
						
						<el-form-item label="资源类型" prop="type" required>
							<el-select v-model="resourceForm.type" placeholder="请选择资源类型" style="width: 100%;">
								<el-option
									v-for="item in resourceTypes"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						
						<el-form-item label="资源描述" prop="description">
							<el-input 
								v-model="resourceForm.description" 
								type="textarea" 
								:rows="3" 
								placeholder="请输入资源描述"
							></el-input>
						</el-form-item>
						
						<el-form-item label="资源文件" prop="file" required>
							<el-upload
								class="upload-demo"
								drag
								action="#"
								:http-request="handleUpload"
								:auto-upload="false"
								:limit="1"
								:on-exceed="handleExceed"
								:on-change="handleFileChange"
								:file-list="fileList"
								:accept="getAcceptType(resourceForm.type)"
							>
								<el-icon class="el-icon--upload">
									<upload-filled />
								</el-icon>
								<div class="el-upload__text">
									将文件拖到此处，或<em>点击上传</em>
								</div>
								<template #tip>
									<div class="el-upload__tip">
										提示：{{ getUploadTip(resourceForm.type) }}
									</div>
								</template>
							</el-upload>
						</el-form-item>
						
						<el-form-item>
							<el-button type="primary" @click="submitForm" :loading="submitting">提交资源</el-button>
							<el-button @click="resetForm">重置</el-button>
						</el-form-item>
					</el-form>
				</el-card>
			</div>
			
			<!-- 我的上传记录区域 -->
			<div class="content-box">
				<div class="section-title">我的上传记录</div>
				<el-card class="my-resources-card" shadow="never">
					<div class="card-header">
						<div class="header-left">
							<el-icon><document /></el-icon>
							<span>我的上传记录</span>
						</div>
						<div class="header-right">
							<el-button type="primary" text @click="loadMyResources">
								<el-icon><refresh /></el-icon> 刷新
							</el-button>
						</div>
					</div>
					
					<div class="table-container">
						<el-table 
							:data="myResources" 
							v-loading="loading" 
							border 
							style="width: 100%"
							:max-height="480"
						>
							<el-table-column type="index" label="序号" width="60"></el-table-column>
							<el-table-column prop="name" label="资源名称" min-width="120">
								<template #default="scope">
									<div class="resource-name-cell">
										<el-icon><document /></el-icon>
										<span>{{ scope.row.name }}</span>
									</div>
								</template>
							</el-table-column>
							<el-table-column prop="type" label="资源类型" width="100">
								<template #default="scope">
									<div style="text-align:center;">{{ getResourceTypeName(scope.row.type) }}</div>
								</template>
							</el-table-column>
							<el-table-column prop="categoryName" label="所属分类" width="140"></el-table-column>
							<el-table-column prop="size" label="文件大小" width="100">
								<template #default="scope">
									{{ formatFileSize(scope.row.size) }}
								</template>
							</el-table-column>
							<el-table-column prop="createTime" label="上传时间" width="180"></el-table-column>
							<el-table-column prop="status" label="审核状态" width="100">
								<template #default="scope">
									<el-tag :type="getStatusType(scope.row.status)">
										{{ getStatusText(scope.row.status) }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column label="操作" width="180" fixed="right">
								<template #default="scope">
									<div class="operation-buttons">
										<el-button 
											type="primary" 
											size="small" 
											@click="previewResource(scope.row)"
										>
											预览
										</el-button>
										<el-button 
											type="danger" 
											size="small" 
											@click="deleteResource(scope.row)"
											v-if="scope.row.status === 'pending'"
										>
											删除
										</el-button>
									</div>
								</template>
							</el-table-column>
						</el-table>
						
						<div class="pagination-row">
							<div class="pagination-info">
								共 <span class="total-count">{{ total }}</span> 条，当前 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, total) }} 条
							</div>
							<el-pagination
								v-model:current-page="currentPage"
								v-model:page-size="pageSize"
								:page-sizes="[5, 10, 20, 50]"
								layout="sizes, prev, pager, next, jumper"
								:total="total"
								@size-change="handleSizeChange"
								@current-change="handleCurrentChange"
								background
							/>
						</div>
						
						<el-empty 
							description="暂无上传记录" 
							v-if="myResources.length === 0 && !loading"
							:image-size="120"
						></el-empty>
					</div>
				</el-card>
			</div>
		</cl-crud>
		
		<!-- 资源预览对话框 -->
		<el-dialog
			v-model="previewDialog.visible"
			:title="previewDialog.title"
			width="800px"
			destroy-on-close
			center
		>
			<div class="preview-container" v-loading="previewDialog.loading">
				<!-- 文档预览 -->
				<div v-if="previewDialog.data.type === 'document'" class="document-preview">
					<div v-if="previewDialog.url">
						<!-- PDF文件直接使用iframe预览 -->
						<iframe 
							v-if="getFileExtension(previewDialog.data.name) === 'pdf'"
							:src="previewDialog.url" 
							width="100%" 
							height="500"
						></iframe>
						<!-- 其他文档类型提供下载链接 -->
						<div v-else class="document-download">
							<el-icon :size="64" color="#409EFF"><document /></el-icon>
							<p>{{ previewDialog.data.name }}</p>
							<p class="file-info">{{ formatFileSize(previewDialog.data.size) }} | {{ getFileExtension(previewDialog.data.name).toUpperCase() }}</p>
							<el-button type="primary" @click="downloadFile(previewDialog.url, previewDialog.data.name)">
								<el-icon><download /></el-icon> 下载文件
							</el-button>
						</div>
					</div>
					<el-empty v-else description="无法加载此文档"></el-empty>
				</div>
				
				<!-- 图片预览 -->
				<div v-else-if="previewDialog.data.type === 'image'" class="image-preview">
					<el-image 
						:src="previewDialog.url" 
						fit="contain"
						:preview-src-list="[previewDialog.url]"
						style="width: 100%; max-height: 500px;"
					></el-image>
				</div>
				
				<!-- 视频预览 -->
				<div v-else-if="previewDialog.data.type === 'video'" class="video-preview">
					<video 
						controls 
						style="width: 100%; max-height: 500px;"
						:src="previewDialog.url"
					>
						您的浏览器不支持视频标签
					</video>
				</div>
				
				<!-- 其他类型 -->
				<div v-else class="other-preview">
					<div class="document-download">
						<el-icon :size="64" color="#909399"><folder /></el-icon>
						<p>{{ previewDialog.data.name }}</p>
						<p class="file-info">{{ formatFileSize(previewDialog.data.size) }}</p>
						<el-button type="primary" @click="downloadFile(previewDialog.url, previewDialog.data.name)">
							<el-icon><download /></el-icon> 下载文件
						</el-button>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { Search, Refresh, Document, UploadFilled, Download, Folder } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { 
	addResource, 
	getResources, 
	deleteResource as deleteResourceFromDB, 
	createResourceUrl, 
	updateResourceStatus 
} from '../utils/indexedDB';

// 获取用户信息
const { user } = useBase();
const { service } = useCool();

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 表单引用
const formRef = ref<FormInstance>();

// 文件列表
const fileList = ref<any[]>([]);

// 资源表单
const resourceForm = reactive({
	name: '',
	categoryId: null,
	type: 'document',
	description: '',
	file: null as File | null
});

// 资源类型配置
const resourceTypes = [
	{ label: '文档', value: 'document', tag: '' },
	{ label: '图片', value: 'image', tag: 'success' },
	{ label: '视频', value: 'video', tag: 'warning' },
];

// 预览对话框
const previewDialog = reactive({
	visible: false,
	title: '资源预览',
	data: {} as any,
	url: '',
	loading: false
});

// 分类选项
const categoryOptions = ref([
	{
		id: 1,
		name: '劳动基本技能',
		children: [
			{ id: 101, name: '工程训练IA' },
			{ id: 102, name: '工程训练II' },
			{ id: 103, name: '工程训练III' },
			{ id: 104, name: '工程训练IV' },
			{ id: 105, name: '工程认知训练' },
		]
	},
	{
		id: 2,
		name: '体验式劳动教育',
		children: [
			{ id: 201, name: '陶艺制作与体验' },
			{ id: 202, name: '激光加工创新训练' },
			{ id: 203, name: '精工细铸创新实践' },
		]
	},
	{
		id: 3,
		name: '虚拟实训体验',
		children: [
			{ id: 301, name: '虚拟仿真设备VR使用学习' },
		]
	},
]);

// 验证规则
const rules = {
	name: [
		{ required: true, message: '请输入资源名称', trigger: 'blur' },
		{ max: 50, message: '资源名称不能超过50个字符', trigger: 'blur' }
	],
	categoryId: [
		{ required: true, message: '请选择资源分类', trigger: 'change' }
	],
	type: [
		{ required: true, message: '请选择资源类型', trigger: 'change' }
	],
	file: [
		{ required: true, message: '请上传资源文件', trigger: 'change' }
	]
};

// 分页参数
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 我的资源列表
const myResources = ref<any[]>([]);

// 存储创建的URL，以便在组件销毁时释放
const createdUrls = ref<string[]>([]);

// 获取资源类型名称
function getResourceTypeName(type: string) {
	const resourceType = resourceTypes.find(item => item.value === type);
	return resourceType ? resourceType.label : '未知类型';
}

// 获取资源类型标签样式
function getResourceTypeTag(type: string) {
	const resourceType = resourceTypes.find(item => item.value === type);
	return resourceType ? resourceType.tag : '';
}

// 获取状态文本
function getStatusText(status: string) {
	const statusMap: Record<string, string> = {
		pending: '待审核',
		approved: '已通过',
		rejected: '已拒绝'
	};
	return statusMap[status] || '未知状态';
}

// 获取状态标签类型
function getStatusType(status: string) {
	const statusMap: Record<string, string> = {
		pending: 'warning',
		approved: 'success',
		rejected: 'danger'
	};
	return statusMap[status] || 'info';
}

// 格式化文件大小
function formatFileSize(size: number) {
	if (size < 1024) {
		return size + ' B';
	} else if (size < 1024 * 1024) {
		return (size / 1024).toFixed(2) + ' KB';
	} else if (size < 1024 * 1024 * 1024) {
		return (size / (1024 * 1024)).toFixed(2) + ' MB';
	} else {
		return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
	}
}

// 根据类型获取允许上传的文件类型
function getAcceptType(type: string) {
	switch (type) {
		case 'document':
			return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt';
		case 'image':
			return 'image/*';
		case 'video':
			return 'video/*';
		default:
			return '';
	}
}

// 获取上传提示
function getUploadTip(type: string) {
	switch (type) {
		case 'document':
			return '支持 PDF、Word、Excel、PPT 等文档格式，文件大小不超过50MB';
		case 'image':
			return '支持 JPG、PNG、GIF 等图片格式，文件大小不超过10MB';
		case 'video':
			return '支持 MP4、AVI、MOV 等视频格式，文件大小不超过500MB';
		default:
			return '请先选择资源类型';
	}
}

// 处理文件超出限制
function handleExceed() {
	ElMessage.warning('只能上传一个文件');
}

// 处理文件变更
function handleFileChange(file: any) {
	resourceForm.file = file.raw;
}

// 处理文件上传
function handleUpload(options: any) {
	// 实际项目中，这里应该调用后端API上传文件
	console.log('上传文件:', options.file);
	return Promise.resolve('模拟上传成功');
}

// 提交表单
async function submitForm() {
	if (!formRef.value) return;
	
	formRef.value.validate(async (valid) => {
		if (valid) {
			if (!resourceForm.file) {
				ElMessage.warning('请上传资源文件');
				return;
			}
			
			submitting.value = true;
			
			try {
				// 获取分类名称
				const categoryName = getCategoryName(resourceForm.categoryId);
				
				// 创建新资源对象
				const newResource = {
					name: resourceForm.name,
					type: resourceForm.type,
					categoryId: resourceForm.categoryId,
					categoryName,
					userId: user.info?.id || 'anonymous',
					author: user.info?.name || '当前用户',
					size: resourceForm.file.size,
					createTime: new Date().toLocaleString(),
					status: 'pending',
					description: resourceForm.description,
					viewCount: 0,
					downloadCount: 0
				};
				
				// 使用IndexedDB存储资源
				await addResource(newResource, resourceForm.file);
				
				// 更新页面数据
				await loadMyResources();
				
				// 提示用户
				ElMessage.success('资源提交成功，等待管理员审核');
				
				// 重置表单
				resetForm();
			} catch (error) {
				ElMessage.error('资源提交失败，请稍后重试');
				console.error('提交资源出错:', error);
			} finally {
				submitting.value = false;
			}
		} else {
			ElMessage.warning('请填写完整的资源信息');
		}
	});
}

// 获取分类名称
function getCategoryName(categoryId: number | null): string {
	if (!categoryId) return '';
	
	for (const category of categoryOptions.value) {
		const subcategory = category.children.find((item: any) => item.id === categoryId);
		if (subcategory) {
			return subcategory.name;
		}
	}
	
	return '';
}

// 重置表单
function resetForm() {
	if (formRef.value) {
		formRef.value.resetFields();
		fileList.value = [];
		resourceForm.file = null;
	}
}

// 加载我的资源列表
async function loadMyResources() {
	loading.value = true;
	
	try {
		// 从IndexedDB获取当前用户的资源
		const resources = await getResources({ userId: user.info?.id || 'anonymous' });
		
		// 计算总数
		total.value = resources.length;
		
		// 分页处理
		const start = (currentPage.value - 1) * pageSize.value;
		const end = start + pageSize.value;
		myResources.value = resources.slice(start, end);
		
		loading.value = false;
	} catch (error) {
		console.error('加载资源列表失败:', error);
		loading.value = false;
		ElMessage.error('加载资源列表失败');
	}
}

// 获取文件扩展名
function getFileExtension(filename: string): string {
	return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

// 下载文件
function downloadFile(url: string, filename: string) {
	if (!url) return;
	
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	
	ElMessage.success('下载开始');
}

// 预览资源
async function previewResource(row: any) {
	previewDialog.data = row;
	previewDialog.title = `预览: ${row.name}`;
	previewDialog.loading = true;
	previewDialog.visible = true;
	previewDialog.url = '';
	
	try {
		// 从IndexedDB获取文件并创建URL
		const url = await createResourceUrl(row.id);
		
		if (url) {
			previewDialog.url = url;
			createdUrls.value.push(url); // 保存URL以便后续释放
		} else {
			ElMessage.warning('无法预览此资源');
		}
	} catch (error) {
		console.error('预览资源失败:', error);
		ElMessage.error('预览资源失败');
	} finally {
		previewDialog.loading = false;
	}
}

// 删除资源
function deleteResource(row: any) {
	ElMessageBox.confirm(
		`确定要删除资源"${row.name}"吗？`,
		'删除确认',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(async () => {
		try {
			// 从IndexedDB中删除资源
			await deleteResourceFromDB(row.id);
			
			// 更新页面数据
			await loadMyResources();
			
			ElMessage.success('资源已删除');
		} catch (error) {
			console.error('删除资源失败:', error);
			ElMessage.error('删除资源失败');
		}
	}).catch(() => {});
}

// 处理页码变化
function handleCurrentChange(val: number) {
	currentPage.value = val;
	loadMyResources();
}

// 处理每页条数变化
function handleSizeChange(val: number) {
	pageSize.value = val;
	currentPage.value = 1;
	loadMyResources();
}

// 释放创建的URL
function releaseUrls() {
	createdUrls.value.forEach(url => {
		URL.revokeObjectURL(url);
	});
	createdUrls.value = [];
}

// 组件销毁前释放资源
onBeforeUnmount(() => {
	releaseUrls();
});

// 页面加载时获取数据
onMounted(() => {
	loadMyResources();
});
</script>

<style lang="scss" scoped>
.resource-upload {
	padding: 20px;
	height: 100%;
	overflow: auto;
	display: flex;
	flex-direction: column;
	background-color: #f5f7fa;
	
	.banner-box {
		background: linear-gradient(135deg, #1890ff, #096dd9);
		color: white;
		padding: 20px;
		border-radius: 12px;
		margin-bottom: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		
		h1 {
			margin: 0 0 10px 0;
			font-size: 24px;
		}
		
		p {
			margin: 0;
			opacity: 0.8;
		}
	}
	
	.content-box {
		margin-bottom: 20px;
		
		.section-title {
			font-size: 16px;
			font-weight: 600;
			margin-bottom: 15px;
			color: #303133;
		}
	}
	
	.upload-card {
		border-radius: 12px;
		
		:deep(.el-card__body) {
			padding: 20px;
		}
	}
	
	.my-resources-card {
		border-radius: 12px;
		
		:deep(.el-card__body) {
			padding: 0;
		}
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px 20px;
			border-bottom: 1px solid #ebeef5;
			background-color: #f9fafc;
			
			.header-left {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 16px;
				font-weight: 500;
				
				.el-icon {
					color: #409EFF;
				}
			}
		}
	}
	
	.table-container {
		padding: 20px;
		
		.el-table {
			border-radius: 8px;
			overflow: hidden;
		}
	}
	
	.resource-name-cell {
		display: flex;
		align-items: center;
		gap: 8px;
		
		.el-icon {
			color: #409EFF;
		}
	}
	
	.preview-container {
		min-height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.document-download {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 30px;
			text-align: center;
			
			p {
				margin: 10px 0 5px;
				font-size: 16px;
				font-weight: 500;
			}
			
			.file-info {
				color: #909399;
				font-size: 14px;
				margin-bottom: 15px;
			}
		}
		
		.video-preview {
			width: 100%;
			
			video {
				border-radius: 8px;
				background-color: #000;
			}
		}
	}
	
	.operation-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		
		.el-button {
			margin: 0;
			border-radius: 6px;
		}
	}
	
	.pagination-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;
		
		.pagination-info {
			color: #606266;
			font-size: 14px;
			
			.total-count {
				color: #409EFF;
				font-weight: bold;
			}
		}
	}
}

/* 全局表格样式优化 */
:deep(.el-table) {
	--el-table-header-bg-color: #f5f7fa;
	--el-table-row-hover-bg-color: #f5f7fa;
	
	.el-table__header th {
		background-color: var(--el-table-header-bg-color);
		color: #606266;
		font-weight: 600;
	}
	
	.el-tag {
		border-radius: 4px;
	}
}

/* 上传组件样式优化 */
:deep(.el-upload-dragger) {
	width: 100%;
	height: 180px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	border-radius: 8px;
	
	.el-icon--upload {
		margin-bottom: 10px;
		font-size: 48px;
		color: #c0c4cc;
	}
	
	.el-upload__text {
		color: #606266;
		
		em {
			color: #409EFF;
			font-style: normal;
		}
	}
}

:deep(.el-upload__tip) {
	color: #909399;
	font-size: 13px;
	margin-top: 10px;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
	border-radius: 8px;
	overflow: hidden;
	
	.el-dialog__header {
		background-color: #f5f7fa;
		border-bottom: 1px solid #ebeef5;
		padding: 15px 20px;
		margin-right: 0;
		
		.el-dialog__title {
			font-size: 16px;
			font-weight: 600;
		}
	}
	
	.el-dialog__body {
		padding: 20px;
	}
	
	.el-dialog__footer {
		border-top: 1px solid #ebeef5;
		padding: 15px 20px;
	}
}

/* 表单控件圆角优化 */
:deep(.el-input .el-input__inner),
:deep(.el-textarea .el-textarea__inner),
:deep(.el-select .el-input .el-input__inner),
:deep(.el-cascader .el-input .el-input__inner) {
	border-radius: 6px;
}

:deep(.el-button) {
	border-radius: 6px;
}

:deep(.el-card) {
	border: none;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>
