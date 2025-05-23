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
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
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

// 对话框相关
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const resourceForm = reactive({
	name: '',
	description: '',
	type: 'document',
	categoryId: null,
	coverUrl: '',
	file: null
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
	// 重置表单
	resourceForm.name = '';
	resourceForm.type = resourceTypes.value[0].value;
	resourceForm.categoryId = categoryList.value[0].id;
	resourceForm.description = '';
	resourceForm.file = null;
	resourceForm.coverUrl = '';
	
	// 显示对话框
	dialogVisible.value = true;
	
	// 等待DOM更新后重置表单验证状态
	nextTick(() => {
		if (formRef.value) {
			formRef.value.resetFields();
		}
	});
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

// 文件上传变化处理
function handleFileChange(file) {
	if (!file) return;
	let raw = file.raw || file.file;
	if (!raw) return;

	// 文件大小校验（500MB）
	const isLt500M = raw.size / 1024 / 1024 < 500;
	if (!isLt500M) {
		ElMessage.error('文件大小不能超过 500MB!');
		return;
	}
	resourceForm.file = raw;

	// 图片类型，直接用图片本地URL
	if (raw.type.startsWith('image/')) {
		resourceForm.coverUrl = URL.createObjectURL(raw);
	}
	// 视频类型，自动生成首帧
	else if (raw.type.startsWith('video/')) {
		getVideoCover(raw).then(base64 => {
			resourceForm.coverUrl = base64;
		});
	}
	// 其他类型，清空封面
	else {
		resourceForm.coverUrl = '';
	}
}

// 获取视频首帧
function getVideoCover(file) {
	return new Promise((resolve) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.muted = true;
		video.src = URL.createObjectURL(file);
		video.currentTime = 0.1;
		video.onloadeddata = function () {
			const canvas = document.createElement('canvas');
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL('image/png'));
		};
		video.onerror = function () {
			resolve('');
		};
	});
}

// 提交表单
async function submitResourceForm() {
	if (!formRef.value) return;
	
	// 手动检查文件是否已上传
	if (!resourceForm.file) {
		ElMessage.error('请上传资源文件');
		return;
	}
	
	formRef.value.validate(async (valid) => {
		if (valid) {
			loading.value = true;
			
			try {
				// 创建FormData对象用于文件上传
				const formData = new FormData();
				formData.append('name', resourceForm.name);
				formData.append('categoryId', resourceForm.categoryId.toString());
				formData.append('type', resourceForm.type);
				formData.append('description', resourceForm.description || '');
				formData.append('file', resourceForm.file);
				
				if (resourceForm.coverUrl && resourceForm.coverUrl.startsWith('data:')) {
					// 将Base64转换为Blob
					const coverBlob = await dataURLtoBlob(resourceForm.coverUrl);
					formData.append('cover', coverBlob, 'cover.jpg');
				}
				
				// 显示上传进度
				ElMessage.info('文件上传中...');
				
				// 实际项目中，应调用后端API上传文件，例如：
				// const res = await service.resource.upload(formData);
				
				// 模拟文件上传过程
				setTimeout(async () => {
					// 为新资源生成ID
					let maxId = 0;
					
					if (resourceCache.value && Array.isArray(resourceCache.value)) {
						const existingIds = resourceCache.value.map(item => item.id);
						maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
					}
					
					const newId = maxId + 1;
					
					// 生成URL
					let fileUrl = '#';
					try {
						// 创建资源URL
						fileUrl = URL.createObjectURL(resourceForm.file);
					} catch (e) {
						console.error('创建URL失败:', e);
						fileUrl = '#';
					}
					
					// 构建新资源数据
					const newResource = {
						id: newId,
						name: resourceForm.name,
						description: resourceForm.description || `这是资源${newId}的详细描述`,
						type: resourceForm.type,
						categoryId: resourceForm.categoryId,
						categoryName: categoryList.value.find(item => item.id === resourceForm.categoryId)?.name || '未分类',
						url: fileUrl,
						coverUrl: resourceForm.coverUrl || `https://picsum.photos/300/200?random=${newId}`,
						viewCount: 0,
						downloadCount: 0,
						createTime: new Date().toISOString(),
						author: user.info?.username || '当前用户',
						fileSize: resourceForm.file ? resourceForm.file.size : 0,
						fileName: resourceForm.file ? resourceForm.file.name : '',
						selected: false,
						realFile: true // 标记为真实文件
					};
					
					console.log('添加真实资源:', newResource);
					
					// 将新资源添加到缓存
					if (resourceCache.value && Array.isArray(resourceCache.value)) {
						resourceCache.value = [newResource, ...resourceCache.value];
					} else {
						resourceCache.value = [newResource];
					}
					
					// 关闭对话框
					dialogVisible.value = false;
					
					// 重新加载资源列表
					getResourceList();
					
					ElMessage.success('资源上传成功');
					loading.value = false;
				}, 1500);
			} catch (err) {
				console.error('添加资源失败:', err);
				ElMessage.error('添加资源失败: ' + (err.message || '未知错误'));
				loading.value = false;
			}
		} else {
			ElMessage.warning('请完善表单信息');
			return false;
		}
	});
}

