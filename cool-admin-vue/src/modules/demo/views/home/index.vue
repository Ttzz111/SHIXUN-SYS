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
							<div ref="progressChartRef" class="progress-chart"></div>
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
							<div ref="categoryChartRef" class="category-chart"></div>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { ArrowUp } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

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

// 图表DOM引用
const progressChartRef = ref<HTMLElement | null>(null);
const categoryChartRef = ref<HTMLElement | null>(null);

// 图表实例
let progressChart: echarts.ECharts | null = null;
let categoryChart: echarts.ECharts | null = null;

// 周进度数据
const weeklyProgressData = [
	['2023-06-01', 30],
	['2023-06-08', 42],
	['2023-06-15', 55],
	['2023-06-22', 68],
	['2023-06-29', 72],
	['2023-07-06', 80],
	['2023-07-13', 85]
];

// 月进度数据
const monthlyProgressData = [
	['2023-01', 15],
	['2023-02', 25],
	['2023-03', 35],
	['2023-04', 45],
	['2023-05', 60],
	['2023-06', 72],
	['2023-07', 85]
];

// 项目分类数据
const categoryData = [
	{ value: 35, name: '软件开发' },
	{ value: 25, name: '硬件设计' },
	{ value: 20, name: '数据分析' },
	{ value: 15, name: '人工智能' },
	{ value: 5, name: '其他项目' }
];

// 监听进度类型变化，更新图表
watch(progressType, (newValue) => {
	if (progressChart) {
		updateProgressChart();
	}
});

// 初始化进度图表
function initProgressChart() {
	if (progressChartRef.value) {
		progressChart = echarts.init(progressChartRef.value);
		updateProgressChart();
		
		// 响应窗口大小变化
		window.addEventListener('resize', () => {
			progressChart?.resize();
		});
	}
}

// 更新进度图表数据
function updateProgressChart() {
	const data = progressType.value === 'weekly' ? weeklyProgressData : monthlyProgressData;
	const option = {
		tooltip: {
			trigger: 'axis',
			formatter: '{b}<br />{a}: {c}%'
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: data.map(item => item[0])
		},
		yAxis: {
			type: 'value',
			max: 100,
			axisLabel: {
				formatter: '{value}%'
			}
		},
		series: [
			{
				name: '完成率',
				type: 'line',
				data: data.map(item => item[1]),
				smooth: true,
				lineStyle: {
					width: 3,
					shadowColor: 'rgba(0,0,0,0.2)',
					shadowBlur: 10
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(58,142,230,0.6)' },
						{ offset: 1, color: 'rgba(58,142,230,0.1)' }
					])
				},
				itemStyle: {
					color: '#3a8ee6'
				}
			}
		]
	};
	
	progressChart?.setOption(option);
}

// 初始化分类图表
function initCategoryChart() {
	if (categoryChartRef.value) {
		categoryChart = echarts.init(categoryChartRef.value);
		
		const option = {
			tooltip: {
				trigger: 'item',
				formatter: '{a} <br/>{b}: {c} ({d}%)'
			},
			legend: {
				orient: 'vertical',
				left: 10,
				data: categoryData.map(item => item.name)
			},
			series: [
				{
					name: '项目分类',
					type: 'pie',
					radius: ['40%', '70%'],
					center: ['60%', '50%'],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 10,
						borderColor: '#fff',
						borderWidth: 2
					},
					label: {
						show: false,
						position: 'center'
					},
					emphasis: {
						label: {
							show: true,
							fontSize: '18',
							fontWeight: 'bold'
						}
					},
					labelLine: {
						show: false
					},
					data: categoryData
				}
			],
			color: ['#3a8ee6', '#4ecb73', '#fbd437', '#f56c6c', '#909399']
		};
		
		categoryChart.setOption(option);
		
		// 响应窗口大小变化
		window.addEventListener('resize', () => {
			categoryChart?.resize();
		});
	}
}

// 热门项目数据
const hotProjects = ref([
	{
		name: '智能制造工厂数字孪生系统开发',
		department: '人工智能与数据科学学院',
		teacher: '梁教授',
		students: 32,
		progress: 85,
		status: '进行中',
		statusType: 'success'
	},
	{
		name: '凝胶体3D打印机设计制作',
		department: '人工智能与数据科学学院',
		teacher: '梁教授',
		students: 28,
		progress: 62,
		status: '进行中',
		statusType: 'success'
	},
	{
		name: '陶艺制作与体验',
		department: '人工智能与数据科学学院',
		teacher: '王教授',
		students: 25,
		progress: 45,
		status: '进行中',
		statusType: 'warning'
	},
	{
		name: '工程训练IA',
		department: '人工智能与数据科学学院',
		teacher: '王教授',
		students: 30,
		progress: 92,
		status: '即将完成',
		statusType: 'primary'
	},
	{
		name: '工程训练II',
		department: '人工智能与数据科学学院',
		teacher: '刘教授',
		students: 22,
		progress: 38,
		status: '进行中',
		statusType: 'warning'
	}
]);

onMounted(() => {
	initProgressChart();
	initCategoryChart();
});
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
			font-size: 28px;
			margin-bottom: 10px;
		}
		
		p {
			font-size: 16px;
			opacity: 0.8;
		}
	}
	
	.el-row {
		margin-bottom: 20px;
	}
	
	.stat-card {
		background-color: #fff;
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15px;
			
			span {
				font-size: 16px;
				color: #606266;
			}
			
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
				color: #303133;
				margin-right: 10px;
			}
			
			.trend {
				font-size: 14px;
				display: flex;
				align-items: center;
				
				&.up {
					color: #67c23a;
				}
				
				&.down {
					color: #f56c6c;
				}
				
				.el-icon {
					margin-left: 5px;
				}
			}
			
			.percent {
				font-size: 16px;
				color: #409eff;
				margin-left: 5px;
			}
		}
	}
	
	.chart-card {
		background-color: #fff;
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			
			h3 {
				font-size: 16px;
				font-weight: bold;
				color: #303133;
				margin: 0;
			}
		}
		
		.chart-container {
			height: 350px;
			
			.progress-chart, .category-chart {
				width: 100%;
				height: 100%;
			}
		}
	}
	
	.table-card {
		background-color: #fff;
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			
			h3 {
				font-size: 16px;
				font-weight: bold;
				color: #303133;
				margin: 0;
			}
		}
	}
}
</style>
