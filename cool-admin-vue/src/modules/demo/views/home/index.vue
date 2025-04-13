<template>
	<el-scrollbar>
		<div class="training-home">
			<div class="welcome-banner">
				<h1>工程实训学习与实践管理系统</h1>
				<p>为师生提供一站式工程实训管理平台，促进理论与实践的结合</p>
			</div>

			<el-row :gutter="20">
				<el-col :lg="6" :md="12" :xs="24">
					<div class="stat-card">
						<div class="card-header">
							<span>学生总数</span>
							<cl-svg name="team" class="icon" />
						</div>
						<div class="card-value">
							<cl-number :value="stats.students" class="num" />
							<span class="trend up">+12% <el-icon><arrow-up /></el-icon></span>
						</div>
					</div>
				</el-col>
				<el-col :lg="6" :md="12" :xs="24">
					<div class="stat-card">
						<div class="card-header">
							<span>实训项目</span>
							<cl-svg name="clipboard" class="icon" />
						</div>
						<div class="card-value">
							<cl-number :value="stats.projects" class="num" />
							<span class="trend up">+8% <el-icon><arrow-up /></el-icon></span>
						</div>
					</div>
				</el-col>
				<el-col :lg="6" :md="12" :xs="24">
					<div class="stat-card">
						<div class="card-header">
							<span>任务完成</span>
							<cl-svg name="check" class="icon" />
						</div>
						<div class="card-value">
							<cl-number :value="stats.completedTasks" class="num" />
							<span class="percent">{{stats.completionRate}}%</span>
						</div>
					</div>
				</el-col>
				<el-col :lg="6" :md="12" :xs="24">
					<div class="stat-card">
						<div class="card-header">
							<span>指导教师</span>
							<cl-svg name="user-info" class="icon" />
						</div>
						<div class="card-value">
							<cl-number :value="stats.teachers" class="num" />
							<span class="trend up">+5% <el-icon><arrow-up /></el-icon></span>
						</div>
					</div>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :lg="16" :md="24">
					<div class="chart-card">
						<div class="card-header">
							<h3>实训进度跟踪</h3>
							<el-radio-group v-model="progressType" size="small">
								<el-radio-button label="weekly">周进度</el-radio-button>
								<el-radio-button label="monthly">月进度</el-radio-button>
							</el-radio-group>
						</div>
						<div class="chart-container">
							<!-- 此处放置进度图表 -->
							<div class="placeholder-chart">进度图表区域</div>
						</div>
					</div>
				</el-col>
				<el-col :lg="8" :md="24">
					<div class="chart-card">
						<div class="card-header">
							<h3>项目分类占比</h3>
						</div>
						<div class="chart-container">
							<!-- 此处放置分类饼图 -->
							<div class="placeholder-chart">分类饼图区域</div>
						</div>
					</div>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="24">
					<div class="table-card">
						<div class="card-header">
							<h3>热门实训项目</h3>
							<el-button type="primary" size="small">查看全部</el-button>
						</div>
						<el-table :data="hotProjects" stripe style="width: 100%">
							<el-table-column prop="name" label="项目名称" width="250" />
							<el-table-column prop="department" label="所属院系" width="200" />
							<el-table-column prop="teacher" label="指导教师" width="120" />
							<el-table-column prop="students" label="参与学生" width="100" />
							<el-table-column prop="progress" label="进度">
								<template #default="scope">
									<el-progress :percentage="scope.row.progress" />
								</template>
							</el-table-column>
							<el-table-column prop="status" label="状态" width="100">
								<template #default="scope">
									<el-tag :type="scope.row.statusType">{{ scope.row.status }}</el-tag>
								</template>
							</el-table-column>
						</el-table>
					</div>
				</el-col>
			</el-row>
		</div>
	</el-scrollbar>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ArrowUp } from '@element-plus/icons-vue';

defineOptions({
	name: 'home'
});

// 统计数据
const stats = reactive({
	students: 5462,
	projects: 283,
	completedTasks: 8674,
	completionRate: 72,
	teachers: 143
});

// 进度显示类型
const progressType = ref('weekly');

// 热门项目数据
const hotProjects = ref([
	{
		name: '智能制造工厂数字孪生系统开发',
		department: '机械工程学院',
		teacher: '张教授',
		students: 32,
		progress: 85,
		status: '进行中',
		statusType: 'success'
	},
	{
		name: '新能源汽车电池管理系统设计',
		department: '汽车工程学院',
		teacher: '李教授',
		students: 28,
		progress: 62,
		status: '进行中',
		statusType: 'success'
	},
	{
		name: '物联网智能农业监控平台',
		department: '信息工程学院',
		teacher: '王教授',
		students: 25,
		progress: 45,
		status: '进行中',
		statusType: 'warning'
	},
	{
		name: '基于深度学习的图像识别应用',
		department: '计算机科学学院',
		teacher: '刘教授',
		students: 30,
		progress: 92,
		status: '即将完成',
		statusType: 'primary'
	},
	{
		name: '工业机器人运动控制系统',
		department: '自动化学院',
		teacher: '陈教授',
		students: 22,
		progress: 38,
		status: '进行中',
		statusType: 'warning'
	}
]);
</script>

<style lang="scss">
.training-home {
	padding: 20px;
	
	.welcome-banner {
		background: linear-gradient(135deg, #3a8ee6 0%, #214fbe 100%);
		border-radius: 10px;
		padding: 30px;
		margin-bottom: 20px;
		color: #fff;
		text-align: center;
		
		h1 {
			font-size: 24px;
			margin: 0 0 10px 0;
		}
		
		p {
			margin: 0;
			opacity: 0.9;
		}
	}
	
	.stat-card, .chart-card, .table-card {
		background-color: var(--el-bg-color);
		border-radius: 10px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
	}
	
	.stat-card {
		padding: 20px;
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;
			font-size: 16px;
			
			.icon {
				font-size: 24px;
				color: #3a8ee6;
			}
		}
		
		.card-value {
			display: flex;
			align-items: baseline;
			
			.num {
				font-size: 28px;
				font-weight: bold;
				margin-right: 10px;
			}
			
			.trend {
				display: flex;
				align-items: center;
				font-size: 14px;
				
				&.up {
					color: #67c23a;
				}
				
				&.down {
					color: #f56c6c;
				}
			}
			
			.percent {
				font-size: 18px;
				color: #409eff;
			}
		}
	}
	
	.chart-card, .table-card {
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px 20px;
			border-bottom: 1px solid var(--el-border-color-light);
			
			h3 {
				margin: 0;
				font-size: 16px;
				font-weight: 600;
			}
		}
		
		.chart-container {
			padding: 20px;
			height: 300px;
		}
		
		.placeholder-chart {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: var(--el-fill-color-light);
			border-radius: 6px;
			color: var(--el-text-color-secondary);
		}
	}
	
	.table-card {
		.el-table {
			--el-table-header-bg-color: var(--el-fill-color-light);
		}
	}
}
</style>