// 将Base64转换为Blob对象
function dataURLtoBlob(dataURL: string): Promise<Blob> {
	return new Promise((resolve, reject) => {
		try {
			// 将base64分割为mime类型和数据部分
			const arr = dataURL.split(',');
			const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
			const bstr = atob(arr[1]);
			let n = bstr.length;
			const u8arr = new Uint8Array(n);
			
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			
			resolve(new Blob([u8arr], { type: mime }));
		} catch (e) {
			reject(e);
		}
	});
}

// 根据MIME类型判断文件类型
function getFileTypeFromMime(mimeType: string): string {
	if (!mimeType) return 'other';
	
	if (mimeType.startsWith('image/')) {
		return 'image';
	} else if (mimeType.startsWith('video/')) {
		return 'video';
	} else if (mimeType.startsWith('audio/')) {
		return 'audio';
	} else if (
		mimeType.includes('pdf') || 
		mimeType.includes('word') || 
		mimeType.includes('document') || 
		mimeType.includes('excel') || 
		mimeType.includes('text/')
	) {
		return 'document';
	} else if (
		mimeType.includes('zip') || 
		mimeType.includes('compressed') || 
		mimeType.includes('archive') ||
		mimeType.includes('rar')
	) {
		return 'archive';
	}
	return 'other';
}

