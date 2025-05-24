<template>
	<div class="resource-category page-container">
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
				</div>
				
				<cl-flex1 />
				
				<!-- 管理员操作按钮 -->
				<div class="action-buttons" v-if="hasResourceManagePermission">
					<el-button
						type="danger"
						@click="onBatchDelete"
						:disabled="multipleSelection.length === 0"
						v-if="hasResourceDeletePermission"
					>
						<el-icon><delete /></el-icon>
						批量删除<span v-if="multipleSelection.length > 0">({{ multipleSelection.length }})</span>
					</el-button>
					<el-button type="primary" @click="onRefresh">
						<el-icon><refresh /></el-icon>
						刷新
					</el-button>
					<el-button type="success" @click="onAddResource" v-if="hasResourceUploadPermission">
						<el-icon><plus /></el-icon>
						添加资源
					</el-button>
				</div>
			</cl-row>
		</cl-crud>

		<!-- 分类筛选栏 -->
		<div class="filter-container">
			<div class="filter-item">
				<span class="filter-label">资源分类：</span>
				<div class="filter-options">
					<el-tag
						:effect="categoryId === 0 ? 'dark' : 'plain'"
						@click="onCategorySelect(0)"
						class="category-tag"
						:class="{'active': categoryId === 0}"
					>
						全部
					</el-tag>
					<el-tag
						v-for="item in categoryList"
						:key="item.id"
						:effect="categoryId === item.id ? 'dark' : 'plain'"
						@click="onCategorySelect(item.id)"
						class="category-tag"
						:class="{'active': categoryId === item.id}"
					>
						{{ item.name }}
					</el-tag>
				</div>
			</div>
			
			<!-- 子分类筛选 -->
			<div class="filter-item" v-if="categoryId !== 0">
				<span class="filter-label">子分类：</span>
				<div class="filter-options">
					<el-tag
						v-for="item in filteredSubcategories"
						:key="item.id"
						:effect="subCategoryId === item.id ? 'dark' : 'plain'"
						@click="onSubCategorySelect(item.id)"
						class="category-tag"
						:class="{'active': subCategoryId === item.id}"
					>
						{{ item.name }}
					</el-tag>
				</div>
			</div>
			
			<div class="filter-item">
				<span class="filter-label">资源类型：</span>
				<div class="filter-options">
					<el-tag
						:effect="resourceType === '' ? 'dark' : 'plain'"
						@click="onTypeSelect('')"
						class="category-tag"
						:class="{'active': resourceType === ''}"
					>
						全部
					</el-tag>
					<el-tag
						v-for="item in resourceTypes"
						:key="item.value"
						:effect="resourceType === item.value ? 'dark' : 'plain'"
						@click="onTypeSelect(item.value)"
						class="category-tag"
						:class="{'active': resourceType === item.value}"
						:type="getTagType(item.value)"
					>
						{{ item.label }}
					</el-tag>
				</div>
			</div>
		</div>

		<!-- 资源列表 -->
		<div class="resource-list-container" v-loading="loading">
			<!-- 删除顶部分页 -->
			
			<el-empty description="暂无数据" v-if="list.length === 0"></el-empty>
			
			<el-row :gutter="20" v-else class="resource-list">
				<el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(item, index) in list" :key="index">
					<el-card 
						class="resource-card" 
						:body-style="{ padding: '0px' }"
						:class="{ 'is-selected': isSelected(item) }"
						shadow="hover"
					>
						<div class="resource-cover" @click="toggleSelection(item)">
							<img :src="getResourceCover(item)" alt="资源封面" />
							<div class="resource-type" :class="'type-' + item.type">
								{{ getResourceTypeName(item.type) }}
							</div>
							
							<!-- 选择标记 -->
							<div class="selection-mark" v-if="hasResourceDeletePermission">
								<el-checkbox v-model="item.selected" @click.stop></el-checkbox>
							</div>
							
							<!-- 基本信息浮层 -->
							<div class="resource-hover-info">
								<div class="hover-stats">
									<div class="stat-item">
										<el-icon><view /></el-icon> {{ item.viewCount || 0 }}
									</div>
									<div class="stat-item">
										<el-icon><download /></el-icon> {{ item.downloadCount || 0 }}
									</div>
								</div>
							</div>
						</div>
						<div class="resource-info">
							<div class="resource-title" :title="item.name">{{ item.name }}</div>
							<div class="resource-desc" :title="item.description || '暂无描述'">
								{{ item.description || '暂无描述' }}
							</div>
							<div class="resource-meta">
								<div class="meta-item">
									<el-icon><calendar /></el-icon>
									<span>{{ formatDate(item.createTime) }}</span>
								</div>
								<div class="meta-item">
									<el-icon><user /></el-icon>
									<span>{{ item.author }}</span>
								</div>
							</div>
						</div>
						<div class="resource-actions">
							<el-tooltip content="预览资源" placement="top" :show-after="300">
								<el-button type="primary" text @click="onPreviewResource(item)">
									<el-icon :size="20"><View /></el-icon>
								</el-button>
							</el-tooltip>
							<el-tooltip content="下载资源" placement="top" :show-after="300">
								<el-button type="success" text @click="onDownloadResource(item)">
									<el-icon><download /></el-icon>
								</el-button>
							</el-tooltip>
							<el-tooltip content="删除资源" placement="top" :show-after="300" v-if="hasResourceDeletePermission">
								<el-button type="danger" text @click="onDeleteResource(item)">
									<el-icon><delete /></el-icon>
								</el-button>
							</el-tooltip>
						</div>
					</el-card>
				</el-col>
			</el-row>
			
			<!-- 底部分页 -->
			<div class="pagination-footer">
				<div class="pagination-info">
					共 <span class="total-count">{{ page.total }}</span> 条，当前 {{ (page.currentPage - 1) * page.pageSize + 1 }}-{{ Math.min(page.currentPage * page.pageSize, page.total) }} 条
				</div>
				<el-pagination
					v-model:current-page="page.currentPage"
					v-model:page-size="page.pageSize"
					:page-sizes="[12, 24, 36, 48]"
					layout="sizes, prev, pager, next, jumper"
					:total="page.total"
					@size-change="onSizeChange"
					@current-change="onCurrentChange"
					background
					:pager-count="5"
				/>
			</div>
		</div>
	</div>

	<!-- 添加资源对话框 -->
	<el-dialog
		v-model="dialogVisible"
		title="添加资源"
		width="650px"
		destroy-on-close
	>
		<el-form :model="resourceForm" label-width="100px" :rules="rules" ref="formRef">
			<el-form-item label="资源名称" prop="name">
				<el-input v-model="resourceForm.name" placeholder="请输入资源名称"></el-input>
			</el-form-item>
			
			<el-form-item label="资源分类" prop="categoryId">
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
				></el-cascader>
			</el-form-item>
			
			<el-form-item label="资源类型" prop="type">
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
			
			<el-form-item label="上传文件" prop="file">
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
				>
					<el-icon class="el-icon--upload">
						<upload-filled />
					</el-icon>
					<div class="el-upload__text">
						拖拽文件到此处或 <em>点击上传</em>
					</div>
					<template #tip>
						<div class="el-upload__tip">
							提示：支持各种格式的文件，大小不超过500MB
						</div>
					</template>
				</el-upload>
			</el-form-item>
		</el-form>
		
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitResourceForm" :loading="submitting">
					确认
				</el-button>
			</span>
		</template>
	</el-dialog>
	
	<!-- 视频预览对话框 -->
	<el-dialog
		v-model="videoPreviewDialog"
		title="视频预览"
		width="800px"
		destroy-on-close
		center
	>
		<div class="video-container">
			<video controls style="width: 100%;">
				<source :src="currentVideoUrl" type="video/mp4">
				您的浏览器不支持视频标签
			</video>
		</div>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, nextTick, onBeforeUnmount } from 'vue';
