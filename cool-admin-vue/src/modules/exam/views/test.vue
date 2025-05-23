<template>
	<div class="test-container">
		<!-- 选择试卷界面 -->
		<div v-if="step === 1" class="test-selection">
			<div class="welcome-banner">
				<h1>在线测试</h1>
				<p>选择适合您的专业与年级的试卷，开始您的知识评估</p>
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
							<el-form-item label="专业">
								<el-select v-model="filterForm.major" placeholder="请选择专业" clearable style="width: 100%">
									<el-option label="软件工程" value="software"></el-option>
									<el-option label="计算机科学与技术" value="computer"></el-option>
									<el-option label="信息安全" value="security"></el-option>
									<el-option label="物联网工程" value="iot"></el-option>
									<el-option label="人工智能" value="ai"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="年级">
								<el-select v-model="filterForm.grade" placeholder="请选择年级" clearable style="width: 100%">
									<el-option label="大一" value="1"></el-option>
									<el-option label="大二" value="2"></el-option>
									<el-option label="大三" value="3"></el-option>
									<el-option label="大四" value="4"></el-option>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="试卷类型">
								<el-select v-model="filterForm.paperType" placeholder="请选择试卷类型" clearable style="width: 100%">
									<el-option label="全部" value=""></el-option>
									<el-option label="固定试卷" value="1"></el-option>
									<el-option label="随机试卷" value="2"></el-option>
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
						<span><i class="el-icon-document"></i> 可用试卷</span>
						<span class="paper-count">共 {{ filteredPapers.length }} 份试卷</span>
					</div>
				</template>
				
				<el-table :data="filteredPapers" style="width: 100%" border stripe highlight-current-row>
					<el-table-column prop="name" label="试卷名称" min-width="280">
						<template #default="scope">
							<div class="paper-name">{{ scope.row.name }}</div>
						</template>
					</el-table-column>
					<el-table-column label="试卷类型" width="120" align="center">
						<template #default="scope">
							<el-tag v-if="scope.row.paperType === 1" type="success" effect="dark">
								<i class="el-icon-document"></i> 固定试卷
							</el-tag>
							<el-tag v-else-if="scope.row.paperType === 2" type="warning" effect="dark">
								<i class="el-icon-refresh"></i> 随机试卷
							</el-tag>
						</template>
					</el-table-column>
					<el-table-column prop="totalScore" label="总分" width="80" align="center">
						<template #default="scope">
							<span class="score-value">{{ scope.row.totalScore }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="duration" label="时长(分钟)" width="120" align="center">
						<template #default="scope">
							<i class="el-icon-time"></i> {{ scope.row.duration }}
						</template>
					</el-table-column>
					<el-table-column prop="questionCount" label="题目数量" width="120" align="center">
						<template #default="scope">
							<i class="el-icon-question"></i> {{ scope.row.questionCount }}
						</template>
					</el-table-column>
					<el-table-column label="适用专业" min-width="180">
						<template #default="scope">
							<el-tag v-for="major in scope.row.majors" :key="major" style="margin-right: 5px; margin-bottom: 5px" size="small" effect="plain">
								{{ getMajorLabel(major) }}
							</el-tag>
						</template>
					</el-table-column>
					<el-table-column label="适用年级" width="180">
						<template #default="scope">
							<el-tag v-for="grade in scope.row.grades" :key="grade" style="margin-right: 5px; margin-bottom: 5px" type="info" size="small" effect="plain">
								{{ getGradeLabel(grade) }}
							</el-tag>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" align="center">
						<template #default="scope">
							<el-button type="primary" size="small" @click="startExam(scope.row)" icon="el-icon-s-promotion">开始测试</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-card>
		</div>
		
		<!-- 考试界面 -->
		<div v-if="step === 2" class="test-exam">
			<div class="exam-header" style="display: flex; justify-content: space-between; align-items: center;">
				<div class="exam-header-main">
					<div class="exam-title">
						<h2><i class="el-icon-s-management"></i> {{ currentPaper.name }}</h2>
					</div>
					<div class="exam-info">
						<div class="info-item">
							<i class="el-icon-notebook-1"></i>
							<span>总分：{{ currentPaper.totalScore }}分</span>
						</div>
						<div class="info-item">
							<i class="el-icon-question"></i>
							<span>题目数量：{{ questions.length }}道</span>
						</div>
						<div class="info-item timer">
							<i class="el-icon-time"></i>
							<span>剩余时间：{{ formatTime(remainingTime) }}</span>
							<el-progress :percentage="timePercentage" :color="timeProgressColor" :stroke-width="10" :show-text="false"></el-progress>
						</div>
					</div>
				</div>
				<el-button type="danger" size="large" @click="confirmSubmit" icon="el-icon-finished">提前交卷</el-button>
			</div>
			
			<div class="exam-body">
				<!-- 左侧题目列表和考试信息 -->
				<div class="exam-sidebar">
					<div class="question-nav-title">
						<i class="el-icon-menu"></i> 题目导航
					</div>
					<div class="question-status-list">
						<div 
							v-for="(question, index) in questions" 
							:key="index" 
							class="status-item" 
							:class="{
								active: index === currentQuestionIndex,
								answered: userAnswers[index] !== undefined && userAnswers[index] !== '' && userAnswers[index].length !== 0
							}"
							@click="goToQuestion(index)"
						>
							<span class="question-num">{{ index + 1 }}</span>
							<span class="question-type">
								{{ question.type === 1 ? '单选' : question.type === 2 ? '多选' : question.type === 3 ? '判断' : '简答' }}
							</span>
							<span class="question-mark">{{ question.score }}分</span>
						</div>
					</div>
					<div class="exam-progress">
						<div class="progress-header">答题进度</div>
						<div class="progress-info">
							<div class="progress-data">
								<div class="data-item">
									<div class="data-value">{{ getAnsweredCount() }}</div>
									<div class="data-label">已答题数</div>
								</div>
								<div class="data-item">
									<div class="data-value">{{ questions.length - getAnsweredCount() }}</div>
									<div class="data-label">未答题数</div>
								</div>
							</div>
							<el-progress 
								:percentage="Math.round((getAnsweredCount() / questions.length) * 100)" 
								:stroke-width="12"
								:format="percentFormat"
							></el-progress>
						</div>
					</div>
					<div class="submit-area">
						<el-button type="danger" size="large" @click="confirmSubmit" icon="el-icon-finished" class="submit-button">提交试卷</el-button>
					</div>
				</div>
				
				<!-- 右侧答题区域 -->
				<div class="exam-content">
					<div class="scroll-area">
						<div v-for="(question, index) in questions" :key="index" :id="`question-${index}`" class="question-item">
							<div class="question-header">
								<div class="question-info">
									<span class="question-index">第 {{ index + 1 }} 题</span>
									<span class="question-type">
										{{ question.type === 1 ? '单选题' : question.type === 2 ? '多选题' : question.type === 3 ? '判断题' : '简答题' }}
									</span>
									<span class="question-score">{{ question.score }}分</span>
								</div>
								<div class="question-status" 
									:class="{
										answered: userAnswers[index] !== undefined && userAnswers[index] !== '' && userAnswers[index].length !== 0
									}">
									{{ userAnswers[index] !== undefined && userAnswers[index] !== '' && userAnswers[index].length !== 0 ? '已答' : '未答' }}
								</div>
							</div>
							
							<div class="question-content">
								<div class="question-title">{{ question.content }}</div>
								
								<!-- 单选题 -->
								<div v-if="question.type === 1" class="question-options">
									<el-radio-group v-model="userAnswers[index]">
										<el-radio 
											v-for="(option, optIndex) in question.options" 
											:key="optIndex" 
											:label="optIndex"
											class="option-item"
										>
											<span class="option-prefix">{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIndex] }}</span> {{ option }}
										</el-radio>
									</el-radio-group>
								</div>
								
								<!-- 多选题 -->
								<div v-if="question.type === 2" class="question-options">
									<el-checkbox-group v-model="userAnswers[index]">
										<el-checkbox 
											v-for="(option, optIndex) in question.options" 
											:key="optIndex" 
											:label="optIndex"
											class="option-item"
										>
											<span class="option-prefix">{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIndex] }}</span> {{ option }}
										</el-checkbox>
									</el-checkbox-group>
								</div>
								
								<!-- 判断题 -->
								<div v-if="question.type === 3" class="question-options">
									<el-radio-group v-model="userAnswers[index]">
										<el-radio :label="0" class="option-item">
											<span class="option-prefix">A</span> 正确
										</el-radio>
										<el-radio :label="1" class="option-item">
											<span class="option-prefix">B</span> 错误
										</el-radio>
									</el-radio-group>
								</div>
								
								<!-- 简答题 -->
								<div v-if="question.type === 4" class="question-options">
									<el-input 
										v-model="userAnswers[index]" 
										type="textarea" 
										:rows="4" 
										placeholder="请在此输入答案..."
									></el-input>
								</div>
							</div>
							
							<div class="question-actions">
								<el-button :disabled="index === 0" @click="goToQuestion(index-1)" icon="el-icon-arrow-left" plain>上一题</el-button>
								<el-button type="primary" :disabled="index === questions.length - 1" @click="goToQuestion(index+1)" plain>下一题 <i class="el-icon-arrow-right"></i></el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<!-- 考试结果界面 -->
		<div v-if="step === 3" class="test-result">
			<div class="result-header">
				<h2><i class="el-icon-s-data"></i> {{ currentPaper.name }} - 测试结果</h2>
				
				<div class="score-overview">
					<div class="total-score">
						<div class="score-circle">
							{{ examResult.totalScore }}
							<span class="total-label">分</span>
						</div>
						<div class="score-label">总分</div>
						<div class="score-percent">
							<i :class="getScoreIcon()"></i>
							{{ Math.round((examResult.totalScore / currentPaper.totalScore) * 100) }}%
						</div>
					</div>
					
					<div class="score-details">
						<div class="detail-card">
							<i class="el-icon-document"></i>
							<div class="detail-item">
								<div class="detail-value">{{ currentPaper.totalScore }}</div>
								<div class="detail-label">试卷总分</div>
							</div>
						</div>
						<div class="detail-card">
							<i class="el-icon-time"></i>
							<div class="detail-item">
								<div class="detail-value">{{ examResult.usedTime }}</div>
								<div class="detail-label">答题用时</div>
							</div>
						</div>
						<div class="detail-card">
							<i class="el-icon-question"></i>
							<div class="detail-item">
								<div class="detail-value">{{ questions.length }}</div>
								<div class="detail-label">题目数量</div>
							</div>
						</div>
						<div class="detail-card">
							<i class="el-icon-check"></i>
							<div class="detail-item">
								<div class="detail-value">{{ examResult.correctCount }}</div>
								<div class="detail-label">正确题数</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="result-analysis">
				<div class="analysis-header">
					<i class="el-icon-s-data"></i>
					<h3>答题详情</h3>
				</div>
				
				<el-collapse accordion>
					<el-collapse-item v-for="(question, index) in questions" :key="index" :name="index">
						<template #title>
							<div class="question-title-row">
								<span class="question-index">第 {{ index + 1 }} 题</span>
								<span class="question-type">
									{{ question.type === 1 ? '单选题' : question.type === 2 ? '多选题' : question.type === 3 ? '判断题' : '简答题' }}
								</span>
								<span class="question-status" :class="questionResultClass(index)">
									<i :class="getQuestionStatusIcon(index)"></i> {{ questionResultText(index) }}
								</span>
								<span class="question-score">得分：{{ examResult.scores[index] }}/{{ question.score }}分</span>
							</div>
						</template>
						
						<div class="question-detail">
							<div class="question-content">{{ question.content }}</div>
							
							<!-- 选择题选项 -->
							<div v-if="question.type === 1 || question.type === 2" class="options-list">
								<div v-for="(option, optIndex) in question.options" :key="optIndex" 
									class="option-item" 
									:class="{
										'user-selected': isOptionSelected(index, optIndex),
										'correct-option': isCorrectOption(question, optIndex),
										'wrong-option': isOptionSelected(index, optIndex) && !isCorrectOption(question, optIndex)
									}">
									<span class="option-prefix">{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIndex] }}</span> {{ option }}
									<i v-if="isCorrectOption(question, optIndex)" class="el-icon-check"></i>
									<i v-else-if="isOptionSelected(index, optIndex) && !isCorrectOption(question, optIndex)" class="el-icon-close"></i>
								</div>
							</div>
							
							<!-- 判断题选项 -->
							<div v-if="question.type === 3" class="options-list">
								<div class="option-item" 
									:class="{'user-selected': userAnswers[index] === 0, 'correct-option': question.correctAnswer === 0, 'wrong-option': userAnswers[index] === 0 && question.correctAnswer !== 0}">
									<span class="option-prefix">A</span> 正确
									<i v-if="question.correctAnswer === 0" class="el-icon-check"></i>
									<i v-else-if="userAnswers[index] === 0" class="el-icon-close"></i>
								</div>
								<div class="option-item" 
									:class="{'user-selected': userAnswers[index] === 1, 'correct-option': question.correctAnswer === 1, 'wrong-option': userAnswers[index] === 1 && question.correctAnswer !== 1}">
									<span class="option-prefix">B</span> 错误
									<i v-if="question.correctAnswer === 1" class="el-icon-check"></i>
									<i v-else-if="userAnswers[index] === 1" class="el-icon-close"></i>
								</div>
							</div>
							
							<!-- 简答题 -->
							<div v-if="question.type === 4" class="essay-answer">
								<div class="answer-title">您的答案：</div>
								<div class="answer-content">{{ userAnswers[index] || '未作答' }}</div>
							</div>
							
							<!-- 正确答案和解析 -->
							<div class="answer-explanation">
								<div class="correct-answer">
									<strong><i class="el-icon-star-on"></i> 正确答案：</strong>
									<template v-if="question.type === 1">
										{{ ['A', 'B', 'C', 'D', 'E', 'F'][question.correctAnswer] }}
									</template>
									<template v-else-if="question.type === 2">
										{{ question.correctAnswer.map(index => ['A', 'B', 'C', 'D', 'E', 'F'][index]).join(', ') }}
									</template>
									<template v-else-if="question.type === 3">
										{{ question.correctAnswer === 0 ? 'A. 正确' : 'B. 错误' }}
									</template>
								</div>
								
								<div class="explanation">
									<strong><i class="el-icon-info"></i> 解析：</strong>
									{{ getExplanation(question) }}
								</div>
							</div>
						</div>
					</el-collapse-item>
				</el-collapse>
			</div>
			
			<div class="result-actions">
				<el-button type="primary" @click="returnToPaperList" icon="el-icon-back">返回试卷列表</el-button>
				<el-button @click="reviewExam" icon="el-icon-view">查看答题卡</el-button>
				<el-button type="success" icon="el-icon-document-copy">导出成绩报告</el-button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 考试步骤：1=选择试卷，2=答题中，3=查看结果