// 生成模拟数据
function generateMockData() {
	// 检查是否已生成过资源数据
	if (!resourceCache.value || !Array.isArray(resourceCache.value)) {
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
	const allResources = Array.isArray(resourceCache.value) ? resourceCache.value : [];
	
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
	if (item.type === 'video') {
		// 视频预览
		currentVideoUrl.value = item.url;
		videoPreviewDialog.value = true;
	} else if (item.type === 'image') {
		// 图片预览
		ElMessageBox.alert('<img src="' + item.coverUrl + '" style="max-width:100%;" />', '图片预览', {
			dangerouslyUseHTMLString: true,
			showConfirmButton: false,
			callback: () => {}
		});
	} else {
		// 其他类型，使用新窗口打开
		window.open(item.url, '_blank');
	}
}

// 资源下载
function onDownloadResource(item: any) {
	// 检查是否为真实文件
	if (item.realFile && item.url && item.url !== '#') {
		// 创建一个临时链接下载真实文件
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = item.url;
		a.download = item.fileName || (item.name + getFileExtension(item.type));
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

// 示例资源数据
const allResources = [
	{
		id: 1,
		name: '工程训练IA基础教程',
		type: 'document',
		categoryId: 101,
		url: 'https://example.com/doc1',
		coverUrl: 'https://picsum.photos/300/200?random=1',
		description: '工程训练IA的基础理论与实践指导文档',
		viewCount: 245,
		downloadCount: 120,
		author: '张教授',
		createTime: '2025-04-15T10:30:00',
		fileSize: 15360,
		selected: false
	},
	{
		id: 2,
		name: '激光加工实训视频教程',
		type: 'video',
		categoryId: 202,
		url: 'https://example.com/video1',
		coverUrl: 'https://picsum.photos/300/200?random=2',
		description: '激光加工基本操作与安全规范详细视频教程',
		viewCount: 562,
		downloadCount: 210,
		author: '李教授',
		createTime: '2025-04-15T14:25:00',
		fileSize: 512000,
		selected: false
	},
	{
		id: 3,
		name: '工程训练II学习指南',
		type: 'document',
		categoryId: 102,
		url: 'https://example.com/doc2',
		coverUrl: 'https://picsum.photos/300/200?random=3',
		description: '工程训练II的核心概念与实践方法总结',
		viewCount: 321,
		downloadCount: 180,
		author: '王教授',
		createTime: '2025-04-15T09:15:00',
		fileSize: 8192,
		selected: false
	},
	{
		id: 4,
		name: '陶艺制作流程图解',
		type: 'image',
		categoryId: 201,
		url: 'https://example.com/image1',
		coverUrl: 'https://picsum.photos/300/200?random=4',
		description: '陶艺制作全流程高清图解与要点说明',
		viewCount: 410,
		downloadCount: 195,
		author: '刘老师',
		createTime: '2025-04-15T16:40:00',
		fileSize: 25600,
		selected: false
	},
	{
		id: 5,
		name: 'VR设备操作视频教程',
		type: 'video',
		categoryId: 301,
		url: 'https://example.com/video2',
		coverUrl: 'https://picsum.photos/300/200?random=5',
		description: '虚拟仿真设备的操作方法与注意事项',
		viewCount: 628,
		downloadCount: 315,
		author: '赵教授',
		createTime: '2025-04-15T11:20:00',
		fileSize: 768000,
		selected: false
	},
	{
		id: 6,
		name: '工程训练III实验报告模板',
		type: 'document',
		categoryId: 103,
		url: 'https://example.com/doc3',
		coverUrl: 'https://picsum.photos/300/200?random=6',
		description: '标准实验报告模板与填写指南',
		viewCount: 289,
		downloadCount: 156,
		author: '陈教授',
		createTime: '2025-04-15T13:45:00',
		fileSize: 10240,
		selected: false
	},
	{
		id: 7,
		name: '精工细铸工艺展示',
		type: 'image',
		categoryId: 203,
		url: 'https://example.com/image2',
		coverUrl: 'https://picsum.photos/300/200?random=7',
		description: '精工细铸工艺过程高清图片集',
		viewCount: 378,
		downloadCount: 245,
		author: '周老师',
		createTime: '2025-04-15T15:30:00',
		fileSize: 30720,
		selected: false
	},
	{
		id: 8,
		name: '工程认知训练音频讲解',
		type: 'audio',
		categoryId: 105,
		url: 'https://example.com/audio1',
		coverUrl: 'https://picsum.photos/300/200?random=8',
		description: '工程认知训练课程音频讲解',
		viewCount: 156,
		downloadCount: 98,
		author: '吴教授',
		createTime: '2025-04-15T10:15:00',
		fileSize: 25600,
		selected: false
	},
	{
		id: 9,
		name: '工程训练IV资料包',
		type: 'archive',
		categoryId: 104,
		url: 'https://example.com/zip1',
		coverUrl: 'https://picsum.photos/300/200?random=9',
		description: '工程训练IV全套学习资料',
		viewCount: 432,
		downloadCount: 267,
		author: '郑教授',
		createTime: '2025-04-15T14:50:00',
		fileSize: 102400,
		selected: false
	},
	{
		id: 10,
		name: '激光加工创新作品集',
		type: 'image',
		categoryId: 202,
		url: 'https://example.com/image3',
		coverUrl: 'https://picsum.photos/300/200?random=10',
		description: '学生激光加工创新作品展示',
		viewCount: 567,
		downloadCount: 289,
		author: '林老师',
		createTime: '2025-04-15T16:20:00',
		fileSize: 40960,
		selected: false
	}
];

// 加载数据
const loadData = () => {
	loading.value = true;
	
	// 模拟API请求延迟
	setTimeout(() => {
		// 应用分类和类型过滤
		let filteredData = [...allResources];
		
		// 按分类筛选
		if (categoryId.value !== 0) {
			const targetCategory = categoryList.value.find(c => c.id === categoryId.value);
			if (targetCategory) {
				// 获取该分类下的所有子分类
				const subCats = subcategories.value.filter(s => s.parentId === targetCategory.id);
				const subCatIds = subCats.map(s => s.id);
				filteredData = filteredData.filter(r => subCatIds.includes(r.categoryId));
			}
		}
		
		// 按类型筛选
		if (resourceType.value) {
			filteredData = filteredData.filter(r => r.type === resourceType.value);
		}
		
		// 关键字搜索
		if (search.keyword) {
			const keyword = search.keyword.toLowerCase();
			filteredData = filteredData.filter(r => 
				r.name.toLowerCase().includes(keyword) || 
				(r.description && r.description.toLowerCase().includes(keyword))
			);
		}
		
		// 更新分页信息
		page.total = filteredData.length;
		
		// 分页处理
		const startIndex = (page.currentPage - 1) * page.pageSize;
		const endIndex = startIndex + page.pageSize;
		list.value = filteredData.slice(startIndex, endIndex);
		
		loading.value = false;
	}, 500);
};

// 获取资源分类名称
const getResourceCategoryName = (categoryId) => {
	const subCategory = subcategories.value.find(c => c.id === categoryId);
	if (subCategory) {
		const parentCategory = categoryList.value.find(c => c.id === subCategory.parentId);
		return `${parentCategory ? parentCategory.name + ' - ' : ''}${subCategory.name}`;
	}
	return '未分类';
};

// 计算过滤后的子分类
const filteredSubcategories = computed(() => {
	if (categoryId.value === 0) return [];
	return subcategories.value.filter(item => item.parentId === categoryId.value);
});

// 选择子分类
const onSubCategorySelect = (id) => {
	subCategoryId.value = id;
	// 根据选择的子分类进行过滤
	if (id === 0) {
		loadData();
		return;
	}
	
	loading.value = true;
	// 模拟API请求延迟
	setTimeout(() => {
		// 应用分类和类型过滤
		let filteredData = [...allResources];
		
		// 按子分类筛选
		filteredData = filteredData.filter(r => r.categoryId === id);
		
		// 按类型筛选
		if (resourceType.value) {
			filteredData = filteredData.filter(r => r.type === resourceType.value);
		}
		
		// 关键字搜索
		if (search.keyword) {
			const keyword = search.keyword.toLowerCase();
			filteredData = filteredData.filter(r => 
				r.name.toLowerCase().includes(keyword) || 
				(r.description && r.description.toLowerCase().includes(keyword))
			);
		}
		
		// 更新分页信息
		page.total = filteredData.length;
		
		// 分页处理
		const startIndex = (page.currentPage - 1) * page.pageSize;
		const endIndex = startIndex + page.pageSize;
		list.value = filteredData.slice(startIndex, endIndex);
		
		loading.value = false;
	}, 500);
};

// 视频预览对话框
const videoPreviewDialog = ref(false);
const currentVideoUrl = ref('');

// 构建分类选项层级结构
const categoryOptions = computed(() => {
	return categoryList.value.map(category => {
		const children = subcategories.value
			.filter(sub => sub.parentId === category.id)
			.map(sub => ({
				id: sub.id,
				name: sub.name,
				parentId: sub.parentId
			}));
			
		return {
			id: category.id,
			name: category.name,
			children
		};
	});
});

// 获取资源分类名称
const getCategoryName = (id) => {
	const subcat = subcategories.value.find(c => c.id === id);
	if (!subcat) return '未分类';
	
	const maincat = categoryList.value.find(c => c.id === subcat.parentId);
	if (!maincat) return subcat.name;
	
	return `${maincat.name} - ${subcat.name}`;
};
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