import { Search, Calendar, View, Refresh, Plus, UploadFilled, Delete, Download, User } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import { useBase } from '/$/base';
import { checkPerm } from '/$/base/utils/permission';
import { useStorage } from '@vueuse/core';
import { 
	getResources, 
	createResourceUrl 
} from '../utils/indexedDB';

// const { service } = useCool();
const { user } = useBase();

// 权限检查
const hasResourceManagePermission = computed(() => checkPerm(['resource:manage']) || user.info?.roleIds?.includes(1));
const hasResourceUploadPermission = computed(() => checkPerm(['resource:upload']) || hasResourceManagePermission.value);
const hasResourceDeletePermission = computed(() => checkPerm(['resource:delete']) || hasResourceManagePermission.value);

// 搜索条件
const search = reactive({
	keyword: ''
});

// 分类筛选
const categoryId = ref(0);
const subCategoryId = ref(0);
const resourceType = ref('');

// 分页信息
const page = reactive({
	currentPage: 1,
	pageSize: 12,
	total: 0
});

// 加载状态
const loading = ref(false);

// 资源列表
const list = ref<any[]>([]);

// 资源分类列表
const categoryList = ref([
	{ id: 1, name: '劳动基本技能', parentId: 0, icon: 'tools' },
	{ id: 2, name: '体验式劳动教育', parentId: 0, icon: 'discover' },
	{ id: 3, name: '虚拟实训体验', parentId: 0, icon: 'virtual' },
]);