const step = ref(1);

// 筛选表单
const filterForm = reactive({
	major: '',
	grade: '',
	paperType: ''
});

// 试卷数据
const papers = reactive([
	{
		id: 1,
		name: "工程实训项目需求分析测试",
		paperType: 1,
		totalScore: 100,
		duration: 60,
		questionCount: 25,
		majors: ['software', 'computer'],
		grades: ['3', '4']
	},
	{
		id: 2,
		name: "软件工程项目管理评估",
		paperType: 1,
		totalScore: 100,
		duration: 90,
		questionCount: 30,
		majors: ['software'],
		grades: ['3', '4']
	},
	{
		id: 3,
		name: "数据库设计与实现考核",
		paperType: 2,
		totalScore: 100,
		duration: 60,
		questionCount: 20,
		majors: ['software', 'computer', 'ai'],
		grades: ['2', '3']
	},
	{
		id: 4,
		name: "前端开发技术测验",
		paperType: 1,
		totalScore: 100,
		duration: 45,
		questionCount: 22,
		majors: ['software', 'computer'],
		grades: ['2', '3', '4']
	},
	{
		id: 5,
		name: "系统架构设计评估",
		paperType: 1,
		totalScore: 100,
		duration: 75,
		questionCount: 28,
		majors: ['software', 'computer'],
		grades: ['4']
	},
	{
		id: 6,
		name: "后端接口开发测试",
		paperType: 2,
		totalScore: 100,
		duration: 90,
		questionCount: 25,
		majors: ['software', 'computer'],
		grades: ['3', '4']
	},
	{
		id: 7,
		name: "软件测试技术考核",
		paperType: 1,
		totalScore: 100,
		duration: 60,
		questionCount: 24,
		majors: ['software', 'security'],
		grades: ['3', '4']
	},
	{
		id: 8,
		name: "项目文档编写规范",
		paperType: 2,
		totalScore: 120,
		duration: 120,
		questionCount: 35,
		majors: ['software', 'computer', 'security', 'iot', 'ai'],
		grades: ['1', '2', '3', '4']
	},
	{
		id: 9,
		name: "敏捷开发流程测验",
		paperType: 1,
		totalScore: 80,
		duration: 45,
		questionCount: 20,
		majors: ['software'],
		grades: ['3', '4']
	},
	{
		id: 10,
		name: "项目部署与运维考核",
		paperType: 2,
		totalScore: 100,
		duration: 60,
		questionCount: 25,
		majors: ['software', 'computer', 'iot'],
		grades: ['3', '4']
	}
]);

