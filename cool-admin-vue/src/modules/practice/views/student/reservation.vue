<template>
	<div class="practice-student-reservation page-container">
		<div class="page-header">
			<h2>我的实践预约</h2>
			<div class="action-buttons">
				<el-button type="primary" @click="refreshReservations">
					<el-icon><refresh /></el-icon>
					刷新
				</el-button>
			</div>
		</div>
		
		<!-- 预约状态卡片 -->
		<div class="reservation-statistics">
			<el-row :gutter="20">
				<el-col :span="6">
					<el-card shadow="hover" class="statistic-card statistic-card--pending">
						<div class="card-content">
							<div class="number">{{ statistics.pending }}</div>
							<div class="title">待审核</div>
						</div>
						<el-icon class="card-icon"><clock /></el-icon>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card shadow="hover" class="statistic-card statistic-card--approved">
						<div class="card-content">
							<div class="number">{{ statistics.approved }}</div>
							<div class="title">已通过</div>
						</div>
						<el-icon class="card-icon"><check /></el-icon>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card shadow="hover" class="statistic-card statistic-card--rejected">
						<div class="card-content">
							<div class="number">{{ statistics.rejected }}</div>
							<div class="title">已拒绝</div>
						</div>
						<el-icon class="card-icon"><close /></el-icon>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card shadow="hover" class="statistic-card statistic-card--completed">
						<div class="card-content">
							<div class="number">{{ statistics.completed }}</div>
							<div class="title">已完成</div>
						</div>
						<el-icon class="card-icon"><check-circle /></el-icon>
					</el-card>
				</el-col>
			</el-row>
		</div>
		
		<!-- 预约列表 -->
		<div class="reservation-list" v-loading="loading">
			<el-tabs v-model="activeTab" @tab-click="handleTabClick">
				<el-tab-pane label="全部预约" name="all"></el-tab-pane>
				<el-tab-pane label="待审核" name="pending"></el-tab-pane>
				<el-tab-pane label="已通过" name="approved"></el-tab-pane>
				<el-tab-pane label="已拒绝" name="rejected"></el-tab-pane>
				<el-tab-pane label="已取消" name="canceled"></el-tab-pane>
				<el-tab-pane label="已完成" name="completed"></el-tab-pane>
			</el-tabs>
			
			<el-empty description="暂无预约记录" v-if="filteredReservations.length === 0" />
			
			<div v-else class="reservation-cards">
				<el-card 
					v-for="reservation in filteredReservations" 
					:key="reservation.id"
					class="reservation-card"
					shadow="hover"
					:class="getReservationClass(reservation.status)"
				>
					<template #header>
						<div class="card-header">
							<div class="activity-name">{{ getActivityName(reservation.activityId) }}</div>
							<div class="reservation-status" :class="getStatusClass(reservation.status)">
								{{ getStatusText(reservation.status) }}
							</div>
						</div>
					</template>
					
					<div class="reservation-info">
						<div class="info-row">
							<span class="label"><el-icon><calendar /></el-icon> 活动时间：</span>
							<span class="value">{{ getActivityTime(reservation.activityId) }}</span>
						</div>
						<div class="info-row">
							<span class="label"><el-icon><location /></el-icon> 活动地点：</span>
							<span class="value">{{ getActivityLocation(reservation.activityId) }}</span>
						</div>
						<div class="info-row">
							<span class="label"><el-icon><clock /></el-icon> 预约时间：</span>
							<span class="value">{{ formatDateTime(reservation.reservationTime) }}</span>
						</div>
						<div class="info-row" v-if="reservation.comment">
							<span class="label"><el-icon><document /></el-icon> 预约留言：</span>
							<span class="value">{{ reservation.comment }}</span>
						</div>
						<div class="info-row" v-if="reservation.feedback">
							<span class="label"><el-icon><message /></el-icon> 审核意见：</span>
							<span class="value">{{ reservation.feedback }}</span>
						</div>
						<div class="info-row" v-if="reservation.cancelReason">
							<span class="label"><el-icon><warning /></el-icon> 取消原因：</span>
							<span class="value">{{ reservation.cancelReason }}</span>
						</div>
					</div>
					
					<div class="reservation-actions">
						<el-button 
							v-if="reservation.status === 1" 
							type="danger" 
							size="small"
							@click="cancelReservation(reservation)"
						>
							取消预约
						</el-button>
						<el-button 
							v-if="reservation.status === 2" 
							type="primary" 
							size="small"
							@click="redirectToActivities"
						>
							重新预约
						</el-button>
						<el-button 
							v-if="reservation.status === 1 && isActivityStartingSoon(reservation.activityId)" 
							type="warning" 
							size="small"
						>
							即将开始
						</el-button>
					</div>
				</el-card>
			</div>
		</div>
		
		<!-- 取消预约对话框 -->
		<el-dialog
			v-model="cancelDialog.visible"
			title="取消预约"
			width="500px"
		>
			<div v-loading="cancelDialog.loading">
				<el-alert
					title="取消预约后，如活动名额已满，可能无法再次预约"
					type="warning"
					:closable="false"
					style="margin-bottom: 20px"
				/>
				
				<el-form :model="cancelForm" :rules="cancelRules" ref="cancelFormRef" label-width="100px">
					<el-form-item label="活动名称">
						<el-input v-model="cancelDialog.activityName" disabled />
					</el-form-item>
					<el-form-item label="取消原因" prop="reason">
						<el-input
							v-model="cancelForm.reason"
							type="textarea"
							rows="3"
							placeholder="请说明取消预约的原因"
						/>
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="cancelDialog.visible = false">取消</el-button>
					<el-button type="danger" @click="confirmCancel" :loading="cancelDialog.loading">
						确认取消预约
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import {
	Refresh,
	Clock,
	Check,
	Close,
	CheckCircle,
	Calendar,
	Location,
	Document,
	Message,
	Warning
} from '@element-plus/icons-vue';