const subcategories = ref([
	{ id: 101, name: '工程训练IA', parentId: 1 },
	{ id: 102, name: '工程训练II', parentId: 1 },
	{ id: 103, name: '工程训练III', parentId: 1 },
	{ id: 104, name: '工程训练IV', parentId: 1 },
	{ id: 105, name: '工程认知训练', parentId: 1 },
	{ id: 201, name: '陶艺制作与体验', parentId: 2 },
	{ id: 202, name: '激光加工创新训练', parentId: 2 },
	{ id: 203, name: '精工细铸创新实践', parentId: 2 },
	{ id: 301, name: '虚拟仿真设备VR使用学习', parentId: 3 },
]);

// 资源类型
const resourceTypes = ref([
	{ label: '文档', value: 'document', icon: 'document' },
	{ label: '图片', value: 'image', icon: 'picture' },
	{ label: '视频', value: 'video', icon: 'film' },
	{ label: '音频', value: 'audio', icon: 'headset' },
	{ label: '压缩包', value: 'archive', icon: 'folder' }
]);

// 存储创建的URL，以便在组件销毁时释放
const createdUrls = ref<string[]>([]);

// 视频预览对话框
const videoPreviewDialog = ref(false);
const currentVideoUrl = ref('');

// 多选数据
const multipleSelection = ref<any[]>([]);

// 已删除的资源ID
const deletedResourceIds = useStorage('deleted-resources', [] as number[]);

// 为资源类型标签提供不同颜色
function getTagType(type: string): '' | 'success' | 'warning' | 'danger' | 'info' {
	switch (type) {
		case 'document':
			return '';
		case 'video':
			return 'danger';
		case 'image':
			return 'success';
		case 'audio':
			return 'warning';
		case 'archive':
			return 'info';
		default:
			return '';
	}
}

// 覆盖原有的搜索方法
function onSearch() {
	page.currentPage = 1;
	getResourceList();
	savePageState();
}

// 覆盖原有的选择分类方法
function onCategorySelect(id: number) {
	categoryId.value = id;
	subCategoryId.value = 0; // 重置子分类选择
	page.currentPage = 1;
	getResourceList();
	savePageState();
}

// 覆盖原有的选择资源类型方法
function onTypeSelect(type: string) {
	resourceType.value = type;
	page.currentPage = 1;
	getResourceList();
	savePageState();
}

// 覆盖原有的页码变化方法
function onCurrentChange(val: number) {
	page.currentPage = val;
	getResourceList();
	savePageState();
}

// 覆盖原有的每页数量变化方法
function onSizeChange(val: number) {
	page.pageSize = val;
	page.currentPage = 1;
	getResourceList();
	savePageState();
}

// 刷新
function onRefresh() {
	ElMessage.success('刷新资源列表');
	getResourceList();
}