// 根据筛选条件过滤试卷
const filteredPapers = ref(papers);

// 搜索试卷
function searchPapers() {
	filteredPapers.value = papers.filter(paper => {
		if (filterForm.major && !paper.majors.includes(filterForm.major)) {
			return false;
		}
		if (filterForm.grade && !paper.grades.includes(filterForm.grade)) {
			return false;
		}
		if (filterForm.paperType && paper.paperType !== parseInt(filterForm.paperType)) {
			return false;
		}
		return true;
	});
}

// 重置表单
function resetForm() {
	filterForm.major = '';
	filterForm.grade = '';
	filterForm.paperType = '';
	filteredPapers.value = papers;
}

// 获取专业标签
function getMajorLabel(value) {
	const map = {
		'software': '软件工程',
		'computer': '计算机科学与技术',
		'security': '信息安全',
		'iot': '物联网工程',
		'ai': '人工智能'
	};
	return map[value] || value;
}

// 获取年级标签
function getGradeLabel(value) {
	const map = {
		'1': '大一',
		'2': '大二',
		'3': '大三',
		'4': '大四'
	};
	return map[value] || value;
}

// 当前试卷
const currentPaper = ref({});

// 考试相关变量
const questions = ref([]);
const userAnswers = ref([]);
const currentQuestionIndex = ref(0);
const remainingTime = ref(0);
const timerInterval = ref(null);

