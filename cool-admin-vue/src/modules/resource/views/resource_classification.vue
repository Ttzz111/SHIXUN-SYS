<template>
	<div class="resource-classification page-container">
		<!-- 蓝色横幅Banner -->
		<div class="banner-box">
			<h1>资源分类</h1>
			<p>浏览和下载各类学习资源，支持文档、图片、视频等多种格式</p>
		</div>
		
		<!-- 兴趣设置和推荐资源区域 -->
		<div class="recommendation-interest-row">
			<!-- 兴趣设置 -->
			<el-card shadow="never" class="interest-card">
				<template #header>
					<div class="card-header">
						<el-icon><star /></el-icon>
						<span>我的兴趣</span>
						<el-tooltip content="设置您的兴趣分类，获得更精准的资源推荐" placement="top">
							<el-icon class="info-icon"><info-filled /></el-icon>
						</el-tooltip>
					</div>
				</template>
				
				<div class="interest-setting-content">
					<p class="interest-tip">请选择您感兴趣的领域：</p>
					
					<div class="category-selection">
						<div
							v-for="category in categoryOptions"
							:key="category.id"
							:class="['category-item', { 'selected': selectedInterests.includes(category.id) }]"
							@click="toggleCategory(category.id)"
						>
							<el-icon><component :is="category.icon" /></el-icon>
							<span>{{ category.name }}</span>
							<el-icon v-if="selectedInterests.includes(category.id)" class="check-icon"><check /></el-icon>
						</div>
					</div>
					
					<div class="action-buttons">
						<el-button type="primary" size="small" @click="saveInterests" :loading="saving">保存设置</el-button>
						<el-button size="small" @click="resetInterests">重置</el-button>
					</div>
				</div>
			</el-card>
			
			<!-- 推荐资源区域 -->
			<div class="recommendation-box" v-if="recommendedResources.length > 0">
				<div class="section-title">
					<span>推荐资源</span>
					<el-tooltip effect="dark" content="基于您的浏览历史和兴趣推荐" placement="top">
						<el-icon class="info-icon"><info-filled /></el-icon>
					</el-tooltip>
				</div>
				
				<el-carousel :interval="4000" type="card" height="240px">
					<el-carousel-item v-for="item in recommendedResources" :key="item.id">
						<div class="recommendation-card" @click="previewResource(item)">
							<div class="resource-icon">
								<el-icon v-if="item.type === 'document'" :size="32"><document /></el-icon>
								<el-icon v-else-if="item.type === 'image'" :size="32"><picture /></el-icon>
								<el-icon v-else-if="item.type === 'video'" :size="32"><video-camera /></el-icon>
								<el-icon v-else :size="32"><folder /></el-icon>
							</div>
							<div class="resource-info">
								<h3 class="resource-name">{{ item.name }}</h3>
								<div class="resource-meta">
									<el-tag size="small" :type="getResourceTypeTag(item.type)">
										{{ getResourceTypeName(item.type) }}
									</el-tag>
									<span class="resource-size">{{ formatFileSize(item.size) }}</span>
								</div>
								<p class="resource-description">{{ item.description || '暂无描述' }}</p>
							</div>
						</div>
					</el-carousel-item>
				</el-carousel>
			</div>
		</div>
		
		<!-- 主要内容区域 -->
		<div class="main-content">
			<!-- 左侧分类导航 -->
			<div class="left-sidebar">
				<!-- 分类导航 -->
				<el-card shadow="never" class="category-card">
					<template #header>
						<div class="card-header">
							<el-icon><menu /></el-icon>
							<span>资源分类</span>
						</div>
					</template>
					
					<el-menu
						:default-active="activeCategory"
						class="category-menu"
						@select="handleCategorySelect"
					>
						<el-menu-item 
							v-for="category in categoryOptions" 
							:key="category.id"
							:index="category.id.toString()"
						>
							<el-icon><component :is="category.icon" /></el-icon>
							<span>{{ category.name }}</span>
						</el-menu-item>
					</el-menu>
				</el-card>
			</div>
			
			<!-- 右侧资源列表 -->
			<div class="resource-list">
				<el-card shadow="never" class="resource-card">
					<!-- 搜索和筛选 -->
					<div class="filter-container">
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
							
							<el-select 
								v-model="search.type" 
								placeholder="资源类型" 
								clearable 
								@change="onSearch"
								class="type-select"
							>
								<el-option
									v-for="item in resourceTypes"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
							
							<el-button type="primary" @click="onSearch">
								<el-icon><search /></el-icon>
								搜索
							</el-button>
							
							<el-button @click="onRefresh">
								<el-icon><refresh /></el-icon>
								刷新
							</el-button>
						</div>
					</div>
					
					<!-- 资源列表 -->
					<div class="list-container">
						<el-table
							v-loading="loading"
							:data="list"
							border
							style="width: 100%"
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
							<el-table-column prop="description" label="资源描述" min-width="180"></el-table-column>
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
											type="success" 
											size="small" 
											@click="downloadResource(scope.row)"
										>
											下载
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
					</div>
				</el-card>
			</div>
		</div>
		
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
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { 
	Search, 
	Refresh, 
	Document, 
	Download, 
	Folder, 
	Menu, 
	InfoFilled, 
	Picture, 
	VideoCamera, 
	Star,
	Check
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { getResources, createResourceUrl } from '../utils/indexedDB';
import { 
	getRecommendedResources, 
	recordResourceVisit, 
	initRecommendationSystem,
	setUserInterests
} from '../utils/recommendation';

// 获取用户信息
const { user } = useBase();

// 分类选项
const categoryOptions = [
	{ id: 101, name: '劳动基本技能', icon: 'tools' },
	{ id: 103, name: '体验式劳动教育', icon: 'discover' },
	{ id: 301, name: '虚拟实训体验', icon: 'virtual' },
];

// 资源类型配置
const resourceTypes = [
	{ label: '文档', value: 'document', tag: '' },
	{ label: '图片', value: 'image', tag: 'success' },
	{ label: '视频', value: 'video', tag: 'warning' },
];

// 当前选中的分类
const activeCategory = ref('101');

// 搜索条件
const search = reactive({
	keyword: '',
	type: ''
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

// 预览对话框
const previewDialog = reactive({
	visible: false,
	title: '资源预览',
	data: {} as any,
	url: '',
	loading: false
});

// 存储创建的URL，以便在组件销毁时释放
const createdUrls = ref<string[]>([]);

// 推荐资源列表
const recommendedResources = ref<any[]>([]);

// 选中的兴趣分类
const selectedInterests = ref<number[]>([]);

// 保存状态
const saving = ref(false);

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

// 处理分类选择
function handleCategorySelect(index: string) {
	activeCategory.value = index;
	page.currentPage = 1;
	loadData();
}

// 搜索
function onSearch() {
	page.currentPage = 1;
	loadData();
}

// 刷新
function onRefresh() {
	search.keyword = '';
	search.type = '';
	page.currentPage = 1;
	loadData();
}

// 加载数据
async function loadData() {
	loading.value = true;
	
	try {
		// 构建基础筛选条件
		const filter: any = {
			status: 'approved' // 只显示已审核通过的资源
		};
		
		// 如果有分类筛选
		if (activeCategory.value) {
			filter.categoryId = Number(activeCategory.value);
		}
		
		// 如果有类型筛选
		if (search.type) {
			filter.type = search.type;
		}
		
		// 从IndexedDB获取资源
		let resources = await getResources(filter);
		
		// 如果有关键词搜索,在前端进行过滤
		if (search.keyword) {
			const keyword = search.keyword.toLowerCase();
			resources = resources.filter((item: any) => 
				item.name.toLowerCase().includes(keyword) || 
				(item.description && item.description.toLowerCase().includes(keyword))
			);
		}
		
		// 更新总数
		page.total = resources.length;
		
		// 分页处理
		const start = (page.currentPage - 1) * page.pageSize;
		const end = start + page.pageSize;
		list.value = resources.slice(start, end);
	} catch (error) {
		console.error('加载资源列表失败:', error);
		ElMessage.error('加载资源列表失败');
	} finally {
		loading.value = false;
	}
}

// 预览资源
async function previewResource(row: any) {
	// 记录资源访问
	if (user.id) {
		recordResourceVisit(user.id.toString(), row.id);
	}

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

// 下载资源
async function downloadResource(row: any) {
	// 记录资源访问
	if (user.id) {
		recordResourceVisit(user.id.toString(), row.id);
	}

	try {
		const url = await createResourceUrl(row.id);
		if (url) {
			const a = document.createElement('a');
			a.href = url;
			a.download = row.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			ElMessage.success('下载开始');
		} else {
			ElMessage.warning('无法下载此资源');
		}
	} catch (error) {
		console.error('下载资源失败:', error);
		ElMessage.error('下载资源失败');
	}
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

// 加载推荐资源
async function loadRecommendedResources() {
	try {
		if (user.id) {
			recommendedResources.value = await getRecommendedResources(user.id.toString(), 5);
		} else {
			// 匿名用户使用默认推荐
			recommendedResources.value = await getRecommendedResources('anonymous', 5);
		}
	} catch (error) {
		console.error('加载推荐资源失败:', error);
	}
}

// 切换分类选择
function toggleCategory(categoryId: number) {
	const index = selectedInterests.value.indexOf(categoryId);
	if (index > -1) {
		selectedInterests.value.splice(index, 1);
	} else {
		selectedInterests.value.push(categoryId);
	}
}

// 保存兴趣设置
async function saveInterests() {
	if (selectedInterests.value.length === 0) {
		ElMessage.warning('请至少选择一个兴趣分类');
		return;
	}
	
	saving.value = true;
	try {
		console.log('保存兴趣设置:', selectedInterests.value);
		
		// 确保用户ID存在
		const userId = user.id ? user.id.toString() : 'anonymous';
		
		// 调用方法保存兴趣设置
		setUserInterests(userId, selectedInterests.value);
		ElMessage.success('兴趣设置已保存');
		
		// 更新推荐资源
		await loadRecommendedResources();
	} catch (error) {
		console.error('保存兴趣设置失败:', error);
		ElMessage.error('保存失败: ' + (error instanceof Error ? error.message : String(error)));
	} finally {
		saving.value = false;
	}
}

// 重置兴趣设置
function resetInterests() {
	selectedInterests.value = [];
}

// 加载用户兴趣设置
function loadUserInterests() {
	try {
		console.log('加载用户兴趣设置');
		const savedInterests = localStorage.getItem('resourceRecommendation:userInterests');
		console.log('保存的兴趣设置:', savedInterests);
		
		if (savedInterests) {
			const userInterests = JSON.parse(savedInterests);
			// 确保用户ID存在
			const userId = user.id ? user.id.toString() : 'anonymous';
			console.log('当前用户ID:', userId, '兴趣设置:', userInterests[userId]);
			
			if (userInterests[userId]) {
				selectedInterests.value = userInterests[userId];
			}
		}
	} catch (error) {
		console.error('加载兴趣设置失败:', error);
	}
}

// 页面加载时初始化
onMounted(() => {
	// 初始化推荐系统
	initRecommendationSystem();
	
	// 加载资源列表、推荐资源和兴趣设置
	loadData();
	loadRecommendedResources();
	loadUserInterests();
});

// 监听兴趣变化，但不立即更新推荐
watch(selectedInterests, async () => {
	// 仅监听变化，保存后再更新推荐
}, { deep: true });
</script>

<style lang="scss" scoped>
.resource-classification {
	padding: 20px;
	height: 100%;
	overflow: auto;
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
	
	.recommendation-interest-row {
		display: flex;
		gap: 20px;
		margin-bottom: 20px;
		
		.interest-card {
			flex: 0 0 280px; /* 固定宽度 */
			border-radius: 12px;
			
			:deep(.el-card__header) {
				padding: 15px 20px;
				border-bottom: 1px solid #ebeef5;
				background-color: #f9fafc;
				
				.card-header {
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 16px;
					font-weight: 500;
					
					.el-icon {
						color: #409EFF;
					}
					
					.info-icon {
						margin-left: auto;
						color: #909399;
						font-size: 14px;
					}
				}
			}
			
			.interest-setting-content {
				padding: 10px 0;
				
				.interest-tip {
					color: #606266;
					font-size: 13px;
					margin-bottom: 15px;
				}
				
				.category-selection {
					display: flex;
					flex-direction: column;
					gap: 8px;
					margin-bottom: 15px;
					
					.category-item {
						position: relative;
						height: 40px;
						background-color: #f5f7fa;
						border-radius: 8px;
						display: flex;
						align-items: center;
						padding: 0 15px;
						gap: 10px;
						cursor: pointer;
						transition: all 0.3s;
						
						.el-icon {
							color: #606266;
						}
						
						&:hover {
							background-color: #e6f7ff;
						}
						
						&.selected {
							background-color: #e6f7ff;
							border: 1px solid #1890ff;
							
							.el-icon {
								color: #1890ff;
							}
							
							.check-icon {
								position: absolute;
								top: 50%;
								right: 10px;
								transform: translateY(-50%);
								color: #1890ff;
							}
						}
					}
				}
				
				.action-buttons {
					display: flex;
					justify-content: center;
					gap: 8px;
				}
			}
		}
		
		.recommendation-box {
			flex: 1;
			min-width: 0;
			
			.section-title {
				font-size: 16px;
				font-weight: 600;
				margin-bottom: 15px;
				color: #303133;
				display: flex;
				align-items: center;
				
				.info-icon {
					margin-left: 8px;
					color: #909399;
				}
			}
			
			:deep(.el-carousel__item) {
				border-radius: 8px;
				overflow: hidden;
			}
			
			.recommendation-card {
				height: 100%;
				background-color: #fff;
				border-radius: 8px;
				padding: 20px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				cursor: pointer;
				transition: all 0.3s;
				box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
				
				&:hover {
					transform: translateY(-5px);
					box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15);
				}
				
				.resource-icon {
					margin-bottom: 15px;
					
					.el-icon {
						color: #409EFF;
					}
				}
				
				.resource-info {
					text-align: center;
					width: 100%;
					
					.resource-name {
						margin: 0 0 10px 0;
						font-size: 16px;
						color: #303133;
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
					}
					
					.resource-meta {
						display: flex;
						justify-content: center;
						align-items: center;
						gap: 8px;
						margin-bottom: 10px;
						
						.resource-size {
							color: #909399;
							font-size: 13px;
						}
					}
					
					.resource-description {
						color: #606266;
						font-size: 13px;
						margin: 0;
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						height: 36px;
					}
				}
			}
		}
	}
	
	.main-content {
		display: flex;
		gap: 20px;
		
		.left-sidebar {
			width: 280px;
			flex-shrink: 0;
			
			.category-card {
				border-radius: 12px;
				
				:deep(.el-card__header) {
					padding: 15px 20px;
					border-bottom: 1px solid #ebeef5;
					background-color: #f9fafc;
					
					.card-header {
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
				
				.category-menu {
					border-right: none;
					
					.el-menu-item {
						display: flex;
						align-items: center;
						gap: 8px;
						height: 45px;
						line-height: 45px;
						
						.el-icon {
							margin-right: 0;
						}
					}
				}
			}
		}
		
		.resource-list {
			flex: 1;
			min-width: 0;
			
			.resource-card {
				border-radius: 12px;
				
				.filter-container {
					margin-bottom: 20px;
					
					.search-box {
						display: flex;
						gap: 10px;
						align-items: center;
						
						.search-input {
							width: 300px;
						}
						
						.type-select {
							width: 120px;
						}
					}
				}
				
				.list-container {
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
						
						.el-button {
							margin: 0;
						}
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
</style>
