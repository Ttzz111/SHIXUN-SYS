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
			<!-- 分页（上方） -->
			<div class="pagination-container top">
				<el-pagination
					v-model:current-page="page.currentPage"
					v-model:page-size="page.pageSize"
					:page-sizes="[12, 24, 36, 48]"
					layout="total, sizes, prev, pager, next, jumper"
					:total="page.total"
					@size-change="onSizeChange"
					@current-change="onCurrentChange"
					background
					:pager-count="5"
				/>
			</div>

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
									<el-icon><view /></el-icon>
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
				<el-select v-model="resourceForm.categoryId" placeholder="请选择资源分类" style="width: 100%">
					<el-option
						v-for="item in categoryList"
						:key="item.id"
						:label="item.name"
						:value="item.id"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="资源类型" prop="type">
				<el-select v-model="resourceForm.type" placeholder="请选择资源类型" style="width: 100%">
					<el-option
						v-for="item in resourceTypes"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="资源描述">
				<el-input v-model="resourceForm.description" type="textarea" rows="3" placeholder="请输入资源描述"></el-input>
			</el-form-item>
			<el-form-item label="资源文件" prop="file">
				<el-upload
					class="resource-upload"
					drag
					action="#"
					:auto-upload="false"
					:limit="1"
					:on-change="handleFileChange"
				>
					<el-icon class="el-icon--upload"><upload-filled /></el-icon>
					<div class="el-upload__text">拖拽文件到此处 或 <em>点击上传</em></div>
					<template #tip>
						<div class="el-upload__tip">
							请上传资源文件，大小不超过50MB
						</div>
					</template>
				</el-upload>
			</el-form-item>
			<el-form-item label="资源封面">
				<el-upload
					class="cover-uploader"
					action="#"
					:show-file-list="false"
					:auto-upload="false"
					:on-change="handleCoverChange"
				>
					<div class="cover-preview">
						<img v-if="resourceForm.coverUrl" :src="resourceForm.coverUrl" class="avatar" />
						<div v-else class="cover-placeholder">
							<el-icon><plus /></el-icon>
							<span>上传封面</span>
						</div>
					</div>
				</el-upload>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitResourceForm">提交</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Search, Calendar, View, Refresh, Plus, UploadFilled, Delete, Download, User } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import dayjs from 'dayjs';
import { checkPerm } from '/$/base/utils/permission';
import { useStorage } from '@vueuse/core';

// const { service } = useCool();
// const { user, menu } = useBase();

// 使用持久化存储资源数据
const resourceCache = useStorage('resource-data-cache', null);

// 获取用户信息
const { user } = useBase();

// 判断当前用户是否为管理员
const isAdmin = computed(() => {
	return user.info?.username === 'admin';
});

// 检查当前用户是否有资源管理权限
const hasResourceManagePermission = computed(() => {
	return isAdmin.value || checkPerm('resource/management');
});

// 检查当前用户是否有资源上传权限
const hasResourceUploadPermission = computed(() => {
	return isAdmin.value || checkPerm('resource/upload');
});

// 检查当前用户是否有资源删除权限
const hasResourceDeletePermission = computed(() => {
	return isAdmin.value || checkPerm('resource/delete');
});

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

// 对话框相关
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const resourceForm = reactive({
	name: '',
	categoryId: undefined,
	type: '',
	description: '',
	file: null as File | null,
	coverUrl: ''
});

// 表单验证规则
const rules = {
	name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
	categoryId: [{ required: true, message: '请选择资源分类', trigger: 'change' }],
	type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
	file: [{ required: true, message: '请上传资源文件', trigger: 'change' }]
};

// 批量选择相关
const multipleSelection = computed(() => {
	return list.value.filter(item => item.selected);
});

// 是否已选中
function isSelected(item: any) {
	return item.selected;
}

// 切换选择状态
function toggleSelection(item: any) {
	if (hasResourceDeletePermission.value) {
		item.selected = !item.selected;
	}
}

// 删除资源ID存储
const deletedResourceIds = useStorage('resource-deleted-ids', [] as number[]);