// 添加资源
function onAddResource() {
	ElMessageBox.alert('请前往资源上传页面上传资源', '添加资源', {
		confirmButtonText: '确定'
	});
}

// 批量删除
function onBatchDelete() {
	if (multipleSelection.value.length === 0) {
		ElMessage.warning('请选择要删除的资源');
		return;
	}
	
	ElMessageBox.confirm(
		`确定要删除所选的 ${multipleSelection.value.length} 个资源吗？`,
		'批量删除',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		// 将选中的资源ID添加到已删除列表
		const ids = multipleSelection.value.map(item => item.id);
		deletedResourceIds.value = [...deletedResourceIds.value, ...ids];
		
		// 刷新列表
		getResourceList();
		
		ElMessage.success(`已删除 ${multipleSelection.value.length} 个资源`);
		multipleSelection.value = [];
	}).catch(() => {});
}

// 选择/取消选择资源
function toggleSelection(item: any) {
	item.selected = !item.selected;
	updateMultipleSelection();
}

// 检查资源是否被选中
function isSelected(item: any) {
	return item.selected;
}

// 更新多选数组
function updateMultipleSelection() {
	multipleSelection.value = list.value.filter(item => item.selected);
}

// 保存页面状态
function savePageState() {
	const state = {
		categoryId: categoryId.value,
		resourceType: resourceType.value,
		search: search.keyword,
		page: page.currentPage,
		pageSize: page.pageSize
	};
	
	localStorage.setItem('resource-category-state', JSON.stringify(state));
}

// 获取页面状态
function getPageState() {
	const stateStr = localStorage.getItem('resource-category-state');
	if (stateStr) {
		try {
			const state = JSON.parse(stateStr);
			categoryId.value = state.categoryId || 0;
			resourceType.value = state.resourceType || '';
			search.keyword = state.search || '';
			page.currentPage = state.page || 1;
			page.pageSize = state.pageSize || 12;
					} catch (e) {
			console.error('解析页面状态失败', e);
		}
	}
}

// 获取资源列表
async function getResourceList() {
	loading.value = true;

	try {
		// 从IndexedDB获取资源
		let resources = await getResources();
		
		// 只显示已审核通过的资源
		resources = resources.filter(item => item.status === 'approved');
		
		// 应用分类和类型过滤
		if (categoryId.value !== 0) {
			const targetCategory = categoryList.value.find(c => c.id === categoryId.value);
			if (targetCategory) {
				// 获取该分类下的所有子分类
				const subCats = subcategories.value.filter(s => s.parentId === targetCategory.id);
				const subCatIds = subCats.map(s => s.id);
				resources = resources.filter(r => subCatIds.includes(r.categoryId));
			}
		}
		
		// 按类型筛选
		if (resourceType.value) {
			resources = resources.filter(r => r.type === resourceType.value);
		}
		
		// 关键字搜索
		if (search.keyword) {
			const keyword = search.keyword.toLowerCase();
			resources = resources.filter(r => 
				r.name.toLowerCase().includes(keyword) || 
				(r.description && r.description.toLowerCase().includes(keyword))
			);
		}
		
		// 更新分页信息
		page.total = resources.length;
		
		// 分页处理
	const startIndex = (page.currentPage - 1) * page.pageSize;
	const endIndex = startIndex + page.pageSize;
		list.value = resources.slice(startIndex, endIndex);
		
		loading.value = false;
	} catch (err) {
		console.error(err);
		loading.value = false;
		ElMessage.error('获取资源列表失败');
	}
}

// 获取资源封面
function getResourceCover(item: any) {
	return item.coverUrl || getDefaultCover(item.type);
}

// 获取默认封面
function getDefaultCover(type: string) {
	switch (type) {
		case 'document':
			return 'https://via.placeholder.com/300x200?text=文档';
		case 'video':
			return 'https://via.placeholder.com/300x200?text=视频';
		case 'image':
			return 'https://via.placeholder.com/300x200?text=图片';
		case 'audio':
			return 'https://via.placeholder.com/300x200?text=音频';
		case 'archive':
			return 'https://via.placeholder.com/300x200?text=压缩包';
		default:
			return 'https://via.placeholder.com/300x200?text=其他';
	}
}