const router = useRouter();

// 模拟活动数据
const activities = [
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
		status: 1
	}
];

// 模拟预约数据
const reservations = ref([
	{
		id: 1,
		activityId: 1,
		studentId: 1, // 当前学生
		reservationTime: '2025-04-12 14:30:00',
		status: 1, // 已通过
		comment: '希望能学习到更多工程基础知识',
		feedback: '审核通过，请按时参加'
	},
	{
		id: 2,
		activityId: 2,
		studentId: 1, // 当前学生
		reservationTime: '2025-04-14 11:20:00',
		status: 0, // 待审核
		comment: '对精密铸造技术很感兴趣',
		feedback: ''
	},
	{
		id: 3,
		activityId: 3,
		studentId: 1, // 当前学生
		reservationTime: '2025-04-15 09:45:00',
		status: 2, // 已拒绝
		comment: '希望学习激光加工技术',
		feedback: '该活动名额已满，请选择其他活动'
	},
	{
		id: 4,
		activityId: 4,
		studentId: 1, // 当前学生
		reservationTime: '2025-04-16 11:20:00',
		status: 3, // 已取消
		comment: '想体验VR技术在工程中的应用',
		feedback: '',
		cancelReason: '时间冲突，无法参加'
	},
	{
		id: 5,
		activityId: 1,
		studentId: 1, // 当前学生
		reservationTime: '2025-03-05 10:00:00',
		status: 4, // 已完成
		comment: '希望能掌握工程训练的基本技能',
		feedback: '已完成活动，表现良好'
	}
]);

// 当前用户ID（模拟数据）
const currentUserId = 1;

// 状态
const loading = ref(false);
const activeTab = ref('all');

// 取消预约对话框
const cancelDialog = reactive({
	visible: false,
	loading: false,
	activityName: '',
	reservation: null as any
});

// 取消表单
const cancelForm = reactive({
	reason: ''
});

