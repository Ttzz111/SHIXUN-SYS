<template>
	<div class="practice-student-activity page-container">
		<!-- 头部筛选区域 -->
		<div class="filter-container">
			<div class="filter-item">
				<span class="filter-label">分类：</span>
				<div class="filter-options">
					<el-tag
						:effect="selectedCategory === ''" 
						@click="onCategorySelect('')"
						class="category-tag"
						:class="{'active': selectedCategory === ''}"
					>
						全部
					</el-tag>
					<el-tag
						v-for="category in categories"
						:key="category.value"
						:effect="selectedCategory === category.value ? 'dark' : 'plain'"
						@click="onCategorySelect(category.value)"
						class="category-tag"
						:class="{'active': selectedCategory === category.value}"
					>
						{{ category.label }}
					</el-tag>
				</div>
			</div>
			
			<div class="filter-item" v-if="selectedCategory">
				<span class="filter-label">子分类：</span>
				<div class="filter-options">
					<el-tag
						:effect="selectedSubcategory === ''" 
						@click="onSubcategorySelect('')"
						class="category-tag"
						:class="{'active': selectedSubcategory === ''}"
					>
						全部
					</el-tag>
					<el-tag
						v-for="subcategory in filteredSubcategories"
						:key="subcategory.value"
						:effect="selectedSubcategory === subcategory.value ? 'dark' : 'plain'"
						@click="onSubcategorySelect(subcategory.value)"
						class="category-tag"
						:class="{'active': selectedSubcategory === subcategory.value}"
					>
						{{ subcategory.label }}
					</el-tag>
				</div>
			</div>
			
			<div class="filter-item">
				<span class="filter-label">状态：</span>
				<div class="filter-options">
					<el-tag
						:effect="selectedStatus === null" 
						@click="onStatusSelect(null)"
						class="category-tag"
						:class="{'active': selectedStatus === null}"
					>
						全部
					</el-tag>
					<el-tag
						:effect="selectedStatus === 1 ? 'dark' : 'plain'"
						type="success"
						@click="onStatusSelect(1)"
						class="category-tag"
						:class="{'active': selectedStatus === 1}"
					>
						可预约
					</el-tag>
					<el-tag
						:effect="selectedStatus === 0 ? 'dark' : 'plain'"
						type="info"
						@click="onStatusSelect(0)"
						class="category-tag"
						:class="{'active': selectedStatus === 0}"
					>
						已关闭
					</el-tag>
				</div>
			</div>
			
			<div class="search-box">
				<el-input
					v-model="searchKeyword"
					placeholder="搜索实践活动名称"
					clearable
					@keyup.enter="filterActivities"
				>
					<template #prefix>
						<el-icon><search /></el-icon>
					</template>
				</el-input>
				<el-button type="primary" @click="filterActivities">搜索</el-button>
				<el-button @click="resetFilters">重置</el-button>
			</div>
		</div>
		
		<!-- 活动卡片列表 -->
		<div class="activities-container" v-loading="loading">
			<el-empty description="暂无符合条件的实践活动" v-if="filteredActivities.length === 0" />
			
			<div v-else class="activity-grid">
				<el-card
					v-for="activity in filteredActivities"
					:key="activity.id"
					class="activity-card"
					:class="{ 'closed': activity.status === 0, 'full': activity.remainingQuota <= 0 }"
					shadow="hover"
				>
					<div class="activity-status" :class="getStatusClass(activity)">
						{{ getStatusText(activity) }}
					</div>
					
					<div class="activity-header">
						<h3 class="activity-title">{{ activity.name }}</h3>
						<div class="activity-category">
							<el-tag size="small">{{ activity.category }}</el-tag>
							<el-tag size="small" type="info" v-if="activity.subcategory !== activity.category">{{ activity.subcategory }}</el-tag>
						</div>
					</div>
					
					<div class="activity-info">
						<div class="info-item">
							<el-icon><location /></el-icon>
							<span>{{ activity.location }}</span>
						</div>
						<div class="info-item">
							<el-icon><calendar /></el-icon>
							<span>{{ formatDate(activity.startTime) }}</span>
						</div>
						<div class="info-item">
							<el-icon><clock /></el-icon>
							<span>{{ formatTime(activity.startTime) }} - {{ formatTime(activity.endTime) }}</span>
						</div>
						<div class="info-item">
							<el-icon><user /></el-icon>
							<span>名额：{{ activity.quota }}人 (剩余: {{ activity.remainingQuota }}人)</span>
						</div>
					</div>
					
					<div class="activity-description">
						<p>{{ activity.description || '暂无描述' }}</p>
					</div>
					
					<div class="activity-actions">
						<el-button 
							type="primary" 
							@click="openReservationDialog(activity)"
							:disabled="activity.status === 0 || activity.remainingQuota <= 0 || hasReserved(activity.id)"
						>
							{{ getActionButtonText(activity) }}
						</el-button>
					</div>
				</el-card>
			</div>
			
			<!-- 分页 -->
			<div class="pagination-container">
				<el-pagination
					v-model:current-page="currentPage"
					v-model:page-size="pageSize"
					:page-sizes="[8, 16, 24, 32]"
					layout="total, sizes, prev, pager, next, jumper"
					:total="totalActivities"
					@size-change="onPageSizeChange"
					@current-change="onCurrentPageChange"
				/>
			</div>
		</div>
		
		<!-- 预约对话框 -->
		<el-dialog
			v-model="reservationDialog.visible"
			:title="reservationDialog.title"
			width="500px"
		>
			<div class="reservation-form" v-loading="reservationDialog.loading">
				<el-form ref="reservationForm" :model="reservationForm" :rules="reservationRules" label-width="100px">
					<el-form-item label="活动名称">
						<el-input v-model="reservationDialog.activity.name" disabled />
					</el-form-item>
					<el-form-item label="活动时间">
						<el-input :value="getActivityTimeText(reservationDialog.activity)" disabled />
					</el-form-item>
					<el-form-item label="活动地点">
						<el-input v-model="reservationDialog.activity.location" disabled />
					</el-form-item>
					<el-form-item label="备注留言" prop="comment">
						<el-input
							v-model="reservationForm.comment"
							type="textarea"
							rows="3"
							placeholder="请输入预约备注信息，说明参加此次活动的目的或期望"
						/>
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="reservationDialog.visible = false">取消</el-button>
					<el-button type="primary" @click="submitReservation" :loading="reservationDialog.loading">
						确认预约
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Location, Calendar, Clock, User } from '@element-plus/icons-vue';