// 考试结果
const examResult = reactive({
	totalScore: 0,
	usedTime: '',
	correctCount: 0,
	scores: [],
	startTime: 0,
	endTime: 0
});

// 开始考试
function startExam(paper) {
	currentPaper.value = paper;
	
	// 生成试题
	generateQuestions(paper);
	
	// 初始化用户答案
	userAnswers.value = Array(questions.value.length).fill(undefined);
	
	// 设置剩余时间（分钟转秒）
	remainingTime.value = paper.duration * 60;
	
	// 记录考试开始时间
	examResult.startTime = Date.now();
	
	// 启动计时器
	startTimer();
	
	// 转到考试界面
	step.value = 2;
	
	// 在DOM更新后，确保滚动到顶部
	nextTick(() => {
		if (document.querySelector('.exam-content')) {
			document.querySelector('.exam-content').scrollTop = 0;
		}
	});
}

// 生成试题
function generateQuestions(paper) {
	// 简单起见，这里使用模拟数据
	// 实际应用中可以根据试卷ID向后端请求真实试题
	
	const questionBank = {
		singleChoice: [
			{
				content: "在工程实训项目中，需求分析阶段的主要任务是什么？",
				options: ["编写代码", "确定软件需要实现的功能", "进行系统测试", "部署软件"],
				correctAnswer: 1,
				score: 4
			},
			{
				content: "工程实训过程中，关于接口和抽象类的描述，以下哪项是正确的？",
				options: ["接口可以包含实现代码，抽象类不能", "一个类可以实现多个接口，但只能继承一个抽象类", "抽象类中的方法必须是抽象的", "接口中不能定义变量"],
				correctAnswer: 1,
				score: 4
			},
			{
				content: "在工程实训项目的面向对象编程中，下列哪种关系表示'是一种'的概念？",
				options: ["组合关系", "聚合关系", "继承关系", "依赖关系"],
				correctAnswer: 2,
				score: 4
			},
			{
				content: "工程实训项目中，以下哪种数据结构适合实现先进先出（FIFO）的操作？",
				options: ["栈", "队列", "树", "图"],
				correctAnswer: 1,
				score: 4
			},
			{
				content: "在工程实训项目的Web开发中，HTTP状态码200表示什么？",
				options: ["请求成功", "资源未找到", "服务器错误", "重定向"],
				correctAnswer: 0,
				score: 4
			},
			{
				content: "工程实训项目中，以下哪个不是关系型数据库管理系统？",
				options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
				correctAnswer: 2,
				score: 4
			},
			{
				content: "在工程实训的前端开发中，下列哪个CSS选择器的优先级最高？",
				options: ["标签选择器", "类选择器", "ID选择器", "通配符选择器"],
				correctAnswer: 2,
				score: 4
			},
			{
				content: "工程实训项目中，以下哪个协议用于安全的网页浏览？",
				options: ["HTTP", "FTP", "HTTPS", "SMTP"],
				correctAnswer: 2,
				score: 4
			},
			{
				content: "在工程实训项目的前端开发中，以下哪个不是JavaScript的数据类型？",
				options: ["String", "Boolean", "Float", "Undefined"],
				correctAnswer: 2,
				score: 4
			},
			{
				content: "工程实训常用的Python中，以下哪个不是内置的数据结构？",
				options: ["List", "Dictionary", "Set", "Tree"],
				correctAnswer: 3,
				score: 4
			}
		],
		multiChoice: [
			{
				content: "在工程实训项目中使用Git版本控制系统，以下哪些命令用于将本地更改提交到远程仓库？",
				options: ["git pull", "git push", "git commit", "git fetch", "git merge"],
				correctAnswer: [2, 1],
				score: 8
			},
			{
				content: "工程实训项目中，以下哪些是JavaScript的基本数据类型？",
				options: ["Number", "String", "Boolean", "Object", "Array"],
				correctAnswer: [0, 1, 2],
				score: 8
			},
			{
				content: "关于工程实训项目中SQL注入攻击的防御措施，下列哪些是有效的？",
				options: ["使用参数化查询", "输入验证", "使用ORM框架", "不验证用户输入", "使用存储过程"],
				correctAnswer: [0, 1, 2, 4],
				score: 8
			}
		],
		judgment: [
			{
				content: "在工程实训的软件测试中，单元测试主要关注的是程序的最小可测试单元。",
				correctAnswer: 0, // 0=正确，1=错误
				score: 3
			},
			{
				content: "工程实训项目中，HTTPS协议只使用对称加密技术。",
				correctAnswer: 1,
				score: 3
			},
			{
				content: "在工程实训项目的Java开发中，所有的类都直接或间接继承自Object类。",
				correctAnswer: 0,
				score: 3
			},
			{
				content: "工程实训项目的数据库设计中，主键允许有重复值。",
				correctAnswer: 1,
				score: 3
			}
		],
		subjective: [
			{
				content: "请简述需求分析阶段的主要工作内容。",
				score: 10,
				type: 4,
				correctAnswer: "调研、收集和分析用户需求，形成需求规格说明书，为后续设计开发提供依据。"
			},
			{
				content: "谈谈你对接口与抽象类区别的理解。",
				score: 10,
				type: 4,
				correctAnswer: "接口只定义规范，抽象类可包含实现；类可实现多个接口但只能继承一个抽象类。"
			},
			{
				content: "请举例说明继承关系在实际开发中的应用。",
				score: 10,
				type: 4,
				correctAnswer: "如Student继承Person，复用父类属性和方法。"
			}
		]
	};
	
	// 随机抽取试题
	const singleCount = 5; // 单选题数量
	const multiCount = 2;  // 多选题数量
	const judgeCount = 2;  // 判断题数量
	const subjectiveCount = 1; // 简答题数量
	
	// 随机选择题目
	const getRandomQuestions = (arr, count, type) => {
		const shuffled = [...arr].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, Math.min(count, arr.length)).map(q => ({
			...q,
			type // 1=单选题，2=多选题，3=判断题，4=简答题
		}));
	};
	
	// 按顺序组合所有题目
	const allQuestions = [
		...getRandomQuestions(questionBank.singleChoice, singleCount, 1),
		...getRandomQuestions(questionBank.multiChoice, multiCount, 2),
		...getRandomQuestions(questionBank.judgment, judgeCount, 3),
		...getRandomQuestions(questionBank.subjective, subjectiveCount, 4)
	];
	
	questions.value = allQuestions;
}