// 取消表单验证规则
const cancelRules = {
	reason: [
		{ required: true, message: '请输入取消原因', trigger: 'blur' },
		{ max: 200, message: '取消原因不能超过200个字符', trigger: 'blur' }
	]
};

// 统计信息
const statistics = computed(() => {
	const myReservations = reservations.value.filter(r => r.studentId === currentUserId);
	return {
		total: myReservations.length,
		pending: myReservations.filter(r => r.status === 0).length,
		approved: myReservations.filter(r => r.status === 1).length,
		rejected: myReservations.filter(r => r.status === 2).length,
		canceled: myReservations.filter(r => r.status === 3).length,
		completed: myReservations.filter(r => r.status === 4).length
	};
});

// 根据标签筛选预约
const filteredReservations = computed(() => {
	const myReservations = reservations.value.filter(r => r.studentId === currentUserId);
	
	// 根据选项卡过滤
	if (activeTab.value === 'all') {
		return myReservations;
	} else if (activeTab.value === 'pending') {
		return myReservations.filter(r => r.status === 0);
	} else if (activeTab.value === 'approved') {
		return myReservations.filter(r => r.status === 1);
	} else if (activeTab.value === 'rejected') {
		return myReservations.filter(r => r.status === 2);
	} else if (activeTab.value === 'canceled') {
		return myReservations.filter(r => r.status === 3);
	} else if (activeTab.value === 'completed') {
		return myReservations.filter(r => r.status === 4);
	}
	
	return myReservations;
});

// 处理标签点击
const handleTabClick = () => {
	// 可以在这里添加额外逻辑
};

// 获取活动名称
const getActivityName = (activityId) => {
	const activity = activities.find(a => a.id === activityId);
	return activity ? activity.name : '未知活动';
};

// 获取活动时间
const getActivityTime = (activityId) => {
	const activity = activities.find(a => a.id === activityId);
	if (!activity) return '未知时间';
	
	return `${formatDate(activity.startTime)} ${formatTime(activity.startTime)}-${formatTime(activity.endTime)}`;
};