// 分类数据
const categories = [
	{
		label: '劳动基本技能',
		value: '劳动基本技能',
		children: [
			{ label: '工程训练IA', value: '工程训练IA' },
			{ label: '工程训练II', value: '工程训练II' },
			{ label: '工程训练III', value: '工程训练III' },
			{ label: '工程训练IV', value: '工程训练IV' },
			{ label: '工程认知训练', value: '工程认知训练' }
		]
	},
	{
		label: '体验式劳动教育',
		value: '体验式劳动教育',
		children: [
			{ label: '陶艺制作与体验', value: '陶艺制作与体验' },
			{ label: '激光加工创新训练', value: '激光加工创新训练' },
			{ label: '精工细铸创新实践', value: '精工细铸创新实践' }
		]
	},
	{
		label: '虚拟实训体验',
		value: '虚拟实训体验',
		children: [
			{ label: '虚拟仿真设备VR使用学习', value: '虚拟仿真设备VR使用学习' }
		]
	}
];

// 模拟活动数据
const allActivities = [
	{
		id: 1,
		name: '工程训练IA实践活动',
		category: '劳动基本技能',
		subcategory: '工程训练IA',
		location: '工程实训中心A101',
		startTime: '2025-05-10 08:00:00',
		endTime: '2025-05-10 12:00:00',
		quota: 30,
		remainingQuota: 15,
		description: '基础工程训练实践活动，学习工程基础知识与基本操作',
		status: 1
	},
	{
		id: 2,
		name: '精工细铸创新实践',
		category: '体验式劳动教育',
		subcategory: '精工细铸创新实践',
		location: '工程实训中心B203',
		startTime: '2025-05-15 14:00:00',
		endTime: '2025-05-15 18:00:00',
		quota: 20,
		remainingQuota: 5,
		description: '精工细铸技术实践，体验精密铸造的全过程',
		status: 1
	},
	{
		id: 3,
		name: '激光加工创新训练',
		category: '体验式劳动教育',
		subcategory: '激光加工创新训练',
		location: '工程实训中心C105',
		startTime: '2025-05-20 09:00:00',
		endTime: '2025-05-20 17:00:00',
		quota: 15,
		remainingQuota: 0,
		description: '激光加工创新实践，学习激光加工设备操作与工艺流程',
		status: 1
	},
	{
		id: 4,
		name: '虚拟仿真设备VR使用学习',
		category: '虚拟实训体验',
		subcategory: '虚拟仿真设备VR使用学习',
		location: 'VR实训室D302',
		startTime: '2025-06-01 13:00:00',
		endTime: '2025-06-01 16:00:00',
		quota: 25,
		remainingQuota: 12,
		description: '虚拟现实技术在工程训练中的应用，体验VR工程实训',
		status: 1
	},
	{
		id: 5,
		name: '工程训练II电气实践',
		category: '劳动基本技能',
		subcategory: '工程训练II',
		location: '工程实训中心A203',
		startTime: '2025-06-05 13:30:00',
		endTime: '2025-06-05 17:30:00',
		quota: 20,
		remainingQuota: 20,
		description: '电气工程基础训练，学习电路设计与调试',
		status: 1
	},
	{
		id: 6,
		name: '工程训练III机械加工',
		category: '劳动基本技能',
		subcategory: '工程训练III',
		location: '工程实训中心B101',
		startTime: '2025-06-10 08:30:00',
		endTime: '2025-06-10 16:30:00',
		quota: 15,
		remainingQuota: 10,
		description: '机械加工技术实践，学习车床、铣床等设备操作',
		status: 1
	},
	{
		id: 7,
		name: '陶艺制作基础课程',
		category: '体验式劳动教育',
		subcategory: '陶艺制作与体验',
		location: '艺术中心A105',
		startTime: '2025-06-15 14:00:00',
		endTime: '2025-06-15 17:00:00',
		quota: 12,
		remainingQuota: 8,
		description: '陶艺制作基础技能培训，体验手工陶艺的魅力',
		status: 1
	},
	{
		id: 8,
		name: '工程认知VR体验',
		category: '虚拟实训体验',
		subcategory: '虚拟仿真设备VR使用学习',
		location: 'VR实训室D301',
		startTime: '2025-06-20 09:00:00',
		endTime: '2025-06-20 11:00:00',
		quota: 15,
		remainingQuota: 15,
		description: '通过VR技术体验工厂生产线运作过程',
		status: 0
	},
	{
		id: 9,
		name: '工程训练IV综合实践',
		category: '劳动基本技能',
		subcategory: '工程训练IV',
		location: '工程实训中心C205',
		startTime: '2025-06-25 08:00:00',
		endTime: '2025-06-25 17:00:00',
		quota: 20,
		remainingQuota: 18,
		description: '工程训练综合实践，融合机械、电气、控制等知识',
		status: 1
	},
	{
		id: 10,
		name: '精密铸造高级技术',
		category: '体验式劳动教育',
		subcategory: '精工细铸创新实践',
		location: '工程实训中心B204',
		startTime: '2025-07-01 13:00:00',
		endTime: '2025-07-01 17:00:00',
		quota: 10,
		remainingQuota: 0,
		description: '精密铸造高级技术实践，体验先进铸造工艺',
		status: 1
	}
];

