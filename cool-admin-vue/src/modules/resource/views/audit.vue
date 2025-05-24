<template>
	<div class="resource-audit page-container">
		<!-- 蓝色横幅Banner -->
		<div class="banner-box">
			<h1>资源审核</h1>
			<p>在这里可以对所有上传的资源进行审核、预览和管理，支持批量操作，提升审核效率！</p>
		</div>
		
		<!-- 操作栏 -->
		<cl-crud ref="Crud">
			<!-- 筛选条件区域 -->
			<div class="content-box">
				<div class="section-title">筛选条件</div>
				<el-card shadow="never" class="filter-card">
					<div class="filter-container">
						<!-- 搜索栏 -->
						<div class="search-box">
							<el-input
								v-model="search.keyword"
								placeholder="请输入资源名称关键词"
								clearable
								@keyup.enter="onSearch"
								class="search-input"
							>
								<template #prefix>
									<el-icon><search /></el-icon>
								</template>
							</el-input>
							
							<!-- 状态过滤 -->
							<el-select v-model="search.status" placeholder="审核状态" clearable @change="onSearch" class="status-select">
								<el-option label="待审核" value="pending"></el-option>
								<el-option label="已通过" value="approved"></el-option>
								<el-option label="已拒绝" value="rejected"></el-option>
							</el-select>
						</div>
						
						<!-- 操作按钮 -->
						<div class="action-buttons">
							<el-button type="primary" @click="onRefresh">
								<el-icon><refresh /></el-icon>
								刷新
							</el-button>
							<el-button 
								type="success" 
								@click="batchApprove" 
								:disabled="multipleSelection.length === 0"
							>
								<el-icon><check /></el-icon>
								批量通过<span v-if="multipleSelection.length > 0">({{ multipleSelection.length }})</span>
							</el-button>
							<el-button 
								type="danger" 
								@click="batchReject" 
								:disabled="multipleSelection.length === 0"
							>
								<el-icon><close /></el-icon>
								批量拒绝<span v-if="multipleSelection.length > 0">({{ multipleSelection.length }})</span>
							</el-button>
						</div>
					</div>
				</el-card>
			</div>

			<!-- 表格区域 -->
			<div class="content-box">
				<div class="section-title">资源列表</div>
				<el-card shadow="never" class="table-card">
					<el-table
						v-loading="loading"
						:data="list"
						border
						style="width: 100%"
						@selection-change="handleSelectionChange"
					>
						<el-table-column type="selection" width="50"></el-table-column>
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
								<el-tag :type="getResourceTypeTag(scope.row.type)">
									{{ getResourceTypeName(scope.row.type) }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="categoryName" label="所属分类" width="120"></el-table-column>
						<el-table-column prop="author" label="上传者" width="100"></el-table-column>
						<el-table-column prop="size" label="文件大小" width="100">
							<template #default="scope">
								{{ formatFileSize(scope.row.size) }}
							</template>
						</el-table-column>
						<el-table-column prop="createTime" label="上传时间" width="170"></el-table-column>
						<el-table-column prop="status" label="审核状态" width="100">
							<template #default="scope">
								<el-tag :type="getStatusType(scope.row.status)">
									{{ getStatusText(scope.row.status) }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="description" label="资源描述" min-width="180"></el-table-column>
						<el-table-column label="操作" width="280" fixed="right">
							<template #default="scope">
								<div class="operation-buttons">
									<template v-if="scope.row.status === 'pending'">
										<el-button 
											type="success" 
											size="small" 
											@click="approveResource(scope.row)"
										>
											通过
										</el-button>
										<el-button 
											type="danger" 
											size="small" 
											@click="rejectResource(scope.row)"
										>
											拒绝
										</el-button>
									</template>
									<el-button 
										type="primary" 
										size="small" 
										@click="previewResource(scope.row)"
									>
										预览
									</el-button>
									<el-button 
										type="info" 
										size="small" 
										@click="showDetail(scope.row)"
									>
										详情
									</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
					
					<!-- 分页 -->
					<div class="pagination-row">
						<div class="pagination-info">
							共 <span class="total-count">{{ page.total }}</span> 条，当前 {{ (page.currentPage - 1) * page.pageSize + 1 }}-{{ Math.min(page.currentPage * page.pageSize, page.total) }} 条
						</div>
						<el-pagination
							v-model:current-page="page.currentPage"
							v-model:page-size="page.pageSize"
							:page-sizes="[10, 20, 50, 100]"
							layout="sizes, prev, pager, next, jumper"
							:total="page.total"
							@size-change="handleSizeChange"
							@current-change="handleCurrentChange"
							background
						/>
					</div>
					
					<el-empty 
						description="暂无数据" 
						v-if="list.length === 0 && !loading"
						:image-size="120"
					></el-empty>
				</el-card>
			</div>
		</cl-crud>
		
		<!-- 资源详情对话框 -->
		<el-dialog
			v-model="detailDialog.visible"
			:title="detailDialog.title"
			width="600px"
			destroy-on-close
		>
			<el-descriptions :column="1" border>
				<el-descriptions-item label="资源名称">{{ detailDialog.data.name }}</el-descriptions-item>
				<el-descriptions-item label="资源类型">
					<el-tag :type="getResourceTypeTag(detailDialog.data.type)">
						{{ getResourceTypeName(detailDialog.data.type) }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="所属分类">{{ detailDialog.data.categoryName }}</el-descriptions-item>
				<el-descriptions-item label="上传者">{{ detailDialog.data.author }}</el-descriptions-item>
				<el-descriptions-item label="文件大小">{{ formatFileSize(detailDialog.data.size) }}</el-descriptions-item>
				<el-descriptions-item label="上传时间">{{ detailDialog.data.createTime }}</el-descriptions-item>
				<el-descriptions-item label="审核状态">
					<el-tag :type="getStatusType(detailDialog.data.status)">
						{{ getStatusText(detailDialog.data.status) }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="资源描述">{{ detailDialog.data.description }}</el-descriptions-item>
			</el-descriptions>
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="detailDialog.visible = false">关闭</el-button>
					<el-button type="primary" @click="previewResource(detailDialog.data)">预览资源</el-button>
				</span>
			</template>
		</el-dialog>
		
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
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="previewDialog.visible = false">关闭</el-button>
					<el-button 
						v-if="previewDialog.data.status === 'pending'" 
						type="success" 
						@click="approveResource(previewDialog.data); previewDialog.visible = false;"
					>
						通过审核
					</el-button>
					<el-button 
						v-if="previewDialog.data.status === 'pending'" 
						type="danger" 
						@click="rejectResource(previewDialog.data); previewDialog.visible = false;"
					>
						拒绝审核
					</el-button>
				</span>
			</template>
		</el-dialog>
		
		<!-- 拒绝原因对话框 -->
		<el-dialog
			v-model="rejectDialog.visible"
			title="拒绝原因"
			width="500px"
			destroy-on-close
		>
			<el-form :model="rejectDialog.form" label-width="80px">
				<el-form-item label="拒绝原因">
					<el-input 
						v-model="rejectDialog.form.reason" 
						type="textarea" 
						:rows="3" 
						placeholder="请输入拒绝原因"
					></el-input>
				</el-form-item>
			</el-form>
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="rejectDialog.visible = false">取消</el-button>
					<el-button type="primary" @click="confirmReject">确认</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue';
import { Search, Refresh, Check, Close, Document, Download, Folder } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { 
	getResources, 
	updateResourceStatus, 
	createResourceUrl 
} from '../utils/indexedDB';

// 获取用户信息
const { user } = useBase();

// 搜索条件
const search = reactive({
	keyword: '',
	status: ''
});

// 分页信息
const page = reactive({
	currentPage: 1,
	pageSize: 10,
	total: 0
});

// 加载状态
const loading = ref(false);

// 资源列表
const list = ref<any[]>([]);

// 多选数据
const multipleSelection = ref<any[]>([]);

// 详情对话框
const detailDialog = reactive({
	visible: false,
	title: '资源详情',
	data: {} as any
});

// 预览对话框
const previewDialog = reactive({
	visible: false,
	title: '资源预览',
	data: {} as any,
	url: '',
	loading: false
});

// 拒绝对话框
const rejectDialog = reactive({
	visible: false,
	currentResource: null as any,
	isBatch: false,
	form: {
		reason: ''
	}
});

// 存储创建的URL，以便在组件销毁时释放
const createdUrls = ref<string[]>([]);

// 资源类型配置
const resourceTypes = [
	{ label: '文档', value: 'document', tag: '' },
	{ label: '图片', value: 'image', tag: 'success' },
	{ label: '视频', value: 'video', tag: 'warning' },
];

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

// 搜索
function onSearch() {
	loadData();
}

// 刷新
function onRefresh() {
	search.keyword = '';
	search.status = '';
	page.currentPage = 1;
	loadData();
}

// 加载数据
async function loadData() {
	loading.value = true;
	
	try {
		// 从IndexedDB获取资源
		let resources = await getResources();
		
		// 根据关键词筛选
		if (search.keyword) {
			const keyword = search.keyword.toLowerCase();
			resources = resources.filter(item => 
				item.name.toLowerCase().includes(keyword) ||
				(item.description && item.description.toLowerCase().includes(keyword))
			);
		}
		
		// 根据状态筛选
		if (search.status) {
			resources = resources.filter(item => item.status === search.status);
		}
		
		// 按创建时间倒序排序
		resources.sort((a: any, b: any) => {
			return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
		});
		
		// 计算总数
		page.total = resources.length;
		
		// 分页处理
		const start = (page.currentPage - 1) * page.pageSize;
		const end = start + page.pageSize;
		list.value = resources.slice(start, end);
		
		// 重置多选状态
		multipleSelection.value = [];
	} catch (error) {
		console.error('加载资源列表失败:', error);
		ElMessage.error('加载资源列表失败');
	} finally {
		loading.value = false;
	}
}

// 处理选择变化
function handleSelectionChange(selection: any[]) {
	multipleSelection.value = selection;
}

// 显示详情
function showDetail(row: any) {
	detailDialog.data = row;
	detailDialog.title = `资源详情: ${row.name}`;
	detailDialog.visible = true;
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

// 批量审核通过
function batchApprove() {
	if (multipleSelection.value.length === 0) {
		ElMessage.warning('请选择要审核的资源');
		return;
	}
	
	ElMessageBox.confirm(
		`确定要通过所选的 ${multipleSelection.value.length} 个资源吗？`,
		'批量通过',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(async () => {
		try {
			// 更新状态
			for (const item of multipleSelection.value) {
				if (item.status === 'pending') {
					await updateResourceStatus(item.id, 'approved');
				}
			}
			
			ElMessage.success(`已批量通过 ${multipleSelection.value.length} 个资源`);
			loadData(); // 重新加载数据
		} catch (error) {
			console.error('批量审核失败:', error);
			ElMessage.error('批量审核失败');
		}
	}).catch(() => {});
}

// 批量审核拒绝
function batchReject() {
	if (multipleSelection.value.length === 0) {
		ElMessage.warning('请选择要审核的资源');
		return;
	}
	
	rejectDialog.isBatch = true;
	rejectDialog.form.reason = '';
	rejectDialog.visible = true;
}

// 确认拒绝
async function confirmReject() {
	if (!rejectDialog.form.reason.trim()) {
		ElMessage.warning('请输入拒绝原因');
		return;
	}
	
	try {
		if (rejectDialog.isBatch) {
			// 批量拒绝
			for (const item of multipleSelection.value) {
				if (item.status === 'pending') {
					await updateResourceStatus(item.id, 'rejected', rejectDialog.form.reason);
				}
			}
			
			ElMessage.success(`已批量拒绝 ${multipleSelection.value.length} 个资源`);
		} else if (rejectDialog.currentResource) {
			// 单个拒绝
			await updateResourceStatus(rejectDialog.currentResource.id, 'rejected', rejectDialog.form.reason);
			ElMessage.success('已拒绝该资源');
		}
		
		loadData(); // 重新加载数据
		rejectDialog.visible = false;
	} catch (error) {
		console.error('审核拒绝失败:', error);
		ElMessage.error('审核拒绝失败');
	}
}

// 通过资源
function approveResource(row: any) {
	ElMessageBox.confirm(
		`确定要通过资源"${row.name}"吗？`,
		'审核通过',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'success'
		}
	).then(async () => {
		try {
			// 更新状态
			await updateResourceStatus(row.id, 'approved');
			ElMessage.success('审核已通过');
			loadData(); // 重新加载数据
		} catch (error) {
			console.error('审核通过失败:', error);
			ElMessage.error('审核通过失败');
		}
	}).catch(() => {});
}

// 拒绝资源
function rejectResource(row: any) {
	rejectDialog.currentResource = row;
	rejectDialog.isBatch = false;
	rejectDialog.form.reason = '';
	rejectDialog.visible = true;
}

// 处理页码变化
function handleCurrentChange(val: number) {
	page.currentPage = val;
	loadData();
}

// 处理每页条数变化
function handleSizeChange(val: number) {
	page.pageSize = val;
	page.currentPage = 1;
	loadData();
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
	loadData();
});
</script>

<style lang="scss" scoped>
.resource-audit {
	padding: 20px;
	background-color: #f5f7fa;
	min-height: 100%;
	overflow: auto;
	
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
	
	.filter-card, .table-card {
		border-radius: 12px;
		
		:deep(.el-card__body) {
			padding: 20px;
		}
	}
	
	.filter-container {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	
	.search-box {
		display: flex;
		gap: 10px;
		
		.search-input {
			width: 300px;
		}
		
		.status-select {
			width: 150px;
		}
	}
	
	.action-buttons {
		display: flex;
		gap: 10px;
	}
	
	.table-container {
		padding: 20px;
	}
	
	.pagination-row {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.pagination-info {
			color: #606266;
			font-size: 14px;
			
			.total-count {
				color: #409EFF;
				font-weight: bold;
			}
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
	
	.operation-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		
		.el-button {
			margin: 0;
			border-radius: 6px;
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
}

/* 表格样式优化 */
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
	
	border-radius: 8px;
	overflow: hidden;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
	border-radius: 8px;
	overflow: hidden;
	
	.el-dialog__header {
		background-color: #f5f7fa;
		border-bottom: 1px solid #ebeef5;
		padding: 15px 20px;
		
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
:deep(.el-select .el-input .el-input__inner) {
	border-radius: 6px;
}

:deep(.el-button) {
	border-radius: 6px;
}

:deep(.el-card) {
	border: none;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-descriptions) {
	border-radius: 8px;
	overflow: hidden;
}
</style> 