// 获取资源类型名称
function getResourceTypeName(type: string) {
	const target = resourceTypes.value.find(item => item.value === type);
	return target ? target.label : '其他';
}

// 格式化日期
function formatDate(date: string) {
	return dayjs(date).format('YYYY-MM-DD');
}

// 格式化文件大小
function formatFileSize(size?: number): string {
	if (!size) return '0 B';
	
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let i = 0;
	let formattedSize = size;
	
	while (formattedSize >= 1024 && i < units.length - 1) {
		formattedSize /= 1024;
		i++;
	}
	
	return `${formattedSize.toFixed(2)} ${units[i]}`;
}

// 替换预览资源的函数
async function previewResource(resource) {
	try {
		// 从IndexedDB获取文件并创建URL
		const url = await createResourceUrl(resource.id);
		
		if (url) {
			// 根据资源类型处理预览
			if (resource.type === 'video') {
				currentVideoUrl.value = url;
				createdUrls.value.push(url); // 保存URL以便后续释放
				videoPreviewDialog.value = true;
			} else if (resource.type === 'image') {
				// 使用Element Plus的图片预览
				const imgViewer = document.createElement('img');
				imgViewer.src = url;
				createdUrls.value.push(url); // 保存URL以便后续释放
				
				// 触发点击以打开预览
				imgViewer.click();
			} else {
				// 在新窗口打开文档
				window.open(url, '_blank');
			}
		} else {
			ElMessage.warning('无法预览此资源');
		}
	} catch (error) {
		console.error('预览资源失败:', error);
		ElMessage.error('预览资源失败');
	}
}