// 模拟预约数据
const myReservations = [
	{
		id: 1,
		activityId: 1,
		studentId: 1, // 当前学生
		reservationTime: '2025-04-12 14:30:00',
		status: 1,
		comment: '希望能学习到更多工程基础知识',
		feedback: '审核通过，请按时参加'
	},
	{
		id: 6,
		activityId: 4,
		studentId: 1, // 当前学生
		reservationTime: '2025-04-16 11:20:00',
		status: 3,
		comment: '想体验VR技术在工程中的应用',
		feedback: '',
		cancelReason: '时间冲突，无法参加'
	}
];

// 当前用户ID（模拟数据）
const currentUserId = 1;

// 筛选条件
const selectedCategory = ref('');
const selectedSubcategory = ref('');
const selectedStatus = ref(null);
const searchKeyword = ref('');

// 分页数据
const currentPage = ref(1);
const pageSize = ref(8);
const loading = ref(false);

// 预约对话框
const reservationDialog = reactive({
	visible: false,
	title: '预约实践活动',
	activity: {} as any,
	loading: false
});

// 预约表单
const reservationForm = reactive({
	activityId: 0,
	comment: ''
});

// 预约表单验证规则
const reservationRules = {
	comment: [
		{ required: true, message: '请输入预约备注信息', trigger: 'blur' },
		{ max: 200, message: '备注不能超过200个字符', trigger: 'blur' }
	]
};

