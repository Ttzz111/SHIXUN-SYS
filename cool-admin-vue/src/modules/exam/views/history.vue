<template>
	<div class="history-container">
		<div class="welcome-banner">
			<h1>历史测试记录</h1>
			<p>查看您的历史测试成绩和答题分析</p>
		</div>

		<el-card class="filter-card" shadow="hover">
			<template #header>
				<div class="card-header">
					<span><i class="el-icon-search"></i> 筛选条件</span>
				</div>
			</template>
			<el-form :model="filterForm" label-width="80px" class="filter-form">
				<el-row :gutter="20">
					<el-col :span="8">
						<el-form-item label="试卷名称">
							<el-input v-model="filterForm.paperName" placeholder="请输入试卷名称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="测试时间">
							<el-date-picker
								v-model="filterForm.dateRange"
								type="daterange"
								range-separator="至"
								start-placeholder="开始日期"
								end-placeholder="结束日期"
								style="width: 100%">
							</el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="成绩区间">
							<el-select v-model="filterForm.scoreRange" placeholder="请选择成绩区间" clearable style="width: 100%">
								<el-option label="90分以上" value="90-100"></el-option>
								<el-option label="80-89分" value="80-89"></el-option>
								<el-option label="70-79分" value="70-79"></el-option>
								<el-option label="60-69分" value="60-69"></el-option>
								<el-option label="60分以下" value="0-59"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24" class="filter-buttons">
						<el-button type="primary" @click="searchHistory" icon="el-icon-search">查询</el-button>
						<el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-card class="history-list-card" shadow="hover">
			<template #header>
				<div class="card-header">
					<span><i class="el-icon-document"></i> 历史记录</span>
					<span class="history-count">共 {{ filteredHistory.length }} 条记录</span>
				</div>
			</template>

			<div class="table-scroll-wrapper">
				<el-table :data="filteredHistory" style="width: 100%" border stripe highlight-current-row>
					<el-table-column prop="paperName" label="试卷名称" min-width="200">
						<template #default="scope">
							<div class="paper-name">{{ scope.row.paperName }}</div>
						</template>
					</el-table-column>
					<el-table-column prop="submitTime" label="提交时间" width="180" align="center">
						<template #default="scope">
							<i class="el-icon-time"></i> {{ scope.row.submitTime }}
						</template>
					</el-table-column>
					<el-table-column prop="duration" label="用时" width="120" align="center">
						<template #default="scope">
							{{ scope.row.duration }}
						</template>
					</el-table-column>
					<el-table-column prop="score" label="得分" width="120" align="center">
						<template #default="scope">
							<span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="totalScore" label="总分" width="100" align="center">
						<template #default="scope">
							{{ scope.row.totalScore }}
						</template>
					</el-table-column>
					<el-table-column prop="correctRate" label="正确率" width="120" align="center">
						<template #default="scope">
							<el-progress :percentage="scope.row.correctRate" :color="getProgressColor(scope.row.correctRate)"></el-progress>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" align="center">
						<template #default="scope">
							<el-button type="primary" size="small" @click="viewDetail(scope.row)" icon="el-icon-view">查看详情</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-card>

		<!-- 答题详情对话框 -->
		<el-dialog title="答题详情" v-model="dialogVisible" width="80%" class="answer-detail-dialog">
			<div v-if="currentDetail" class="answer-detail">
				<!-- 总览卡片 -->
				<div class="result-header">
					<h3><i class="el-icon-s-data"></i> {{ currentDetail.paperName }} - 测试结果</h3>
					<div class="score-overview">
						<div class="total-score">
							<div class="score-circle">{{ currentDetail.score }}<span class="total-label">分</span></div>
							<div class="score-label">总分</div>
							<div class="score-percent">
								<i class="el-icon-medal"></i>
								{{ currentDetail.correctRate }}%
							</div>
						</div>
						<div class="score-details">
							<div class="detail-card">
								<i class="el-icon-document"></i>
								<div class="detail-item">
									<div class="detail-value">{{ currentDetail.totalScore }}</div>
									<div class="detail-label">试卷总分</div>
								</div>
							</div>
							<div class="detail-card">
								<i class="el-icon-time"></i>
								<div class="detail-item">
									<div class="detail-value">{{ currentDetail.duration }}</div>
									<div class="detail-label">用时</div>
								</div>
							</div>
							<div class="detail-card">
								<i class="el-icon-check"></i>
								<div class="detail-item">
									<div class="detail-value">{{ currentDetail.correctCount }}</div>
									<div class="detail-label">正确题数</div>
								</div>
							</div>
							<div class="detail-card">
								<i class="el-icon-close"></i>
								<div class="detail-item">
									<div class="detail-value">{{ currentDetail.wrongCount }}</div>
									<div class="detail-label">错误题数</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- 题目详情折叠面板 -->
				<el-collapse accordion class="question-collapse">
					<el-collapse-item v-for="(question, index) in currentDetail.questions" :key="index" :name="index">
						<template #title>
							<div class="question-title-row">
								<span class="question-index">第 {{ index + 1 }} 题</span>
								<span class="question-status" :class="question.isCorrect ? 'correct' : 'wrong'">
									<i :class="question.isCorrect ? 'el-icon-check' : 'el-icon-close'"></i>
									{{ question.isCorrect ? '正确' : '错误' }}
								</span>
							</div>
						</template>
						<div class="question-detail">
							<div class="question-content">{{ question.content }}</div>
							<!-- 选项展示（仅模拟单选题） -->
							<div class="options-list">
								<div v-for="(opt, optIdx) in getOptions(question.content)" :key="optIdx"
									:class="['option-item', getOptionClass(question, optIdx)]">
									<span class="option-prefix">{{ ['A','B','C','D'][optIdx] }}</span> {{ opt }}
									<i v-if="question.correctAnswer === ['A','B','C','D'][optIdx]" class="el-icon-check"></i>
									<i v-else-if="question.userAnswer === ['A','B','C','D'][optIdx] && question.correctAnswer !== ['A','B','C','D'][optIdx]" class="el-icon-close"></i>
								</div>
							</div>
							<div class="answer-explanation">
								<div class="your-answer">
									<strong>你的答案：</strong>
									<span :class="question.isCorrect ? 'correct' : 'wrong'">{{ question.userAnswer }}</span>
								</div>
								<div class="correct-answer">
									<strong>正确答案：</strong>
									<span class="correct">{{ question.correctAnswer }}</span>
								</div>
							</div>
						</div>
					</el-collapse-item>
				</el-collapse>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data() {
		return {
			filterForm: {
				paperName: '',
				dateRange: [],
				scoreRange: ''
			},
			historyList: [],
			dialogVisible: false,
			currentDetail: null
		}
	},
	created() {
		this.loadHistory()
	},
	methods: {
		loadHistory() {
			this.historyList = JSON.parse(localStorage.getItem('examHistory') || '[]')
		},
		searchHistory() {
			// 直接使用计算属性filteredHistory，无需额外操作
		},
		resetForm() {
			this.filterForm = {
				paperName: '',
				dateRange: [],
				scoreRange: ''
			};
		},
		getScoreClass(score) {
			if (score >= 90) return 'score-excellent';
			if (score >= 80) return 'score-good';
			if (score >= 60) return 'score-pass';
			return 'score-fail';
		},
		getProgressColor(percentage) {
			if (percentage >= 90) return '#67C23A';
			if (percentage >= 80) return '#409EFF';
			if (percentage >= 60) return '#E6A23C';
			return '#F56C6C';
		},
		viewDetail(row) {
			this.currentDetail = row;
			this.dialogVisible = true;
		},
		getOptions(content) {
			// 根据题目内容返回选项，实际项目应从题库获取，这里写死
			const map = {
				'在工程实训项目中，需求分析阶段的主要任务是什么？': ['编写代码', '确定软件需要实现的功能', '进行系统测试', '部署软件'],
				'工程实训过程中，关于接口和抽象类的描述，以下哪项是正确的？': ['接口可以包含实现代码，抽象类不能', '一个类可以实现多个接口，但只能继承一个抽象类', '抽象类中的方法必须是抽象的', '接口中不能定义变量'],
				'在工程实训项目的面向对象编程中，下列哪种关系表示\'是一种\'的概念？': ['组合关系', '聚合关系', '继承关系', '依赖关系'],
				'工程实训项目中，以下哪种数据结构适合实现先进先出（FIFO）的操作？': ['栈', '队列', '树', '图'],
				'在工程实训项目的Web开发中，HTTP状态码200表示什么？': ['请求成功', '资源未找到', '服务器错误', '重定向'],
				'工程实训项目中，以下哪个不是关系型数据库管理系统？': ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
				'在工程实训的前端开发中，下列哪个CSS选择器的优先级最高？': ['标签选择器', '类选择器', 'ID选择器', '通配符选择器'],
				'工程实训项目中，以下哪个协议用于安全的网页浏览？': ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
				'在工程实训项目的前端开发中，以下哪个不是JavaScript的数据类型？': ['String', 'Boolean', 'Float', 'Undefined'],
				'工程实训常用的Python中，以下哪个不是内置的数据结构？': ['List', 'Dictionary', 'Set', 'Tree']
			};
			return map[content] || [];
		},
		getOptionClass(question, optIdx) {
			const answerMap = ['A','B','C','D'];
			if (question.correctAnswer === answerMap[optIdx]) return 'correct-option';
			if (question.userAnswer === answerMap[optIdx] && question.correctAnswer !== answerMap[optIdx]) return 'wrong-option';
			if (question.userAnswer === answerMap[optIdx]) return 'user-selected';
			return '';
		}
	},
	computed: {
		filteredHistory() {
			return this.historyList.filter(item => {
				// 试卷名称筛选
				const nameMatch = !this.filterForm.paperName || 
					item.paperName.toLowerCase().includes(this.filterForm.paperName.toLowerCase());
				
				// 日期范围筛选
				let dateMatch = true;
				if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
					const submitDate = new Date(item.submitTime);
					const startDate = this.filterForm.dateRange[0];
					const endDate = this.filterForm.dateRange[1];
					// 设置结束日期为当天的23:59:59，确保包含当天
					endDate.setHours(23, 59, 59, 999);
					dateMatch = submitDate >= startDate && submitDate <= endDate;
				}
				
				// 成绩区间筛选
				let scoreMatch = true;
				if (this.filterForm.scoreRange) {
					const [min, max] = this.filterForm.scoreRange.split('-').map(Number);
					scoreMatch = item.score >= min && (max ? item.score <= max : true);
				}
				
				return nameMatch && dateMatch && scoreMatch;
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.history-container {
	padding: 20px;

	.welcome-banner {
		text-align: center;
		margin-bottom: 30px;
		padding: 40px 0 32px 0;
		background: linear-gradient(90deg, #409EFF 0%, #66b1ff 100%);
		border-radius: 16px;
		box-shadow: 0 2px 12px 0 rgba(64,158,255,0.08);
		h1 {
			font-size: 32px;
			color: #fff;
			margin-bottom: 12px;
			font-weight: 700;
			letter-spacing: 2px;
		}
		p {
			font-size: 18px;
			color: #e3f0fc;
			font-weight: 400;
			margin: 0;
		}
	}

	.filter-card {
		margin-bottom: 20px;

		.filter-buttons {
			text-align: right;
			margin-top: 20px;
		}
	}

	.history-list-card {
		margin-top: 20px;
		border-radius: 12px;
		box-shadow: 0 2px 12px 0 rgba(0,0,0,0.04);
		padding-bottom: 10px;
		.table-scroll-wrapper {
			height: 400px;
			overflow-y: auto;
			background: #fff;
			border-radius: 8px;
		}
		.history-count {
			float: right;
			color: #909399;
		}

		.paper-name {
			font-weight: 500;
		}

		.score-excellent {
			color: #67C23A;
			font-weight: bold;
		}

		.score-good {
			color: #409EFF;
			font-weight: bold;
		}

		.score-pass {
			color: #E6A23C;
			font-weight: bold;
		}

		.score-fail {
			color: #F56C6C;
			font-weight: bold;
		}
	}

	.answer-detail-dialog {
		.result-header {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 20px;
			h3 {
				margin-bottom: 10px;
			}
			.score-overview {
				display: flex;
				align-items: center;
				.total-score {
					margin-right: 40px;
					.score-circle {
						width: 70px;
						height: 70px;
						border-radius: 50%;
						background: #f5f7fa;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 28px;
						font-weight: bold;
						color: #409EFF;
						margin-bottom: 5px;
					}
					.total-label {
						font-size: 14px;
						margin-left: 2px;
					}
					.score-label {
						font-size: 14px;
						color: #909399;
					}
					.score-percent {
						font-size: 16px;
						color: #67C23A;
						margin-top: 5px;
					}
				}
				.score-details {
					display: flex;
					.detail-card {
						display: flex;
						align-items: center;
						margin-right: 30px;
						.detail-item {
							margin-left: 8px;
							.detail-value {
								font-size: 18px;
								font-weight: bold;
							}
							.detail-label {
								font-size: 12px;
								color: #909399;
							}
						}
					}
				}
			}
		}
		.question-collapse {
			margin-top: 20px;
			.option-item {
				display: flex;
				align-items: center;
				margin-bottom: 6px;
				padding: 4px 10px;
				border-radius: 4px;
				&.correct-option {
					background: #e1f3d8;
					color: #67C23A;
				}
				&.wrong-option {
					background: #fde2e2;
					color: #F56C6C;
				}
				&.user-selected {
					border: 1px solid #409EFF;
				}
				.option-prefix {
					font-weight: bold;
					margin-right: 6px;
				}
				i {
					margin-left: 8px;
				}
			}
			.question-title-row {
				display: flex;
				align-items: center;
				.question-index {
					font-weight: bold;
					margin-right: 16px;
				}
				.question-status {
					margin-left: 16px;
					&.correct {
						color: #67C23A;
					}
					&.wrong {
						color: #F56C6C;
					}
				}
			}
			.question-detail {
				margin-top: 10px;
				.question-content {
					margin-bottom: 10px;
					font-weight: 500;
				}
				.answer-explanation {
					margin-top: 10px;
					.your-answer, .correct-answer {
						margin-bottom: 4px;
					}
					.correct {
						color: #67C23A;
						font-weight: bold;
					}
					.wrong {
						color: #F56C6C;
						font-weight: bold;
					}
				}
			}
		}
	}
}
</style>
