<template>
	<div class="interest-setting page-container">
		<!-- 蓝色横幅Banner -->
		<div class="banner-box">
			<h1>兴趣设置</h1>
			<p>设置您感兴趣的学习领域，获得更精准的资源推荐</p>
		</div>
		
		<!-- 主要内容区域 -->
		<div class="main-content">
			<el-card shadow="never" class="interest-card">
				<template #header>
					<div class="card-header">
						<span>选择您感兴趣的分类</span>
						<el-tooltip content="设置您的兴趣分类后，系统会为您推荐相关资源" placement="top">
							<el-icon><info-filled /></el-icon>
						</el-tooltip>
					</div>
				</template>
				
				<div class="interest-setting-content">
					<p class="interest-tip">您的兴趣偏好将用于个性化推荐学习资源，请选择您感兴趣的领域：</p>
					
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
						<el-button type="primary" @click="saveInterests" :loading="saving">保存设置</el-button>
						<el-button @click="resetInterests">重置</el-button>
					</div>
					
					<div class="recommendation-preview" v-if="previewResources.length > 0">
						<div class="preview-title">
							<span>根据您的兴趣，可能会推荐以下资源：</span>
						</div>
						
						<div class="preview-list">
							<div 
								v-for="resource in previewResources" 
								:key="resource.id"
								class="preview-item"
							>
								<div class="resource-icon">
									<el-icon v-if="resource.type === 'document'"><document /></el-icon>
									<el-icon v-else-if="resource.type === 'image'"><picture /></el-icon>
									<el-icon v-else-if="resource.type === 'video'"><video-camera /></el-icon>
									<el-icon v-else><folder /></el-icon>
								</div>
								<div class="resource-info">
									<div class="resource-name">{{ resource.name }}</div>
									<div class="resource-meta">
										<el-tag size="small" :type="getResourceTypeTag(resource.type)">
											{{ getResourceTypeName(resource.type) }}
										</el-tag>
										<span class="resource-size">{{ formatFileSize(resource.size) }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-card>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { 
	Check, 
	InfoFilled, 
	Document, 
	Picture, 
	VideoCamera, 
	Folder 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useCool } from '/@/cool';
import { useBase } from '/$/base';
import { getResources } from '../utils/indexedDB';
import { setUserInterests, getRecommendedResources } from '../utils/recommendation';

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

// 选中的兴趣分类
const selectedInterests = ref<number[]>([]);

// 推荐预览资源
const previewResources = ref<any[]>([]);

// 保存状态
const saving = ref(false);

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
		if (user.id) {
			setUserInterests(user.id.toString(), selectedInterests.value);
			ElMessage.success('兴趣设置已保存');
			
			// 更新推荐预览
			await updatePreview();
		}
	} catch (error) {
		console.error('保存兴趣设置失败:', error);
		ElMessage.error('保存失败');
	} finally {
		saving.value = false;
	}
}

// 重置兴趣设置
function resetInterests() {
	selectedInterests.value = [];
	previewResources.value = [];
}

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
	if (!size) return '0 B';
	
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

// 更新推荐预览
async function updatePreview() {
	if (selectedInterests.value.length === 0) {
		previewResources.value = [];
		return;
	}
	
	try {
		if (user.id) {
			// 暂时设置兴趣，不保存到localStorage
			const userId = user.id.toString();
			
			// 获取推荐资源
			const recommendations = await getRecommendedResources(userId, 3);
			previewResources.value = recommendations;
		}
	} catch (error) {
		console.error('获取推荐预览失败:', error);
	}
}

// 加载用户兴趣设置
function loadUserInterests() {
	try {
		const savedInterests = localStorage.getItem('resourceRecommendation:userInterests');
		if (savedInterests) {
			const userInterests = JSON.parse(savedInterests);
			if (user.id && userInterests[user.id]) {
				selectedInterests.value = userInterests[user.id];
			}
		}
	} catch (error) {
		console.error('加载兴趣设置失败:', error);
	}
}

// 监听兴趣变化
watch(selectedInterests, async () => {
	await updatePreview();
}, { deep: true });

// 页面加载时初始化
onMounted(() => {
	loadUserInterests();
	updatePreview();
});
</script>

<style lang="scss" scoped>
.interest-setting {
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
	
	.main-content {
		.interest-card {
			border-radius: 12px;
			
			:deep(.el-card__header) {
				padding: 15px 20px;
				border-bottom: 1px solid #ebeef5;
				
				.card-header {
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 16px;
					font-weight: 500;
					
					.el-icon {
						color: #909399;
					}
				}
			}
			
			.interest-setting-content {
				padding: 10px 0;
				
				.interest-tip {
					color: #606266;
					margin-bottom: 20px;
				}
				
				.category-selection {
					display: flex;
					flex-wrap: wrap;
					gap: 15px;
					margin-bottom: 30px;
					
					.category-item {
						position: relative;
						width: calc(33.33% - 10px);
						height: 60px;
						background-color: #f5f7fa;
						border-radius: 8px;
						display: flex;
						align-items: center;
						justify-content: center;
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
								top: 5px;
								right: 5px;
								color: #1890ff;
							}
						}
					}
				}
				
				.action-buttons {
					display: flex;
					justify-content: center;
					gap: 15px;
					margin-bottom: 30px;
				}
				
				.recommendation-preview {
					background-color: #f9f9f9;
					border-radius: 8px;
					padding: 15px;
					
					.preview-title {
						font-size: 14px;
						font-weight: 500;
						color: #606266;
						margin-bottom: 15px;
					}
					
					.preview-list {
						display: flex;
						flex-direction: column;
						gap: 10px;
						
						.preview-item {
							display: flex;
							align-items: center;
							gap: 10px;
							padding: 10px;
							background-color: white;
							border-radius: 6px;
							
							.resource-icon {
								display: flex;
								align-items: center;
								justify-content: center;
								width: 40px;
								height: 40px;
								border-radius: 6px;
								background-color: #f5f7fa;
								
								.el-icon {
									color: #409EFF;
								}
							}
							
							.resource-info {
								flex: 1;
								min-width: 0;
								
								.resource-name {
									font-size: 14px;
									font-weight: 500;
									color: #303133;
									margin-bottom: 5px;
									overflow: hidden;
									text-overflow: ellipsis;
									white-space: nowrap;
								}
								
								.resource-meta {
									display: flex;
									align-items: center;
									gap: 8px;
									
									.resource-size {
										color: #909399;
										font-size: 12px;
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
</style> 