// 计算子分类
const filteredSubcategories = computed(() => {
	if (!selectedCategory.value) return [];
	const category = categories.find(c => c.value === selectedCategory.value);
	return category ? category.children : [];
});

// 筛选活动数据
const filteredActivities = computed(() => {
	let result = [...allActivities];
	
	// 筛选分类
	if (selectedCategory.value) {
		result = result.filter(item => item.category === selectedCategory.value);
		
		// 筛选子分类
		if (selectedSubcategory.value) {
			result = result.filter(item => item.subcategory === selectedSubcategory.value);
		}
	}
	
	// 筛选状态
	if (selectedStatus.value !== null) {
		result = result.filter(item => item.status === selectedStatus.value);
	}
	
	// 搜索关键词
	if (searchKeyword.value) {
		result = result.filter(item => 
			item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
			item.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
		);
	}
	
	// 分页
	const start = (currentPage.value - 1) * pageSize.value;
	const end = start + pageSize.value;
	return result.slice(start, end);
});

// 总活动数
const totalActivities = computed(() => {
	let result = [...allActivities];
	
	// 筛选分类
	if (selectedCategory.value) {
		result = result.filter(item => item.category === selectedCategory.value);
		
		// 筛选子分类
		if (selectedSubcategory.value) {
			result = result.filter(item => item.subcategory === selectedSubcategory.value);
		}
	}
	
	// 筛选状态
	if (selectedStatus.value !== null) {
		result = result.filter(item => item.status === selectedStatus.value);
	}
	
	// 搜索关键词
	if (searchKeyword.value) {
		result = result.filter(item => 
			item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
			item.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
		);
	}
	
	return result.length;
});

// 选择分类
const onCategorySelect = (category) => {
	selectedCategory.value = category;
	selectedSubcategory.value = '';
	currentPage.value = 1;
};

// 选择子分类
const onSubcategorySelect = (subcategory) => {
	selectedSubcategory.value = subcategory;
	currentPage.value = 1;
};

// 选择状态
const onStatusSelect = (status) => {
	selectedStatus.value = status;
	currentPage.value = 1;
};

// 根据筛选条件过滤活动
const filterActivities = () => {
	currentPage.value = 1;
};

// 重置筛选条件
const resetFilters = () => {
	selectedCategory.value = '';
	selectedSubcategory.value = '';
	selectedStatus.value = null;
	searchKeyword.value = '';
	currentPage.value = 1;
};

// 页码变化
const onCurrentPageChange = (page) => {
	currentPage.value = page;
};

// 每页条数变化
const onPageSizeChange = (size) => {
	pageSize.value = size;
	currentPage.value = 1;
};