// 获取活动地点
const getActivityLocation = (activityId) => {
	const activity = activities.find(a => a.id === activityId);
	return activity ? activity.location : '未知地点';
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

// 格式化日期时间
const formatDateTime = (dateStr) => {
	return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

// 获取状态文本
const getStatusText = (status) => {
	switch (status) {
		case 0: return '待审核';
		case 1: return '已通过';
		case 2: return '已拒绝';
		case 3: return '已取消';
		case 4: return '已完成';
		default: return '未知状态';
	}
};

// 获取状态样式
const getStatusClass = (status) => {
	switch (status) {
		case 0: return 'status-pending';
		case 1: return 'status-approved';
		case 2: return 'status-rejected';
		case 3: return 'status-canceled';
		case 4: return 'status-completed';
		default: return '';
	}
};

// 获取预约卡片样式
const getReservationClass = (status) => {
	switch (status) {
		case 0: return 'card-pending';
		case 1: return 'card-approved';
		case 2: return 'card-rejected';
		case 3: return 'card-canceled';
		case 4: return 'card-completed';
		default: return '';
	}
};

// 判断活动是否即将开始（7天内）
const isActivityStartingSoon = (activityId) => {
	const activity = activities.find(a => a.id === activityId);
	if (!activity) return false;
	
	const now = new Date();
	const activityStartTime = new Date(activity.startTime);
	const diffDays = Math.ceil((activityStartTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	
	return diffDays >= 0 && diffDays <= 7;
};

// 取消预约
const cancelReservation = (reservation) => {
	const activity = activities.find(a => a.id === reservation.activityId);
	
	cancelDialog.reservation = reservation;
	cancelDialog.activityName = activity ? activity.name : '未知活动';
	cancelDialog.visible = true;
	cancelForm.reason = '';
};

// 确认取消预约
const confirmCancel = () => {
	if (!cancelForm.reason.trim()) {
		ElMessage.warning('请输入取消原因');
		return;
	}
	
	cancelDialog.loading = true;
	
	// 模拟取消预约
	setTimeout(() => {
		const index = reservations.value.findIndex(r => r.id === cancelDialog.reservation.id);
		if (index !== -1) {
			reservations.value[index].status = 3;
			reservations.value[index].cancelReason = cancelForm.reason;
			
			// 恢复活动名额
			const activityIndex = activities.findIndex(a => a.id === cancelDialog.reservation.activityId);
			if (activityIndex !== -1) {
				activities[activityIndex].remainingQuota++;
			}
		}
		
		cancelDialog.loading = false;
		cancelDialog.visible = false;
		
		ElMessage.success('预约已取消');
	}, 1000);
};

// 跳转到活动列表
const redirectToActivities = () => {
	router.push('/practice/student/activity');
};

// 刷新预约列表
const refreshReservations = () => {
	loading.value = true;
	
	// 模拟刷新
	setTimeout(() => {
		loading.value = false;
		ElMessage.success('刷新成功');
	}, 800);
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
.practice-student-reservation {
	padding: 20px;
	
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		
		h2 {
			margin: 0;
			font-size: 22px;
			font-weight: 600;
		}
	}
	
	.reservation-statistics {
		margin-bottom: 20px;
		
		.statistic-card {
			height: 120px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20px;
			transition: all 0.3s;
			
			&:hover {
				transform: translateY(-5px);
			}
			
			.card-content {
				.number {
					font-size: 32px;
					font-weight: bold;
					margin-bottom: 8px;
				}
				
				.title {
					font-size: 14px;
					color: #606266;
				}
			}
			
			.card-icon {
				font-size: 48px;
				opacity: 0.2;
			}
			
			&--pending {
				.number, .card-icon {
					color: #909399;
				}
				background-color: #f4f4f5;
			}
			
			&--approved {
				.number, .card-icon {
					color: #67c23a;
				}
				background-color: #f0f9eb;
			}
			
			&--rejected {
				.number, .card-icon {
					color: #f56c6c;
				}
				background-color: #fef0f0;
			}
			
			&--completed {
				.number, .card-icon {
					color: #409eff;
				}
				background-color: #ecf5ff;
			}
		}
	}
	
	.reservation-list {
		background-color: #fff;
		border-radius: 4px;
		padding: 20px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
		min-height: 400px;
		
		.reservation-cards {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
			gap: 20px;
			margin-top: 20px;
			
			.reservation-card {
				transition: all 0.3s;
				
				&:hover {
					transform: translateY(-5px);
					box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
				}
				
				&.card-pending {
					border-left: 5px solid #909399;
				}
				
				&.card-approved {
					border-left: 5px solid #67c23a;
				}
				
				&.card-rejected {
					border-left: 5px solid #f56c6c;
				}
				
				&.card-canceled {
					border-left: 5px solid #e6a23c;
				}
				
				&.card-completed {
					border-left: 5px solid #409eff;
				}
				
				.card-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.activity-name {
						font-size: 16px;
						font-weight: bold;
						color: #303133;
					}
					
					.reservation-status {
						padding: 4px 8px;
						border-radius: 4px;
						font-size: 12px;
						color: #fff;
						
						&.status-pending {
							background-color: #909399;
						}
						
						&.status-approved {
							background-color: #67c23a;
						}
						
						&.status-rejected {
							background-color: #f56c6c;
						}
						
						&.status-canceled {
							background-color: #e6a23c;
						}
						
						&.status-completed {
							background-color: #409eff;
						}
					}
				}
				
				.reservation-info {
					.info-row {
						display: flex;
						margin-bottom: 10px;
						
						.label {
							display: flex;
							align-items: center;
							width: 100px;
							color: #606266;
							font-weight: bold;
							
							.el-icon {
								margin-right: 5px;
							}
						}
						
						.value {
							flex: 1;
							color: #303133;
						}
					}
				}
				
				.reservation-actions {
					display: flex;
					justify-content: flex-end;
					margin-top: 15px;
					gap: 10px;
				}
			}
		}
	}
}
</style> 