// 启动计时器
function startTimer() {
	timerInterval.value = setInterval(() => {
		if (remainingTime.value > 0) {
			remainingTime.value--;
		} else {
			// 时间到，自动交卷
			clearInterval(timerInterval.value);
			submitExam();
		}
	}, 1000);
}

// 格式化时间
function formatTime(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 计算时间百分比
const timePercentage = computed(() => {
	if (!currentPaper.value.duration) return 0;
	const totalSeconds = currentPaper.value.duration * 60;
	return (remainingTime.value / totalSeconds) * 100;
});

// 计算时间进度条颜色
const timeProgressColor = computed(() => {
	if (timePercentage.value > 60) return '#67C23A';
	if (timePercentage.value > 30) return '#E6A23C';
	return '#F56C6C';
});

// 上一题
function prevQuestion() {
	if (currentQuestionIndex.value > 0) {
		currentQuestionIndex.value--;
	}
}

// 下一题
function nextQuestion() {
	if (currentQuestionIndex.value < questions.value.length - 1) {
		currentQuestionIndex.value++;
	}
}

// 跳转到指定题目
function goToQuestion(index) {
	currentQuestionIndex.value = index;
	// 滚动到对应题目位置
	nextTick(() => {
		const element = document.getElementById(`question-${index}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	});
}

// 确认交卷
function confirmSubmit() {
	ElMessageBox.confirm('确定要提前交卷吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		submitExam();
	}).catch(() => {
		// 取消交卷
	});
}

// 交卷
function submitExam() {
	// 停止计时器
	clearInterval(timerInterval.value);
	
	// 记录考试结束时间
	examResult.endTime = Date.now();
	
	// 计算用时
	const usedTimeInSeconds = (currentPaper.value.duration * 60) - remainingTime.value;
	const minutes = Math.floor(usedTimeInSeconds / 60);
	const seconds = usedTimeInSeconds % 60;
	examResult.usedTime = `${minutes}分${seconds}秒`;
	
	// 计算得分
	let totalScore = 0;
	let correctCount = 0;
	examResult.scores = [];
	
	questions.value.forEach((question, index) => {
		let score = 0;
		
		// 根据题型计算得分
		if (question.type === 1) { // 单选题
			if (userAnswers.value[index] === question.correctAnswer) {
				score = question.score;
				correctCount++;
			}
		} else if (question.type === 2) { // 多选题
			if (userAnswers.value[index] && Array.isArray(userAnswers.value[index])) {
				// 多选题需要完全匹配才得分
				const userArray = [...userAnswers.value[index]].sort();
				const correctArray = [...question.correctAnswer].sort();
				
				if (userArray.length === correctArray.length && 
					userArray.every((val, i) => val === correctArray[i])) {
					score = question.score;
					correctCount++;
				}
			}
		} else if (question.type === 3) { // 判断题
			if (userAnswers.value[index] === question.correctAnswer) {
				score = question.score;
				correctCount++;
			}
		}
		
		examResult.scores.push(score);
		totalScore += score;
	});
	
	examResult.totalScore = totalScore;
	examResult.correctCount = correctCount;
	
	// 显示提交成功消息
	ElMessage.success('试卷已提交成功！');
	
	// 转到结果页面
	setTimeout(() => {
		step.value = 3;
		// 滚动到顶部
		window.scrollTo(0, 0);
	}, 500);
}

// 检查选项是否被选中
function isOptionSelected(questionIndex, optionIndex) {
	const answer = userAnswers.value[questionIndex];
	
	if (questions.value[questionIndex].type === 1 || questions.value[questionIndex].type === 3) {
		// 单选题和判断题
		return answer === optionIndex;
	} else if (questions.value[questionIndex].type === 2) {
		// 多选题
		return Array.isArray(answer) && answer.includes(optionIndex);
	}
	
	return false;
}

// 检查选项是否为正确答案
function isCorrectOption(question, optionIndex) {
	if (question.type === 1 || question.type === 3) {
		// 单选题和判断题
		return question.correctAnswer === optionIndex;
	} else if (question.type === 2) {
		// 多选题
		return question.correctAnswer.includes(optionIndex);
	}
	
	return false;
}

// 题目结果样式类
function questionResultClass(index) {
	if (examResult.scores[index] > 0) {
		return 'correct';
	} else if (userAnswers.value[index] !== undefined) {
		return 'wrong';
	} else {
		return 'no-answer';
	}
}

// 题目结果文本
function questionResultText(index) {
	if (examResult.scores[index] > 0) {
		return '正确';
	} else if (userAnswers.value[index] !== undefined) {
		return '错误';
	} else {
		return '未作答';
	}
}

// 获取题目解析（模拟数据）
function getExplanation(question) {
	// 实际应用中，解析应该来自后端数据
	const explanations = {
		"在工程实训项目中，需求分析阶段的主要任务是什么？": "需求分析是软件开发过程中的重要阶段，目的是确定软件需要实现的功能和约束条件，为后续设计和开发提供基础。",
		"工程实训过程中，关于接口和抽象类的描述，以下哪项是正确的？": "Java中，一个类可以实现多个接口，但只能继承一个抽象类，这是Java单继承多实现的特性。",
		"在工程实训项目的面向对象编程中，下列哪种关系表示'是一种'的概念？": "继承关系体现了'是一种'的概念，例如'学生是一种人'，表示子类是父类的一个特例。",
		"工程实训项目中，以下哪种数据结构适合实现先进先出（FIFO）的操作？": "队列是一种先进先出（FIFO）的数据结构，新元素添加到队尾，从队首移除元素。",
		"在工程实训项目的Web开发中，HTTP状态码200表示什么？": "HTTP状态码200表示请求成功，服务器已成功处理了请求并返回请求的内容。",
		"工程实训项目中，以下哪个不是关系型数据库管理系统？": "MongoDB是一个基于分布式文件存储的NoSQL数据库，而不是关系型数据库管理系统。"
	};
	
	return explanations[question.content] || "该题目暂无解析";
}

// 返回试卷列表
function returnToPaperList() {
	step.value = 1;
}

// 查看答题卡（重新显示考试界面但不允许修改答案）
function reviewExam() {
	// 转到考试界面
	step.value = 2;
	
	// 清除计时器防止继续计时
	if (timerInterval.value) {
		clearInterval(timerInterval.value);
		timerInterval.value = null;
	}
	
	// 设置禁止修改答案的标志
	nextTick(() => {
		// 滚动到顶部
		if (document.querySelector('.exam-content')) {
			document.querySelector('.exam-content').scrollTop = 0;
		}
		
		// 显示提示信息
		ElMessage.info('您正在查看答题卡，无法修改答案');
	});
}

// 组件卸载时清除计时器
onBeforeUnmount(() => {
	if (timerInterval.value) {
		clearInterval(timerInterval.value);
	}
});

// 组件挂载时初始化
onMounted(() => {
	filteredPapers.value = papers;
});

// 获取已答题数量
function getAnsweredCount() {
	return userAnswers.value.filter(answer => 
		answer !== undefined && answer !== '' && 
		(Array.isArray(answer) ? answer.length > 0 : true)
	).length;
}

// 格式化进度百分比
function percentFormat(percentage) {
	return `${percentage}%`;
}

// 获取得分图标
function getScoreIcon() {
	const percentage = Math.round((examResult.totalScore / currentPaper.totalScore) * 100);
	if (percentage >= 90) return 'el-icon-trophy'; // 非常好
	if (percentage >= 80) return 'el-icon-medal'; // 良好
	if (percentage >= 60) return 'el-icon-star-on'; // 及格
	return 'el-icon-warning-outline'; // 不及格
}

// 获取题目状态图标
function getQuestionStatusIcon(index) {
	if (examResult.scores[index] > 0) {
		return 'el-icon-check';
	} else if (userAnswers.value[index] !== undefined) {
		return 'el-icon-close';
	} else {
		return 'el-icon-warning';
	}
}
</script>

<style lang="scss" scoped>
.test-container {
	padding: 20px;
	box-sizing: border-box;
	height: calc(100vh - 40px);
	overflow-y: auto;
	background-color: #f5f7fa;
}

.welcome-banner {
	background: linear-gradient(135deg, #3a8ee6 0%, #214fbe 100%);
	border-radius: 14px;
	padding: 32px 0 24px 0;
	margin-bottom: 24px;
	color: #fff;
	text-align: center;
	box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
}

.welcome-banner h1 {
	font-size: 30px;
	font-weight: 700;
	margin-bottom: 8px;
	letter-spacing: 2px;
}

.welcome-banner p {
	font-size: 16px;
	opacity: 0.92;
	margin-bottom: 0;
}

.filter-card, .paper-list-card {
	border-radius: 14px;
	box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
	border: none;
	margin-bottom: 24px;
	overflow: hidden;
	background: #fff;
}

.card-header {
	padding: 18px 18px 0 18px;
	border-bottom: 1px solid #f2f6fc;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	background: none;
}

.card-header span {
	font-size: 18px;
	color: #222;
	font-weight: 600;
}

.card-header i {
	margin-right: 8px;
	color: #409EFF;
}

.paper-count {
	font-size: 14px;
	color: #909399;
}

.filter-form {
	padding: 20px;
}

.filter-buttons {
	display: flex;
	justify-content: center;
	margin-top: 20px;
}

.paper-list-card {
	.paper-name {
		font-weight: 600;
		color: #222;
	}
	
	.el-table {
		border-radius: 8px;
		overflow: hidden;
	}
}

.test-exam {
	.exam-header {
		background: linear-gradient(135deg, #3a8ee6 0%, #214fbe 100%);
		border-radius: 14px;
		padding: 32px 24px;
		margin-bottom: 24px;
		color: #fff;
		box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
		
		.exam-title {
			text-align: center;
			margin-bottom: 20px;
			
			h2 {
				font-size: 24px;
				font-weight: 700;
				margin: 0;
				color: #fff;
			}
		}
		
		.exam-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: wrap;
			
			.info-item {
				display: flex;
				align-items: center;
				font-size: 15px;
				color: #fff;
				margin: 5px 0;
				
				i {
					margin-right: 8px;
					font-size: 18px;
				}
			}
			
			.timer {
				min-width: 250px;
				font-weight: 600;
				
				.el-progress {
					margin-top: 8px;
				}
			}
		}
	}
	
	.exam-body {
		display: flex;
		background: #fff;
		border-radius: 14px;
		box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
		overflow: hidden;
		height: calc(100vh - 200px);
		
		.exam-sidebar {
			width: 240px;
			border-right: 1px solid #f2f6fc;
			display: flex;
			flex-direction: column;
			background: #f8fafd;
			
			.question-nav-title {
				padding: 20px;
				font-weight: 600;
				color: #222;
				background: #edf2fc;
				display: flex;
				align-items: center;
				
				i {
					margin-right: 8px;
					color: #409EFF;
				}
			}
			
			.question-status-list {
				flex: 1;
				overflow-y: auto;
				padding: 20px;
				
				.status-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 12px;
					margin-bottom: 12px;
					border-radius: 8px;
					background: #fff;
					cursor: pointer;
					transition: all 0.3s;
					border: 1px solid #f2f6fc;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
					}
					
					&.active {
						background: #ecf5ff;
						border-color: #409EFF;
					}
					
					&.answered {
						background: #f0f9eb;
						border-color: #67C23A;
					}
				}
			}
			
			.exam-progress {
				padding: 20px;
				border-top: 1px solid #f2f6fc;
				background: #fff;
			}
			
			.submit-area {
				padding: 20px;
				border-top: 1px solid #f2f6fc;
				background: #fff;
				position: sticky;
				bottom: 0;
				z-index: 10;
				box-shadow: 0 -2px 8px 0 rgba(58,142,230,0.06);
				
				.submit-button {
					width: 100%;
				}
			}
		}
		
		.exam-content {
			flex: 1;
			overflow-y: auto;
			padding: 24px;
			
			.scroll-area {
				max-width: 800px;
				margin: 0 auto;
			}
			
			.question-item {
				margin-bottom: 30px;
				padding: 24px;
				border-radius: 12px;
				background: #fff;
				box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
				border: 1px solid #f2f6fc;
				
				.question-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 20px;
					padding-bottom: 15px;
					border-bottom: 1px solid #f2f6fc;
				}
				
				.question-content {
					margin-bottom: 24px;
					
					.question-title {
						font-size: 16px;
						margin-bottom: 24px;
						line-height: 1.6;
						color: #222;
					}
				}
				
				.question-actions {
					display: flex;
					justify-content: space-between;
					border-top: 1px solid #f2f6fc;
					padding-top: 20px;
				}
			}
		}
	}
}

.test-result {
	.result-header {
		background: linear-gradient(135deg, #3a8ee6 0%, #214fbe 100%);
		border-radius: 14px;
		padding: 40px 30px;
		margin-bottom: 24px;
		color: #fff;
		text-align: center;
		box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
		
		h2 {
			margin-bottom: 30px;
			font-size: 24px;
			font-weight: 700;
			color: #fff;
		}
		
		.score-overview {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.total-score {
				.score-circle {
					width: 150px;
					height: 150px;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.1);
					color: #fff;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					font-size: 48px;
					font-weight: 700;
					margin-bottom: 15px;
					box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
				}
			}
			
			.score-details {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				gap: 20px;
				width: 100%;
				max-width: 800px;
				
				.detail-card {
					background: rgba(255, 255, 255, 0.1);
					border-radius: 12px;
					padding: 20px;
					min-width: 160px;
					display: flex;
					align-items: center;
					
					i {
						font-size: 28px;
						color: #fff;
						margin-right: 15px;
					}
					
					.detail-item {
						.detail-value {
							font-size: 22px;
							font-weight: 700;
							color: #fff;
							margin-bottom: 5px;
						}
						
						.detail-label {
							font-size: 14px;
							color: rgba(255, 255, 255, 0.8);
						}
					}
				}
			}
		}
	}
	
	.result-analysis {
		background: #fff;
		padding: 24px;
		border-radius: 14px;
		box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
		margin-bottom: 24px;
	}
	
	.result-actions {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin: 30px 0;
	}
}

.option-prefix {
	display: inline-block;
	width: 24px;
	height: 24px;
	line-height: 24px;
	text-align: center;
	border-radius: 50%;
	background-color: #f0f2f5;
	color: #606266;
	font-weight: bold;
	margin-right: 8px;
}

.el-radio.is-checked .option-prefix,
.el-checkbox.is-checked .option-prefix {
	background-color: #409EFF;
	color: #fff;
}

.option-item {
	position: relative;
	
	i.el-icon-check {
		position: absolute;
		right: 10px;
		color: #67C23A;
		font-size: 16px;
	}
	
	i.el-icon-close {
		position: absolute;
		right: 10px;
		color: #F56C6C;
		font-size: 16px;
	}
}

.correct-option .option-prefix {
	background-color: #67C23A;
	color: #fff;
}

.wrong-option .option-prefix {
	background-color: #F56C6C;
	color: #fff;
}

.score-value {
	font-size: 16px;
	font-weight: bold;
	color: #F56C6C;
}
</style> 