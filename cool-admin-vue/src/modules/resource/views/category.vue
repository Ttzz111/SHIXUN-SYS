<template>
	<div class="resource-category">
		<!-- 顶部搜索栏 -->
		<div class="resource-search">
			<el-input
				v-model="search.keyword"
				placeholder="请输入资源名称关键词"
				clearable
				@keyup.enter="onSearch"
			>
				<template #append>
					<el-button @click="onSearch">
						<el-icon>
							<search />
						</el-icon>
					</el-button>
				</template>
			</el-input>
		</div>

		<!-- 分类筛选栏 -->
		<div class="resource-filter">
			<div class="filter-item">
				<span class="label">资源分类：</span>
				<div class="options">
					<el-tag
						:effect="categoryId === 0 ? 'dark' : 'plain'"
						@click="onCategorySelect(0)"
						class="category-tag"
					>
						全部
					</el-tag>
					<el-tag
						v-for="item in categoryList"
						:key="item.id"
						:effect="categoryId === item.id ? 'dark' : 'plain'"
						@click="onCategorySelect(item.id)"
						class="category-tag"
					>
						{{ item.name }}
					</el-tag>
				</div>
			</div>
			<div class="filter-item">
				<span class="label">资源类型：</span>
				<div class="options">
					<el-tag
						:effect="resourceType === '' ? 'dark' : 'plain'"
						@click="onTypeSelect('')"
						class="category-tag"
					>
						全部
					</el-tag>
					<el-tag
						v-for="item in resourceTypes"
						:key="item.value"
						:effect="resourceType === item.value ? 'dark' : 'plain'"
						@click="onTypeSelect(item.value)"
						class="category-tag"
					>
						{{ item.label }}
					</el-tag>
				</div>
			</div>
		</div>

		<!-- 资源列表 -->
		<div class="resource-list" v-loading="loading">
			<el-empty description="暂无数据" v-if="list.length === 0"></el-empty>
			
			<el-row :gutter="20" v-else>
				<el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(item, index) in list" :key="index">
					<el-card class="resource-card" :body-style="{ padding: '0px' }">
						<div class="resource-cover">
							<img :src="getResourceCover(item)" alt="资源封面" />
							<div class="resource-type">{{ getResourceTypeName(item.type) }}</div>
						</div>
						<div class="resource-info">
							<div class="resource-title">{{ item.name }}</div>
							<div class="resource-desc">{{ item.description || '暂无描述' }}</div>
							<div class="resource-meta">
								<div class="meta-item">
									<el-icon><calendar /></el-icon>
									<span>{{ formatDate(item.createTime) }}</span>
								</div>
								<div class="meta-item">
									<el-icon><view /></el-icon>
									<span>{{ item.viewCount || 0 }}</span>
								</div>
							</div>
						</div>
						<div class="resource-actions">
							<el-button type="primary" @click="onPreviewResource(item)">预览</el-button>
							<el-button type="success" @click="onDownloadResource(item)">下载</el-button>
						</div>
					</el-card>
				</el-col>
			</el-row>
			
			<!-- 分页 -->
			<div class="resource-pagination">
				<el-pagination
					v-model:current-page="page.currentPage"
					v-model:page-size="page.pageSize"
					:page-sizes="[12, 24, 36, 48]"
					layout="total, sizes, prev, pager, next, jumper"
					:total="page.total"
					@size-change="onSizeChange"
					@current-change="onCurrentChange"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Calendar, View } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';

const { service } = useCool();

// 搜索条件
const search = reactive({
	keyword: ''
});

// 分类筛选
const categoryId = ref(0);
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
const categoryList = ref<any[]>([
	{ id: 1, name: '教学文档' },
	{ id: 2, name: '实训资料' },
	{ id: 3, name: '案例分析' },
	{ id: 4, name: '开发工具' },
	{ id: 5, name: '参考代码' }
]);

// 资源类型
const resourceTypes = ref([
	{ label: '文档', value: 'document' },
	{ label: '视频', value: 'video' },
	{ label: '图片', value: 'image' },
	{ label: '音频', value: 'audio' },
	{ label: '压缩包', value: 'archive' },
	{ label: '其他', value: 'other' }
]);

// 搜索资源
function onSearch() {
	page.currentPage = 1;
	getResourceList();
}

// 选择分类
function onCategorySelect(id: number) {
	categoryId.value = id;
	page.currentPage = 1;
	getResourceList();
}

// 选择资源类型
function onTypeSelect(type: string) {
	resourceType.value = type;
	page.currentPage = 1;
	getResourceList();
}

// 页码变化
function onCurrentChange(val: number) {
	page.currentPage = val;
	getResourceList();
}

// 每页数量变化
function onSizeChange(val: number) {
	page.pageSize = val;
	page.currentPage = 1;
	getResourceList();
}