// 格式化日期
const formatDate = (dateStr) => {
	const date = new Date(dateStr);
	return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 格式化时间
const formatTime = (dateStr) => {
	const date = new Date(dateStr);
	return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 获取活动状态样式
const getStatusClass = (activity) => {
	if (activity.status === 0) return 'status-closed';
	if (activity.remainingQuota <= 0) return 'status-full';
	if (hasReserved(activity.id)) return 'status-reserved';
	return 'status-available';
};

// 获取活动状态文本
const getStatusText = (activity) => {
	if (activity.status === 0) return '已关闭';
	if (activity.remainingQuota <= 0) return '已满';
	if (hasReserved(activity.id)) return '已预约';
	return '可预约';
};

// 获取操作按钮文本
const getActionButtonText = (activity) => {
	if (activity.status === 0) return '已关闭';
	if (activity.remainingQuota <= 0) return '名额已满';
	if (hasReserved(activity.id)) return '已预约';
	return '立即预约';
};

// 检查是否已预约
const hasReserved = (activityId) => {
	return myReservations.some(r => r.activityId === activityId && [0, 1, 4].includes(r.status));
};

// 打开预约对话框
const openReservationDialog = (activity) => {
	reservationDialog.activity = activity;
	reservationDialog.visible = true;
	reservationForm.activityId = activity.id;
	reservationForm.comment = '';
};

// 获取活动时间文本
const getActivityTimeText = (activity) => {
	if (!activity.startTime) return '';
	return `${formatDate(activity.startTime)} ${formatTime(activity.startTime)}-${formatTime(activity.endTime)}`;
};

// 提交预约
const submitReservation = () => {
	reservationDialog.loading = true;
	
	// 模拟提交预约
	setTimeout(() => {
		const newReservation = {
			id: Math.max(...myReservations.map(r => r.id)) + 1,
			activityId: reservationForm.activityId,
			studentId: currentUserId,
			reservationTime: new Date().toLocaleString(),
			status: 0, // 待审核
			comment: reservationForm.comment,
			feedback: ''
		};
		
		myReservations.push(newReservation);
		
		reservationDialog.loading = false;
		reservationDialog.visible = false;
		
		ElMessage.success('预约申请已提交，请等待审核');
	}, 1000);
};

// 组件挂载
onMounted(() => {
	// 模拟加载数据
	loading.value = true;
	setTimeout(() => {
		loading.value = false;
	}, 500);
});
</script>

<style lang="scss" scoped>
.practice-student-activity {
	padding: 20px;
	
	.filter-container {
		margin-bottom: 20px;
		background-color: #fff;
		border-radius: 4px;
		padding: 15px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
		
		.filter-item {
			margin-bottom: 15px;
			display: flex;
			align-items: flex-start;
			
			.filter-label {
				width: 70px;
				font-weight: bold;
				margin-top: 5px;
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
				}
			}
		}
		
		.search-box {
			display: flex;
			gap: 10px;
			margin-top: 20px;
			
			.el-input {
				width: 300px;
			}
		}
	}
	
	.activities-container {
		min-height: 400px;
		
		.activity-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
			gap: 20px;
			margin-bottom: 20px;
			
			.activity-card {
				position: relative;
				transition: all 0.3s;
				
				&:hover {
					transform: translateY(-5px);
					box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
				}
				
				&.closed {
					opacity: 0.7;
				}
				
				.activity-status {
					position: absolute;
					top: 10px;
					right: 10px;
					padding: 2px 8px;
					border-radius: 4px;
					font-size: 12px;
					color: #fff;
					
					&.status-available {
						background-color: #67c23a;
					}
					
					&.status-full {
						background-color: #e6a23c;
					}
					
					&.status-closed {
						background-color: #909399;
					}
					
					&.status-reserved {
						background-color: #409eff;
					}
				}
				
				.activity-header {
					margin-bottom: 15px;
					padding-right: 60px;
					
					.activity-title {
						margin: 0 0 10px 0;
						font-size: 18px;
						font-weight: bold;
						line-height: 1.4;
					}
					
					.activity-category {
						display: flex;
						gap: 5px;
					}
				}
				
				.activity-info {
					margin-bottom: 15px;
					
					.info-item {
						display: flex;
						align-items: center;
						margin-bottom: 8px;
						
						.el-icon {
							margin-right: 8px;
							color: #409eff;
						}
						
						span {
							color: #606266;
						}
					}
				}
				
				.activity-description {
					margin-bottom: 15px;
					color: #606266;
					font-size: 14px;
					line-height: 1.6;
					height: 67px;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					-webkit-box-orient: vertical;
				}
				
				.activity-actions {
					text-align: right;
				}
			}
		}
		
		.pagination-container {
			display: flex;
			justify-content: center;
			margin-top: 20px;
		}
	}
	
	.reservation-form {
		padding: 10px;
	}
}
</style> 