// 批量删除
function onBatchDelete() {
	if (multipleSelection.value.length === 0) {
		ElMessage.warning('请至少选择一项');
		return;
	}

	const names = multipleSelection.value.map(item => item.name).join('、');
	
	ElMessageBox.confirm(
		`确定要删除 ${multipleSelection.value.length} 项资源吗？包括：${names.length > 50 ? names.substring(0, 50) + '...' : names}`,
		'批量删除',
		{
			confirmButtonText: '确定删除',
			cancelButtonText: '取消',
			type: 'warning',
			closeOnClickModal: false
		}
	).then(() => {
		// 显示加载
		loading.value = true;
		
		// 模拟删除请求
		setTimeout(() => {
			// 获取选中项的ID列表
			const ids = multipleSelection.value.map(item => item.id);
			
			// 存储已删除的资源ID到本地存储
			deletedResourceIds.value = [...new Set([...deletedResourceIds.value, ...ids])];
			
			// 从列表中移除选中项
			list.value = list.value.filter(item => !ids.includes(item.id));
			
			// 更新总数
			page.total = Math.max(0, page.total - ids.length);
			
			// 如果当前页已经没有数据，且不是第一页，则跳转到上一页
			if (list.value.length === 0 && page.currentPage > 1) {
				page.currentPage--;
				getResourceList();
			}
			
			loading.value = false;
			ElMessage.success(`已删除 ${ids.length} 项资源`);
		}, 800);
	}).catch(() => {
		ElMessage.info('已取消删除');
	});
}

// 存储页面状态
const savePageState = () => {
	const state = {
		categoryId: categoryId.value,
		resourceType: resourceType.value,
		search: search.keyword,
		page: page.currentPage,
		pageSize: page.pageSize
	};
	useStorage('resource-category-state', state).value = state;
};

// 获取页面状态
const getPageState = () => {
	const state = useStorage('resource-category-state', {
		categoryId: 0,
		resourceType: '',
		search: '',
		page: 1,
		pageSize: 12
	}).value;
	
	categoryId.value = state.categoryId;
	resourceType.value = state.resourceType;
	search.keyword = state.search;
	page.currentPage = state.page;
	page.pageSize = state.pageSize;
};

