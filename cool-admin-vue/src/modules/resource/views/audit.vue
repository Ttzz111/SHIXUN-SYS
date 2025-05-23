<template>
	<div class="resource-audit page-container">
		<!-- 蓝色横幅Banner -->
		<div class="banner-box">
			<h1>资源审核</h1>
			<p>在这里可以对所有上传的资源进行审核、预览和管理，支持批量操作，提升审核效率！</p>
		</div>
		<!-- 操作栏 -->
		<cl-crud ref="Crud">
			<cl-row>
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
				
				<cl-flex1 />
				
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
			</cl-row>

			<!-- 表格 -->
			<cl-row>
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
			</cl-row>
			
			<!-- 分页 -->
			<cl-row class="pagination-row">
				<cl-flex1 />
				<el-pagination
					v-model:current-page="page.currentPage"
					v-model:page-size="page.pageSize"
					:page-sizes="[10, 20, 50, 100]"
					layout="total, sizes, prev, pager, next, jumper"
					:total="page.total"
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
				/>
			</cl-row>
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
					<iframe v-if="previewDialog.url" :src="previewDialog.url" width="100%" height="500"></iframe>
					<el-empty v-else description="无法预览此类文档"></el-empty>
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
					<video controls style="width: 100%; max-height: 500px;">
						<source :src="previewDialog.url" type="video/mp4">
						您的浏览器不支持视频标签
					</video>
				</div>
				
				<!-- 其他类型 -->
				<div v-else class="other-preview">
					<el-empty description="无法预览此类型的文件"></el-empty>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { Search, Refresh, Check, Close, Document } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';

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

