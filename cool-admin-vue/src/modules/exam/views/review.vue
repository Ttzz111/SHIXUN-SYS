<template>
	<div class="review-container">
		<div class="welcome-banner blue-banner">
			<h1>试卷批阅</h1>
			<p>批阅学生的试卷，查看客观题评分，批阅主观题</p>
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
						<el-form-item label="提交时间">
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
						<el-form-item label="批阅状态">
							<el-select v-model="filterForm.reviewStatus" placeholder="请选择批阅状态" clearable style="width: 100%">
								<el-option label="未批阅" value="unreviewed"></el-option>
								<el-option label="已批阅" value="reviewed"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24" class="filter-buttons">
						<el-button type="primary" @click="searchPapers" icon="el-icon-search">查询</el-button>
						<el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
					</el-col>
				</el-row>
			</el-form>
		</el-card>

		<el-card class="paper-list-card" shadow="hover">
			<template #header>
				<div class="card-header">
					<span><i class="el-icon-document"></i> 待批阅试卷</span>
					<span class="paper-count">共 {{ filteredPapers.length }} 份试卷</span>
				</div>
			</template>

			<el-table :data="filteredPapers" style="width: 100%" border stripe highlight-current-row>
				<el-table-column prop="paperName" label="试卷名称" min-width="200">
					<template #default="scope">
						<div class="paper-name">{{ scope.row.paperName }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="studentName" label="学生姓名" width="120" align="center"></el-table-column>
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
				<el-table-column prop="objectiveScore" label="客观题得分" width="120" align="center">
					<template #default="scope">
						<span :class="getScoreClass(scope.row.objectiveScore)">{{ scope.row.objectiveScore }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="subjectiveScore" label="主观题得分" width="120" align="center">
					<template #default="scope">
						<span :class="getScoreClass(scope.row.subjectiveScore)">{{ scope.row.subjectiveScore }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="totalScore" label="总分" width="100" align="center">
					<template #default="scope">
						{{ scope.row.totalScore }}
					</template>
				</el-table-column>
				<el-table-column prop="reviewStatus" label="批阅状态" width="120" align="center">
					<template #default="scope">
						<el-tag :type="scope.row.reviewStatus === 'reviewed' ? 'success' : 'warning'">
							{{ scope.row.reviewStatus === 'reviewed' ? '已批阅' : '未批阅' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="120" align="center">
					<template #default="scope">
						<el-button type="primary" size="small" @click="reviewPaper(scope.row)" icon="el-icon-edit">批阅</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 批阅对话框 -->
		<el-dialog title="试卷批阅" v-model="dialogVisible" width="80%" class="review-dialog">
			<div v-if="currentPaper" class="review-content">
				<div class="student-info">
					<h3>学生信息</h3>
					<p>姓名：{{ currentPaper.studentName }}</p>
					<p>提交时间：{{ currentPaper.submitTime }}</p>
					<p>用时：{{ currentPaper.duration }}</p>
				</div>

				<div class="score-overview">
					<div class="score-card">
						<div class="score-title">客观题得分</div>
						<div class="score-value">{{ currentPaper.objectiveScore }}</div>
					</div>
					<div class="score-card">
						<div class="score-title">主观题得分</div>
						<div class="score-value">{{ currentPaper.subjectiveScore }}</div>
					</div>
					<div class="score-card">
						<div class="score-title">总分</div>
						<div class="score-value">{{ currentPaper.totalScore }}</div>
					</div>
				</div>

				<div class="questions-review">
					<div v-for="(question, index) in currentPaper.questions" :key="index" class="question-item">
						<div class="question-header">
							<span class="question-index">第 {{ index + 1 }} 题</span>
							<span class="question-type">{{ question.type === 1 ? '单选题' : question.type === 2 ? '多选题' : question.type === 3 ? '判断题' : '简答题' }}</span>
							<span class="question-score">{{ question.score }}分</span>
						</div>

						<div class="question-content">
							<div class="question-title">{{ question.content }}</div>

							<!-- 客观题展示 -->
							<div v-if="question.type <= 3" class="objective-question">
								<div class="options-list">
									<div v-for="(option, optIndex) in question.options" :key="optIndex"
										:class="['option-item', getOptionClass(question, optIndex)]">
										<span class="option-prefix">{{ ['A','B','C','D'][optIndex] }}</span> {{ option }}
										<i v-if="question.correctAnswer === ['A','B','C','D'][optIndex]" class="el-icon-check"></i>
										<i v-else-if="question.userAnswer === ['A','B','C','D'][optIndex] && question.correctAnswer !== ['A','B','C','D'][optIndex]" class="el-icon-close"></i>
									</div>
								</div>
								<div class="answer-info">
									<div class="student-answer">
										<strong>学生答案：</strong>
										<span :class="question.isCorrect ? 'correct' : 'wrong'">{{ question.userAnswer }}</span>
									</div>
									<div class="correct-answer">
										<strong>正确答案：</strong>
										<span class="correct">{{ question.correctAnswer }}</span>
									</div>
								</div>
							</div>

							<!-- 主观题批阅 -->
							<div v-else class="subjective-question">
								<div class="student-answer">
									<h4>学生答案：</h4>
									<div class="answer-content">{{ question.userAnswer }}</div>
								</div>
								<div class="standard-answer">
									<h4>参考答案：</h4>
									<div class="answer-content">{{ question.correctAnswer }}</div>
								</div>
								<div class="scoring-area">
									<h4>评分：</h4>
									<el-form :model="question" label-width="80px">
										<el-form-item label="得分">
											<el-input-number 
												v-model="question.score" 
												:min="0" 
												:max="question.totalScore"
												:step="1"
												@change="updateTotalScore">
											</el-input-number>
											<span class="score-hint">/ {{ question.totalScore }}分</span>
										</el-form-item>
										<el-form-item label="评语">
											<el-input 
												type="textarea" 
												v-model="question.comment"
												:rows="3"
												placeholder="请输入评语">
											</el-input>
										</el-form-item>
									</el-form>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="review-actions">
					<el-button type="primary" @click="saveReview" icon="el-icon-check">保存批阅</el-button>
					<el-button @click="dialogVisible = false" icon="el-icon-close">关闭</el-button>
				</div>
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
				reviewStatus: ''
			},
			papers: [],
			dialogVisible: false,
			currentPaper: null
		}
	},
	created() {
		this.loadPapers()
	},
	computed: {
		filteredPapers() {
			return this.papers.filter(paper => {
				// 试卷名称筛选
				const nameMatch = !this.filterForm.paperName || 
					paper.paperName.toLowerCase().includes(this.filterForm.paperName.toLowerCase());
				
				// 日期范围筛选
				let dateMatch = true;
				if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
					const submitDate = new Date(paper.submitTime);
					const startDate = this.filterForm.dateRange[0];
					const endDate = this.filterForm.dateRange[1];
					// 设置结束日期为当天的23:59:59，确保包含当天
					endDate.setHours(23, 59, 59, 999);
					dateMatch = submitDate >= startDate && submitDate <= endDate;
				}
				
				// 批阅状态筛选
				const statusMatch = !this.filterForm.reviewStatus || 
					(this.filterForm.reviewStatus === 'reviewed' ? paper.reviewStatus === 'reviewed' : !paper.reviewStatus || paper.reviewStatus === 'unreviewed');
				
				return nameMatch && dateMatch && statusMatch;
			});
		}
	},
	methods: {
		loadPapers() {
			const all = JSON.parse(localStorage.getItem('examHistory') || '[]');
			this.papers = all.filter(p => !p.reviewStatus || p.reviewStatus === 'unreviewed');
		},
		searchPapers() {
			// 直接使用计算属性filteredPapers，无需额外操作
		},
		resetForm() {
			this.filterForm = {
				paperName: '',
				dateRange: [],
				reviewStatus: ''
			};
		},
		getScoreClass(score) {
			if (score >= 90) return 'score-excellent'
			if (score >= 80) return 'score-good'
			if (score >= 60) return 'score-pass'
			return 'score-fail'
		},
		getOptionClass(question, optIndex) {
			const option = ['A','B','C','D'][optIndex]
			if (question.correctAnswer === option) return 'correct-option'
			if (question.userAnswer === option && question.correctAnswer !== option) return 'wrong-option'
			return ''
		},
		reviewPaper(paper) {
			this.currentPaper = JSON.parse(JSON.stringify(paper))
			this.dialogVisible = true
		},
		updateTotalScore() {
			if (!this.currentPaper) return
			let totalScore = 0
			this.currentPaper.questions.forEach(q => {
				if (q.type <= 3) {
					totalScore += q.isCorrect ? q.score : 0
				} else {
					totalScore += q.score
				}
			})
			this.currentPaper.totalScore = totalScore
		},
		saveReview() {
			// 保存批阅结果到localStorage
			this.dialogVisible = false
			const all = JSON.parse(localStorage.getItem('examHistory') || '[]')
			const idx = all.findIndex(p => p.paperName === this.currentPaper.paperName && p.submitTime === this.currentPaper.submitTime)
			if (idx !== -1) {
				all[idx] = { ...this.currentPaper, reviewStatus: 'reviewed' }
				localStorage.setItem('examHistory', JSON.stringify(all))
			}
			this.loadPapers()
		}
	}
}
</script>