// 为资源类型标签提供不同颜色
function getTagType(type: string): '' | 'success' | 'warning' | 'danger' | 'info' {
	switch (type) {
		case 'document':
			return 'primary';
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
	// 重置表单
	resetResourceForm();
	// 显示对话框
	dialogVisible.value = true;
}

// 重置资源表单
function resetResourceForm() {
	resourceForm.name = '';
	resourceForm.categoryId = undefined;
	resourceForm.type = '';
	resourceForm.description = '';
	resourceForm.file = null;
	resourceForm.coverUrl = '';
	
	// 重置表单验证
	if (formRef.value) {
		formRef.value.resetFields();
	}
}

// 删除资源
function onDeleteResource(item: any) {
	ElMessageBox.confirm(
		`确定要删除资源 "${item.name}" 吗？此操作不可逆。`,
		'警告',
		{
			confirmButtonText: '确定删除',
			cancelButtonText: '取消',
			type: 'warning',
			closeOnClickModal: false
		}
	).then(() => {
		// 显示加载
		loading.value = true;
		
		// 模拟后端删除请求
		setTimeout(() => {
			// 存储已删除的资源ID到本地存储
			deletedResourceIds.value = [...new Set([...deletedResourceIds.value, item.id])];
			
			// 从列表中移除该项
			const index = list.value.findIndex(i => i.id === item.id);
			if (index !== -1) {
				list.value.splice(index, 1);
			}
			
			// 重新计算总数
			page.total = Math.max(0, page.total - 1);
			
			// 如果当前页已经没有数据，且不是第一页，则跳转到上一页
			if (list.value.length === 0 && page.currentPage > 1) {
				page.currentPage--;
				getResourceList();
			}
			
			loading.value = false;
			ElMessage.success(`已删除资源: ${item.name}`);
		}, 800);
	}).catch(() => {
		ElMessage.info('已取消删除');
	});
}

// 处理文件变化
function handleFileChange(file: any) {
	resourceForm.file = file.raw;
}

// 处理封面变化
function handleCoverChange(file: any) {
	// 显示图片预览
	resourceForm.coverUrl = URL.createObjectURL(file.raw);
}

// 提交表单
function submitResourceForm() {
	formRef.value?.validate((valid) => {
		if (valid) {
			// 表单验证通过，提交数据
			loading.value = true;
			
			// 模拟提交
			setTimeout(() => {
				ElMessage.success('资源添加成功');
				dialogVisible.value = false;
				getResourceList();
				loading.value = false;
			}, 1000);
		} else {
			ElMessage.error('请完善表单信息');
			return false;
		}
	});
}

// 生成模拟数据
function generateMockData() {
	// 检查是否已生成过资源数据
	if (!resourceCache.value) {
		// 首次生成数据
		const resourceTypeValues = resourceTypes.value.map(item => item.value);
		const allResources = [];
		const TOTAL_RESOURCES = 86;
		
		// 生成固定的资源数据集
		for (let i = 0; i < TOTAL_RESOURCES; i++) {
			const id = i + 1;
			const typeIndex = i % resourceTypeValues.length;
			const categoryIndex = i % categoryList.value.length;
			const type = resourceTypeValues[typeIndex];
			const category = categoryList.value[categoryIndex];
			
			allResources.push({
				id,
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
				fileSize: Math.floor(Math.random() * 10000),
				selected: false
			});
		}
		
		// 保存到缓存
		resourceCache.value = allResources;
	}
	
	// 从缓存获取基础数据
	const allResources = resourceCache.value || [];
	
	// 获取已删除的资源ID
	const deletedIds = deletedResourceIds.value || [];
	
	// 应用筛选条件获取匹配资源
	let matchingResources = allResources.filter(resource => {
		// 跳过已删除的资源
		if (deletedIds.includes(resource.id)) {
			return false;
		}
		
		// 应用筛选条件
		const matchesCategory = categoryId.value === 0 || categoryId.value === resource.categoryId;
		const matchesType = resourceType.value === '' || resourceType.value === resource.type;
		const matchesKeyword = !search.keyword || resource.name.includes(search.keyword);
		
		return matchesCategory && matchesType && matchesKeyword;
	});
	
	console.log('筛选条件:', {
		categoryId: categoryId.value,
		resourceType: resourceType.value,
		keyword: search.keyword
	});
	console.log('匹配资源数量:', matchingResources.length);
	
	// 计算分页
	const filteredTotal = matchingResources.length;
	const startIndex = (page.currentPage - 1) * page.pageSize;
	const endIndex = startIndex + page.pageSize;
	
	// 获取当前页数据
	const pageData = matchingResources.slice(startIndex, endIndex);
	
	return {
		list: pageData,
		pagination: {
			total: filteredTotal,
			page: page.currentPage,
			size: page.pageSize
		}
	};
}

// 获取资源列表
async function getResourceList() {
	loading.value = true;

	try {
		const mockData = generateMockData();
		list.value = mockData.list;
		page.total = mockData.pagination.total;
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

// 资源预览
function onPreviewResource(item: any) {
	// 根据资源类型选择不同的预览方式
	switch(item.type) {
		case 'image':
			// 图片预览
			const imgUrl = item.url || item.coverUrl;
			ElMessageBox.alert(
				`<div style="text-align: center"><img src="${imgUrl}" style="max-width: 100%; max-height: 500px;" /></div>`,
				'图片预览',
				{
					dangerouslyUseHTMLString: true,
					showClose: true,
					showCancelButton: false,
					confirmButtonText: '关闭'
				}
			);
			break;
			
		case 'video':
			// 视频预览
			ElMessageBox.alert(
				`<div style="text-align: center">
					<video controls style="max-width: 100%; max-height: 500px;">
						<source src="${item.url}" type="video/mp4">
						您的浏览器不支持视频标签
					</video>
				</div>`,
				'视频预览',
				{
					dangerouslyUseHTMLString: true,
					showClose: true,
					showCancelButton: false,
					confirmButtonText: '关闭'
				}
			);
			break;
			
		case 'audio':
			// 音频预览
			ElMessageBox.alert(
				`<div style="text-align: center">
					<audio controls style="width: 100%;">
						<source src="${item.url}" type="audio/mpeg">
						您的浏览器不支持音频标签
					</audio>
				</div>`,
				'音频预览',
				{
					dangerouslyUseHTMLString: true,
					showClose: true,
					showCancelButton: false,
					confirmButtonText: '关闭'
				}
			);
			break;
			
		case 'document':
		case 'archive':
		default:
			// 显示资源信息
			ElMessageBox.alert(
				`<div>
					<p><strong>资源名称：</strong>${item.name}</p>
					<p><strong>资源类型：</strong>${getResourceTypeName(item.type)}</p>
					<p><strong>资源大小：</strong>${formatFileSize(item.fileSize)}</p>
					<p><strong>上传时间：</strong>${formatDate(item.createTime)}</p>
					<p><strong>资源描述：</strong>${item.description || '暂无描述'}</p>
				</div>`,
				'资源预览',
				{
					dangerouslyUseHTMLString: true,
					showClose: true,
					showCancelButton: false,
					confirmButtonText: '关闭'
				}
			);
			break;
	}
	
	// 更新查看次数
	if (!item._viewed) {
		item.viewCount = (item.viewCount || 0) + 1;
		item._viewed = true;
	}
}

// 资源下载
function onDownloadResource(item: any) {
	// 模拟下载功能
	if (item.url && item.url !== '#') {
		// 创建一个临时链接
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = item.url;
		a.download = item.name + getFileExtension(item.type);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		
		// 更新下载次数
		item.downloadCount = (item.downloadCount || 0) + 1;
		
		ElMessage.success(`正在下载: ${item.name}`);
	} else {
		// 模拟下载行为
		ElMessage({
			message: `下载已开始: ${item.name}${getFileExtension(item.type)}`,
			type: 'success',
			duration: 2000
		});
		
		// 更新下载次数
		item.downloadCount = (item.downloadCount || 0) + 1;
		
		// 模拟下载完成通知
		setTimeout(() => {
			ElMessage({
				message: `下载完成: ${item.name}`,
				type: 'success'
			});
		}, 1500);
	}
}

// 获取文件扩展名
function getFileExtension(type: string): string {
	switch(type) {
		case 'document': return '.doc';
		case 'video': return '.mp4';
		case 'image': return '.jpg';
		case 'audio': return '.mp3';
		case 'archive': return '.zip';
		default: return '';
	}
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

// 组件挂载后加载数据
onMounted(() => {
	// 恢复之前的筛选条件和页面状态
	getPageState();
	getResourceList();
});

// 添加清空删除记录的方法(可在控制台调用此函数恢复所有删除的资源)
function clearDeletedResources() {
	ElMessageBox.confirm(
		'确定要清空所有删除记录吗？这将恢复所有已删除的资源。',
		'恢复已删除资源',
		{
			confirmButtonText: '确定恢复',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		deletedResourceIds.value = [];
		ElMessage.success('已清空删除记录，资源已恢复');
		getResourceList();
	}).catch(() => {
		ElMessage.info('已取消操作');
	});
}

// 添加清空数据缓存的方法(可用于开发测试)
function resetAllResources() {
	ElMessageBox.confirm(
		'确定要重置所有资源数据吗？这将清空缓存并重新生成资源。',
		'重置资源数据',
		{
			confirmButtonText: '确定重置',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		resourceCache.value = null;
		deletedResourceIds.value = [];
		ElMessage.success('资源数据已重置');
		getResourceList();
	}).catch(() => {
		ElMessage.info('已取消操作');
	});
}
</script>

<style lang="scss" scoped>
.resource-category {
	min-height: calc(100vh - 150px);
	position: relative;
	display: flex;
	flex-direction: column;

	.search-box {
		width: 280px;
		
		.search-input {
			:deep(.el-input__wrapper) {
				box-shadow: 0 0 0 1px var(--el-border-color) inset;
			}
		}
	}

	.filter-container {
		margin: 15px 0;
		background-color: var(--el-fill-color-light);
		border-radius: 4px;
		padding: 16px 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

		.filter-item {
			margin-bottom: 12px;
			display: flex;
			align-items: flex-start;

			&:last-child {
				margin-bottom: 0;
			}

			.filter-label {
				font-weight: 500;
				width: 90px;
				flex-shrink: 0;
				line-height: 32px;
				color: var(--el-text-color-secondary);
			}

			.filter-options {
				flex: 1;
				display: flex;
				flex-wrap: wrap;
				gap: 8px;

				.category-tag {
					cursor: pointer;
					transition: all 0.3s;
					
					&.active {
						transform: scale(1.05);
					}
					
					&:hover {
						transform: translateY(-2px);
					}
				}
			}
		}
	}

	.resource-list-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 250px);
		overflow-y: auto;
		
		.pagination-container {
			padding: 10px 0;
			margin-bottom: 10px;
			
			&.top {
				position: sticky;
				top: 0;
				z-index: 10;
				background-color: var(--el-bg-color);
				box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
				border-radius: 4px;
			}
		}
		
		.resource-list {
			margin: 0 -10px;
			
			.el-col {
				padding: 10px;
			}
		}
		
		.resource-card {
			height: 100%;
			transition: all 0.3s;
			border-radius: 8px;
			overflow: hidden;
			
			&:hover {
				transform: translateY(-5px);
				box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
				
				.resource-cover {
					.resource-hover-info {
						opacity: 1;
					}
					
					img {
						transform: scale(1.05);
					}
				}
			}
			
			&.is-selected {
				border: 2px solid var(--el-color-primary);
			}
			
			.resource-cover {
				position: relative;
				height: 160px;
				overflow: hidden;
				cursor: pointer;
				
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
					background-color: var(--el-color-info);
					color: #fff;
					padding: 4px 10px;
					font-size: 12px;
					border-bottom-left-radius: 8px;
					font-weight: 500;
					z-index: 2;
					
					&.type-document {
						background-color: var(--el-color-primary);
					}
					
					&.type-video {
						background-color: var(--el-color-danger);
					}
					
					&.type-image {
						background-color: var(--el-color-success);
					}
					
					&.type-audio {
						background-color: var(--el-color-warning);
					}
					
					&.type-archive {
						background-color: var(--el-color-info);
					}
				}
				
				.selection-mark {
					position: absolute;
					top: 10px;
					left: 10px;
					z-index: 2;
					
					:deep(.el-checkbox__inner) {
						border-color: #fff;
						background-color: rgba(255, 255, 255, 0.3);
					}
				}
				
				.resource-hover-info {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
					padding: 15px 10px 8px;
					opacity: 0;
					transition: opacity 0.3s;
					z-index: 1;
					
					.hover-stats {
						display: flex;
						justify-content: space-between;
						
						.stat-item {
							color: #fff;
							display: flex;
							align-items: center;
							font-size: 12px;
							
							.el-icon {
								margin-right: 4px;
								font-size: 14px;
							}
						}
					}
				}
			}
			
			.resource-info {
				padding: 16px;
				
				.resource-title {
					font-size: 16px;
					font-weight: 500;
					margin-bottom: 8px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					color: var(--el-text-color-primary);
				}
				
				.resource-desc {
					font-size: 13px;
					color: var(--el-text-color-secondary);
					margin-bottom: 12px;
					height: 38px;
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
							margin-right: 4px;
							font-size: 14px;
						}
					}
				}
			}
			
			.resource-actions {
				padding: 0 16px 16px;
				display: flex;
				justify-content: space-around;
				border-top: 1px solid var(--el-border-color-lighter);
				padding-top: 12px;
				margin-top: -4px;
				
				.el-button {
					flex: 1;
					
					.el-icon {
						font-size: 18px;
					}
				}
			}
		}
	}
}

// 通用分页容器样式
.pagination-container {
	display: flex;
	justify-content: center;
	width: 100%;
	overflow-x: auto;
	
	:deep(.el-pagination) {
		padding: 0;
		margin: 0;
		font-weight: normal;
		white-space: nowrap;
		
		.el-pagination__total {
			margin-right: 16px;
		}
		
		.el-pagination__sizes {
			margin-right: 16px;
		}
	}
}

.resource-upload {
	width: 100%;
	
	:deep(.el-upload-dragger) {
		width: 100%;
		height: 180px;
	}
}

.cover-uploader {
	.cover-preview {
		width: 178px;
		height: 178px;
		border: 1px dashed var(--el-border-color);
		border-radius: 6px;
		overflow: hidden;
		
		img {
			width: 100%;
			height: 100%;
			display: block;
			object-fit: cover;
		}
		
		.cover-placeholder {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			color: var(--el-text-color-secondary);
			cursor: pointer;
			
			.el-icon {
				font-size: 32px;
				margin-bottom: 8px;
			}
		}
	}
}
</style>