// 模拟资源数据
const mockData = [
	{
		id: 1,
		name: '工程实训设备操作指南.pdf',
		type: 'document',
		categoryId: 101,
		categoryName: '工程训练IA',
		author: 'stu1',
		size: 1024 * 1024 * 2.5, // 2.5MB
		createTime: '2025-04-15 14:30:00',
		status: 'pending',
		description: '详细介绍了车床、铣床等工程实训设备的操作方法和注意事项。'
	},
	{
		id: 2,
		name: '激光切割机实操视频.mp4',
		type: 'video',
		categoryId: 202,
		categoryName: '激光加工创新训练',
		author: 'stu1',
		size: 1024 * 1024 * 15, // 15MB
		createTime: '2025-04-15 14:31:00',
		status: 'pending',
		description: '学生提交的激光切割机操作演示视频，展示了完整的操作流程。'
	},
	{
		id: 3,
		name: '3D打印作品展示.jpg',
		type: 'image',
		categoryId: 103,
		categoryName: '工程训练III',
		author: 'stu1',
		size: 1024 * 1024 * 1.2, // 1.2MB
		createTime: '2025-04-15 14:32:00',
		status: 'approved',
		description: '学生3D打印作品成果展示图片，包含设计说明。'
	},
	{
		id: 4,
		name: '虚拟仿真实验报告.docx',
		type: 'document',
		categoryId: 301,
		categoryName: '虚拟仿真设备VR使用学习',
		author: 'stu1',
		size: 1024 * 1024 * 3.7, // 3.7MB
		createTime: '2025-04-15 14:32:30',
		status: 'rejected',
		description: '虚拟仿真实验的完整报告，包含实验过程和结果分析。'
	},
	{
		id: 5,
		name: '陶艺制作教程.pdf',
		type: 'document',
		categoryId: 201,
		categoryName: '陶艺制作与体验',
		author: 'stu1',
		size: 1024 * 1024 * 5.2, // 5.2MB
		createTime: '2025-04-15 14:32:45',
		status: 'pending',
		description: '陶艺制作全流程教程，适合初学者学习使用。'
	},
	{
		id: 6,
		name: '工程创客训练：基于vslam的多旋翼自主无人机的设计、制造和调试',
		type: 'document',
		categoryId: 401,
		categoryName: '工程创客训练',
		author: 'stu1',
		size: 1024 * 1024 * 2.5,
		createTime: '2025-05-17 14:30:00',
		status: 'pending',
		description: '基于vslam的多旋翼自主无人机的设计、制造和调试完整教程。'
	},
	{
		id: 7,
		name: '工程创客训练：献礼百廿河工-基于工大元素的文创产品的设计与制作',
		type: 'document',
		categoryId: 402,
		categoryName: '工程创客训练',
		author: 'stu1',
		size: 1024 * 1024 * 15,
		createTime: '2025-05-17 14:31:00',
		status: 'pending',
		description: '基于工大元素的文创产品的设计与制作教程。'
	},
	{
		id: 8,
		name: '工程创客训练：立式绳驱动蛇形自动充电手臂结构及控制系统设计',
		type: 'document',
		categoryId: 403,
		categoryName: '工程创客训练',
		author: 'stu1',
		size: 1024 * 1024 * 1.2,
		createTime: '2025-05-17 14:32:00',
		status: 'pending',
		description: '立式绳驱动蛇形自动充电手臂结构及控制系统设计详细说明。'
	},
	{
		id: 9,
		name: '工程创客训练：反射式钢筘筘齿计数器研制',
		type: 'document',
		categoryId: 404,
		categoryName: '工程创客训练',
		author: 'stu1',
		size: 1024 * 1024 * 3.7,
		createTime: '2025-05-17 14:32:30',
		status: 'pending',
		description: '反射式钢筘筘齿计数器研制技术文档。'
	}
];

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
function loadData() {
	loading.value = true;
	
	// 模拟异步请求延迟
	setTimeout(() => {
		// 筛选数据
		let filteredData = [...mockData];
		
		// 根据关键词筛选
		if (search.keyword) {
			filteredData = filteredData.filter(item => 
				item.name.toLowerCase().includes(search.keyword.toLowerCase()) ||
				item.description.toLowerCase().includes(search.keyword.toLowerCase())
			);
		}
		
		// 根据状态筛选
		if (search.status) {
			filteredData = filteredData.filter(item => item.status === search.status);
		}
		
		// 按创建时间倒序排序
		filteredData.sort((a, b) => {
			return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
		});
		
		// 计算总数
		page.total = filteredData.length;
		
		// 分页处理
		const start = (page.currentPage - 1) * page.pageSize;
		const end = start + page.pageSize;
		list.value = filteredData.slice(start, end);
		
		// 重置多选状态
		multipleSelection.value = [];
		
		loading.value = false;
	}, 500);
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
	).then(() => {
		// 更新状态
		multipleSelection.value.forEach(item => {
			const resource = list.value.find(res => res.id === item.id);
			if (resource && resource.status === 'pending') {
				resource.status = 'approved';
			}
		});
		
		ElMessage.success(`已批量通过 ${multipleSelection.value.length} 个资源`);
		multipleSelection.value = [];
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
function confirmReject() {
	if (!rejectDialog.form.reason.trim()) {
		ElMessage.warning('请输入拒绝原因');
		return;
	}
	
	if (rejectDialog.isBatch) {
		// 批量拒绝
		multipleSelection.value.forEach(item => {
			const resource = list.value.find(res => res.id === item.id);
			if (resource && resource.status === 'pending') {
				resource.status = 'rejected';
			}
		});
		
		ElMessage.success(`已批量拒绝 ${multipleSelection.value.length} 个资源`);
		multipleSelection.value = [];
	} else if (rejectDialog.currentResource) {
		// 单个拒绝
		const resource = list.value.find(res => res.id === rejectDialog.currentResource.id);
		if (resource) {
			resource.status = 'rejected';
		}
		
		ElMessage.success('已拒绝该资源');
	}
	
	rejectDialog.visible = false;
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
	).then(() => {
		// 更新状态
		const resource = list.value.find(res => res.id === row.id);
		if (resource) {
			resource.status = 'approved';
		}
		
		ElMessage.success('审核已通过');
	}).catch(() => {});
}

// 拒绝资源
function rejectResource(row: any) {
	rejectDialog.currentResource = row;
	rejectDialog.isBatch = false;
	rejectDialog.form.reason = '';
	rejectDialog.visible = true;
}

// 预览资源
function previewResource(row: any) {
	previewDialog.data = row;
	previewDialog.title = `预览: ${row.name}`;
	previewDialog.loading = true;
	previewDialog.visible = true;
	
	// 模拟获取预览URL
	setTimeout(() => {
		// 这里应该是从后端获取实际的URL
		if (row.type === 'document') {
			previewDialog.url = 'https://mozilla.github.io/pdf.js/web/viewer.html';
		} else if (row.type === 'image') {
			previewDialog.url = 'https://picsum.photos/800/600';
		} else if (row.type === 'video') {
			previewDialog.url = 'https://www.w3schools.com/html/mov_bbb.mp4';
		} else {
			previewDialog.url = '';
		}
		
		previewDialog.loading = false;
	}, 1000);
}

// 显示详情
function showDetail(row: any) {
	detailDialog.data = row;
	detailDialog.visible = true;
}

// 处理表格多选变化
function handleSelectionChange(selection: any[]) {
	multipleSelection.value = selection;
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

// 组件挂载时加载数据
onMounted(() => {
	loadData();
});
</script>

<style lang="scss" scoped>
.resource-audit {
	padding: 20px;
	height: calc(100vh - 120px);
	display: flex;
	flex-direction: column;
	
	.search-box {
		display: flex;
		gap: 15px;
		margin-bottom: 20px;
		
		.search-input {
			width: 280px;
		}
		
		.status-select {
			width: 140px;
		}
	}
	
	.action-buttons {
		display: flex;
		gap: 15px;
	}
	
	.pagination-row {
		margin-top: 25px;
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
	}
	
	.operation-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
		
		.el-button {
			margin: 0;
		}
	}

	:deep(.el-table) {
		flex: 1;
		overflow: auto;
		border-radius: 6px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		
		.el-table__header th {
			background-color: #f5f7fa;
			color: #606266;
			font-weight: 600;
		}
		
		.el-tag {
			border-radius: 4px;
		}

		.el-table__body-wrapper {
			overflow-y: auto;
			max-height: calc(100vh - 300px);
		}
	}

	:deep(.el-dialog) {
		border-radius: 8px;
		overflow: hidden;
		
		.el-dialog__header {
			border-bottom: 1px solid #ebeef5;
			padding: 15px 20px;
			margin-right: 0;
		}
		
		.el-dialog__body {
			padding: 20px;
			max-height: calc(100vh - 200px);
			overflow-y: auto;
		}
		
		.el-dialog__footer {
			border-top: 1px solid #ebeef5;
			padding: 15px 20px;
		}
	}

	:deep(.el-card) {
		border-radius: 8px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
		
		.el-card__header {
			padding: 15px 20px;
			border-bottom: 1px solid #ebeef5;
			background-color: #f5f7fa;
		}
	}

	.banner-box {
		width: 100%;
		background: linear-gradient(90deg, #2989d8 0%, #1e5799 100%);
		color: #fff;
		border-radius: 10px;
		padding: 32px 24px 24px 32px;
		margin-bottom: 24px;
		box-sizing: border-box;
		box-shadow: 0 2px 8px 0 rgba(41,137,216,0.08);
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		h1 {
			font-size: 2rem;
			font-weight: bold;
			margin: 0 0 8px 0;
		}
		p {
			font-size: 1.1rem;
			margin: 0;
			opacity: 0.95;
		}
	}
}
</style> 