<style lang="scss" scoped>
.review-container {
	padding: 20px;

	.welcome-banner {
		text-align: center;
		margin-bottom: 30px;

		h1 {
			font-size: 28px;
			color: #303133;
			margin-bottom: 10px;
		}

		p {
			font-size: 16px;
			color: #606266;
		}
	}

	.welcome-banner.blue-banner {
		background: linear-gradient(135deg, #64b5ff 0%, #42a5f5 100%);
		border-radius: 24px;
		padding: 48px 0 32px 0;
		margin-bottom: 24px;
		color: #fff;
		text-align: center;
		box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.welcome-banner.blue-banner h1 {
		font-size: 36px;
		font-weight: 800;
		margin-bottom: 12px;
		letter-spacing: 2px;
		color: #fff !important;
	}

	.welcome-banner.blue-banner p {
		font-size: 18px;
		opacity: 0.95;
		margin-bottom: 0;
		color: #fff !important;
	}

	.filter-card {
		margin-bottom: 20px;
	}

	.paper-list-card {
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}

	.review-dialog {
		.review-content {
			.student-info {
				margin-bottom: 20px;
				padding: 15px;
				background-color: #f5f7fa;
				border-radius: 4px;

				h3 {
					margin-bottom: 10px;
					color: #303133;
				}

				p {
					margin: 5px 0;
					color: #606266;
				}
			}

			.score-overview {
				display: flex;
				justify-content: space-around;
				margin-bottom: 30px;

				.score-card {
					text-align: center;
					padding: 20px;
					background-color: #f5f7fa;
					border-radius: 4px;
					width: 200px;

					.score-title {
						font-size: 16px;
						color: #606266;
						margin-bottom: 10px;
					}

					.score-value {
						font-size: 24px;
						font-weight: bold;
						color: #303133;
					}
				}
			}

			.questions-review {
				max-height: 400px;
				overflow-y: auto;

				.question-item {
					margin-bottom: 30px;
					padding: 20px;
					border: 1px solid #dcdfe6;
					border-radius: 4px;

					.question-header {
						display: flex;
						align-items: center;
						margin-bottom: 15px;

						.question-index {
							font-size: 16px;
							font-weight: bold;
							margin-right: 15px;
						}

						.question-type {
							color: #409eff;
							margin-right: 15px;
						}

						.question-score {
							color: #f56c6c;
						}
					}

					.question-content {
						.question-title {
							font-size: 16px;
							margin-bottom: 15px;
						}

						.objective-question {
							.options-list {
								margin-bottom: 15px;

								.option-item {
									padding: 10px;
									margin-bottom: 5px;
									border-radius: 4px;

									&.correct-option {
										background-color: #f0f9eb;
										color: #67c23a;
									}

									&.wrong-option {
										background-color: #fef0f0;
										color: #f56c6c;
									}
								}
							}

							.answer-info {
								.student-answer, .correct-answer {
									margin-bottom: 10px;

									.correct {
										color: #67c23a;
									}

									.wrong {
										color: #f56c6c;
									}
								}
							}
						}

						.subjective-question {
							.student-answer, .standard-answer {
								margin-bottom: 20px;

								h4 {
									margin-bottom: 10px;
									color: #303133;
								}

								.answer-content {
									padding: 15px;
									background-color: #f5f7fa;
									border-radius: 4px;
									white-space: pre-wrap;
								}
							}

							.scoring-area {
								h4 {
									margin-bottom: 15px;
									color: #303133;
								}

								.score-hint {
									margin-left: 10px;
									color: #909399;
								}
							}
						}
					}
				}
			}

			.review-actions {
				text-align: center;
				margin-top: 30px;
			}
		}
	}
}

.score-excellent {
	color: #67c23a;
}

.score-good {
	color: #409eff;
}

.score-pass {
	color: #e6a23c;
}

.score-fail {
	color: #f56c6c;
}
</style> 