// 获取资源列表
async function getResourceList() {
	loading.value = true;

	try {
		// 模拟数据，实际开发时应从后端获取
		// const res = await service.resource.category.page({
		// 	page: page.currentPage,
		// 	size: page.pageSize,
		// 	categoryId: categoryId.value || undefined,
		// 	type: resourceType.value || undefined,
		// 	keyword: search.keyword || undefined
		// });

		// 模拟数据响应
		setTimeout(() => {
			const mockData = generateMockData();
			list.value = mockData.list;
			page.total = mockData.pagination.total;
			loading.value = false;
		}, 500);
	} catch (err) {
		console.error(err);
		loading.value = false;
		ElMessage.error('获取资源列表失败');
	}
}

// 生成模拟数据
function generateMockData() {
	const resourceTypeValues = resourceTypes.value.map(item => item.value);
	const mockList = [];
	const total = 86;
	const startIndex = (page.currentPage - 1) * page.pageSize;
	const endIndex = Math.min(startIndex + page.pageSize, total);

	// 根据筛选条件过滤
	for (let i = startIndex; i < endIndex; i++) {
		const typeIndex = i % resourceTypeValues.length;
		const categoryIndex = i % categoryList.value.length;
		const type = resourceTypeValues[typeIndex];
		const category = categoryList.value[categoryIndex];

		// 过滤条件
		if (
			(categoryId.value !== 0 && categoryId.value !== category.id) ||
			(resourceType.value !== '' && resourceType.value !== type) ||
			(search.keyword && !`资源名称${i + 1}`.includes(search.keyword))
		) {
			continue;
		}

		mockList.push({
			id: i + 1,
			name: `资源名称${i + 1}`,
			description: `这是资源${i + 1}的详细描述，介绍了资源的内容和用途。`,
			type,
			categoryId: category.id,
			categoryName: category.name,
			url: '#',
			coverUrl: `https://picsum.photos/300/200?random=${i}`,
			viewCount: Math.floor(Math.random() * 1000),
			downloadCount: Math.floor(Math.random() * 500),
			createTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
			author: `用户${Math.floor(Math.random() * 10) + 1}`,
			fileSize: Math.floor(Math.random() * 10000)
		});
	}

	return {
		list: mockList,
		pagination: {
			total: total,
			page: page.currentPage,
			size: page.pageSize
		}
	};
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

// 资源预览
function onPreviewResource(item: any) {
	ElMessage.success(`预览资源: ${item.name}`);
	// 实际开发时，根据资源类型打开不同的预览方式
}

// 资源下载
function onDownloadResource(item: any) {
	ElMessage.success(`下载资源: ${item.name}`);
	// 实际开发时，调用下载接口
}

// 组件挂载后加载数据
onMounted(() => {
	getResourceList();
});
</script>

<style lang="scss" scoped>
.resource-category {
	padding: 20px;

	.resource-search {
		margin-bottom: 20px;
	}

	.resource-filter {
		margin-bottom: 20px;
		background-color: #f5f7fa;
		border-radius: 4px;
		padding: 15px;

		.filter-item {
			margin-bottom: 10px;
			display: flex;
			align-items: flex-start;

			&:last-child {
				margin-bottom: 0;
			}

			.label {
				font-weight: bold;
				width: 100px;
				flex-shrink: 0;
				line-height: 32px;
			}

			.options {
				flex: 1;
				display: flex;
				flex-wrap: wrap;
				gap: 10px;

				.category-tag {
					cursor: pointer;
					margin-right: 5px;
					margin-bottom: 5px;
				}
			}
		}
	}

	.resource-list {
		.resource-card {
			margin-bottom: 20px;
			transition: all 0.3s;
			
			&:hover {
				transform: translateY(-5px);
				box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
			}
			
			.resource-cover {
				position: relative;
				height: 150px;
				overflow: hidden;
				
				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.3s;
				}
				
				.resource-type {
					position: absolute;
					top: 0;
					right: 0;
					background-color: rgba(0, 0, 0, 0.6);
					color: #fff;
					padding: 2px 8px;
					font-size: 12px;
					border-bottom-left-radius: 4px;
				}
			}
			
			.resource-info {
				padding: 14px;
				
				.resource-title {
					font-size: 16px;
					font-weight: bold;
					margin-bottom: 8px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				
				.resource-desc {
					font-size: 14px;
					color: #606266;
					margin-bottom: 10px;
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
					color: #909399;
					
					.meta-item {
						display: flex;
						align-items: center;
						
						.el-icon {
							margin-right: 4px;
							font-size: 14px;
						}
					}
				}
			}
			
			.resource-actions {
				padding: 0 14px 14px;
				display: flex;
				justify-content: space-between;
			}
		}
	}
	
	.resource-pagination {
		display: flex;
		justify-content: center;
		margin-top: 30px;
	}
}
</style> 