// 替换下载资源的函数
async function downloadResource(resource) {
	try {
		// 从IndexedDB获取文件并创建URL
		const url = await createResourceUrl(resource.id);
		
		if (url) {
			// 创建下载链接
			const a = document.createElement('a');
			a.href = url;
			a.download = resource.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			
			// 释放URL
	setTimeout(() => {
				URL.revokeObjectURL(url);
			}, 100);
			
			// 更新下载计数
			ElMessage.success('下载开始');
		} else {
			ElMessage.warning('无法下载此资源');
		}
	} catch (error) {
		console.error('下载资源失败:', error);
		ElMessage.error('下载资源失败');
	}
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

// 计算过滤后的子分类
const filteredSubcategories = computed(() => {
	if (categoryId.value === 0) return [];
	return subcategories.value.filter(item => item.parentId === categoryId.value);
});

// 选择子分类
const onSubCategorySelect = (id) => {
	subCategoryId.value = id;
	// 根据选择的子分类进行过滤
	getResourceList();
};

// 组件挂载后加载数据
onMounted(() => {
	// 恢复之前的筛选条件和页面状态
	getPageState();
	getResourceList();
});
</script>

<style lang="scss" scoped>
.resource-category {
	.page-container {
		padding: 20px;
	}

	.search-box {
		display: flex;
		align-items: center;
		margin-bottom: 20px;

		.search-input {
			width: 300px;
		}
	}

	.filter-container {
		background: var(--el-bg-color);
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

		.filter-item {
			display: flex;
			align-items: center;
			margin-bottom: 15px;

			&:last-child {
				margin-bottom: 0;
			}

			.filter-label {
				width: 80px;
				color: var(--el-text-color-regular);
				font-size: 14px;
			}

			.filter-options {
				flex: 1;
				display: flex;
				flex-wrap: wrap;
				gap: 10px;

				.category-tag {
					cursor: pointer;
					transition: all 0.3s;
					padding: 0 15px;
					height: 32px;
					line-height: 32px;
					border-radius: 16px;

					&:hover {
						transform: translateY(-2px);
					}

					&.active {
						transform: scale(1.05);
					}
				}
			}
		}
	}

	.resource-list-container {
		.resource-list {
			margin: 0 -10px;
		}

		.resource-card {
			margin: 10px;
			transition: all 0.3s;
			border-radius: 8px;
			overflow: hidden;

			&:hover {
				transform: translateY(-5px);
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
			}

			&.is-selected {
				border: 2px solid var(--el-color-primary);
			}

			.resource-cover {
				position: relative;
				height: 200px;
				overflow: hidden;
				cursor: pointer;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.3s;
				}

				&:hover img {
					transform: scale(1.05);
				}

				.resource-type {
					position: absolute;
					top: 10px;
					right: 10px;
					padding: 4px 12px;
					border-radius: 12px;
					background: rgba(0, 0, 0, 0.6);
					color: #fff;
					font-size: 12px;
					backdrop-filter: blur(4px);

					&.type-document {
						background: rgba(64, 158, 255, 0.8);
					}

					&.type-video {
						background: rgba(245, 108, 108, 0.8);
					}

					&.type-image {
						background: rgba(103, 194, 58, 0.8);
					}

					&.type-audio {
						background: rgba(230, 162, 60, 0.8);
					}

					&.type-archive {
						background: rgba(144, 147, 153, 0.8);
					}
				}

				.selection-mark {
					position: absolute;
					top: 10px;
					left: 10px;
					z-index: 2;
				}

				.resource-hover-info {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
					padding: 15px;
					opacity: 0;
					transition: opacity 0.3s;

					.hover-stats {
						display: flex;
						justify-content: flex-end;
						gap: 15px;

						.stat-item {
							color: #fff;
							font-size: 14px;
							display: flex;
							align-items: center;

							.el-icon {
								margin-right: 5px;
								font-size: 16px;
							}
						}
					}
				}

				&:hover .resource-hover-info {
					opacity: 1;
				}
			}

			.resource-info {
				padding: 15px;

				.resource-title {
					font-size: 16px;
					font-weight: bold;
					margin-bottom: 8px;
					color: var(--el-text-color-primary);
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.resource-desc {
					font-size: 13px;
					color: var(--el-text-color-secondary);
					margin-bottom: 12px;
					height: 40px;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.resource-meta {
					display: flex;
					justify-content: space-between;
					font-size: 12px;
					color: var(--el-text-color-secondary);

					.meta-item {
						display: flex;
						align-items: center;

						.el-icon {
							margin-right: 5px;
							font-size: 14px;
						}
					}
				}
			}

			.resource-actions {
				display: flex;
				justify-content: space-around;
				padding: 10px;
				border-top: 1px solid var(--el-border-color-lighter);
				background: var(--el-bg-color-page);

				.el-button {
					margin: 0;
					padding: 8px 15px;

					.el-icon {
						margin-right: 5px;
					}
				}
			}
		}

		.pagination-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 30px;
			padding: 20px 0;

			.pagination-info {
				color: var(--el-text-color-secondary);
				font-size: 14px;

				.total-count {
					font-weight: bold;
					color: var(--el-color-primary);
				}
			}
		}
	}
}

// 视频预览对话框样式
.video-container {
	width: 100%;
	aspect-ratio: 16/9;
	background: #000;
	border-radius: 8px;
	overflow: hidden;

	video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
}

// 上传对话框样式
.upload-demo {
	:deep(.el-upload-dragger) {
		width: 100%;
		height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 2px dashed var(--el-border-color);
		border-radius: 8px;
		transition: all 0.3s;

		&:hover {
			border-color: var(--el-color-primary);
		}

		.el-icon--upload {
			font-size: 48px;
			color: var(--el-color-primary);
			margin-bottom: 16px;
		}

		.el-upload__text {
			color: var(--el-text-color-regular);
			font-size: 14px;
			text-align: center;

			em {
				color: var(--el-color-primary);
				font-style: normal;
			}
		}
	}

	.el-upload__tip {
		margin-top: 10px;
		color: var(--el-text-color-secondary);
		font-size: 12px;
		text-align: center;
	}
}

.resource-actions .el-button {
	min-width: 36px;
	min-height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
}
</style>

<script lang="ts">
// 添加全局window.downloadResource接口
declare global {
	interface Window {
		downloadResource: (id: number) => void;
	}
}
</script>