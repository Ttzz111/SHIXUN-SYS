<template>
	<cl-crud @load="onLoad">
		<cl-row>
			<!-- 基础按钮 -->
			<cl-refresh-btn @click="refresh" />
			<cl-add-btn @click="add" />
			<cl-multi-delete-btn @click="deleteMulti" />
			
			<!-- 生成试卷按钮 -->
			<el-button type="success" @click="generatePaper">
				<el-icon><Document /></el-icon>
				一键组卷
			</el-button>
			
			<!-- 导出试卷按钮 -->
			<el-button type="primary" @click="exportPaper">
				<el-icon><Download /></el-icon>
				导出试卷
			</el-button>
			
			<cl-flex1 />
			
			<!-- 搜索栏 -->
			<cl-search-key placeholder="输入试卷名称搜索" />
		</cl-row>
		
		<cl-row>
			<!-- 表格组件 -->
			<cl-table ref="Table" @selection-change="selectionChange">
				<!-- 状态格式化 -->
				<template #column-status="{ scope }">
					<el-tag v-if="scope.row.status === 1" type="success">已发布</el-tag>
					<el-tag v-else-if="scope.row.status === 0" type="info">草稿</el-tag>
					<span v-else>未知状态</span>
				</template>
				
				<!-- 试卷类型格式化 -->
				<template #column-paperType="{ scope }">
					<el-tag v-if="scope.row.paperType === 1" type="success">固定试卷</el-tag>
					<el-tag v-else-if="scope.row.paperType === 2" type="warning">随机试卷</el-tag>
					<span v-else>未知类型</span>
				</template>
				
				<!-- 操作按钮 -->
				<template #column-op="{ scope }">
					<el-button 
						type="primary" 
						link 
						@click="viewPaper(scope.row)"
					>预览</el-button>
					<el-button 
						type="primary" 
						link 
						@click="editPaper(scope.row)"
					>编辑</el-button>
					<el-button 
						v-if="scope.row.status === 0" 
						type="success" 
						link 
						@click="publishPaper(scope.row)"
					>发布</el-button>
					<el-button 
						v-if="scope.row.status === 1" 
						type="warning" 
						link 
						@click="unpublishPaper(scope.row)"
					>撤回</el-button>
					<el-button 
						type="danger" 
						link 
						@click="deletePaper(scope.row)"
					>删除</el-button>
				</template>
			</cl-table>
		</cl-row>
		
		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
		
		<!-- 新增/编辑表单 -->
		<cl-upsert ref="Upsert" />
		
		<!-- 一键组卷对话框 -->
		<el-dialog v-model="generateVisible" title="一键组卷" width="600px">
			<el-form :model="generateForm" label-width="120px">
				<el-form-item label="试卷名称" required>
					<el-input v-model="generateForm.name" placeholder="请输入试卷名称"></el-input>
				</el-form-item>
				
				<el-form-item label="试卷总分" required>
					<el-input-number v-model="generateForm.totalScore" :min="1" :max="200" controls-position="right"></el-input-number>
				</el-form-item>
				
				<el-form-item label="试卷时长(分钟)" required>
					<el-input-number v-model="generateForm.duration" :min="10" :max="180" controls-position="right"></el-input-number>
				</el-form-item>
				
				<el-form-item label="试卷类型" required>
					<el-select v-model="generateForm.paperType" style="width: 100%">
						<el-option label="固定试卷" :value="1"></el-option>
						<el-option label="随机试卷" :value="2"></el-option>
					</el-select>
				</el-form-item>
				
				<el-divider>题目配置</el-divider>
				
				<el-form-item label="单选题">
					<div class="question-config">
						<span>数量:</span> 
						<el-input-number v-model="generateForm.singleChoice.count" :min="0" :max="50" size="small" controls-position="right"></el-input-number>
						<span>每题分值:</span> 
						<el-input-number v-model="generateForm.singleChoice.score" :min="1" :max="20" size="small" controls-position="right"></el-input-number>
						<span>难度:</span>
						<el-select v-model="generateForm.singleChoice.level" size="small" style="width: 100px">
							<el-option label="简单" :value="1"></el-option>
							<el-option label="中等" :value="2"></el-option>
							<el-option label="困难" :value="3"></el-option>
							<el-option label="混合" :value="0"></el-option>
						</el-select>
					</div>
				</el-form-item>
				
				<el-form-item label="多选题">
					<div class="question-config">
						<span>数量:</span> 
						<el-input-number v-model="generateForm.multiChoice.count" :min="0" :max="50" size="small" controls-position="right"></el-input-number>
						<span>每题分值:</span> 
						<el-input-number v-model="generateForm.multiChoice.score" :min="1" :max="20" size="small" controls-position="right"></el-input-number>
						<span>难度:</span>
						<el-select v-model="generateForm.multiChoice.level" size="small" style="width: 100px">
							<el-option label="简单" :value="1"></el-option>
							<el-option label="中等" :value="2"></el-option>
							<el-option label="困难" :value="3"></el-option>
							<el-option label="混合" :value="0"></el-option>
						</el-select>
					</div>
				</el-form-item>
				
				<el-form-item label="判断题">
					<div class="question-config">
						<span>数量:</span> 
						<el-input-number v-model="generateForm.judgment.count" :min="0" :max="50" size="small" controls-position="right"></el-input-number>
						<span>每题分值:</span> 
						<el-input-number v-model="generateForm.judgment.score" :min="1" :max="20" size="small" controls-position="right"></el-input-number>
						<span>难度:</span>
						<el-select v-model="generateForm.judgment.level" size="small" style="width: 100px">
							<el-option label="简单" :value="1"></el-option>
							<el-option label="中等" :value="2"></el-option>
							<el-option label="困难" :value="3"></el-option>
							<el-option label="混合" :value="0"></el-option>
						</el-select>
					</div>
				</el-form-item>
				
				<el-form-item label="简答题">
					<div class="question-config">
						<span>数量:</span> 
						<el-input-number v-model="generateForm.essay.count" :min="0" :max="10" size="small" controls-position="right"></el-input-number>
						<span>每题分值:</span> 
						<el-input-number v-model="generateForm.essay.score" :min="1" :max="20" size="small" controls-position="right"></el-input-number>
						<span>难度:</span>
						<el-select v-model="generateForm.essay.level" size="small" style="width: 100px">
							<el-option label="简单" :value="1"></el-option>
							<el-option label="中等" :value="2"></el-option>
							<el-option label="困难" :value="3"></el-option>
							<el-option label="混合" :value="0"></el-option>
						</el-select>
					</div>
				</el-form-item>
				
				<el-form-item>
					<div class="score-summary">
						当前配置总分: <span class="total-score">{{ calculateTotalScore() }}</span>
					</div>
				</el-form-item>
			</el-form>
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="generateVisible = false">取消</el-button>
					<el-button type="primary" @click="confirmGenerate">确认生成</el-button>
				</span>
			</template>
		</el-dialog>
		
		<!-- 预览试卷对话框 -->
		<el-dialog v-model="previewVisible" title="试卷预览" width="800px" :destroy-on-close="true">
			<div class="paper-preview">
				<div class="paper-header">
					<h2>{{ currentPaper.name }}</h2>
					<div class="paper-info">
						<span>总分: {{ currentPaper.totalScore }}分</span>
						<span>时长: {{ currentPaper.duration }}分钟</span>
						<span>试卷类型: {{ currentPaper.paperType === 1 ? '固定试卷' : '随机试卷' }}</span>
					</div>
				</div>
				
				<div class="paper-body">
					<!-- 单选题部分 -->
					<div v-if="currentPaper.questions?.singleChoice?.length" class="question-section">
						<h3>一、单选题（每题{{ currentPaper.singleChoiceScore }}分，共{{ currentPaper.questions.singleChoice.length }}题）</h3>
						<div v-for="(question, index) in currentPaper.questions.singleChoice" :key="'single-'+index" class="question-item">
							<div class="question-title">{{ index + 1 }}. {{ question.content }}</div>
							<div class="options">
								<div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
									{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIndex] }}. {{ option }}
								</div>
							</div>
						</div>
					</div>
					
					<!-- 多选题部分 -->
					<div v-if="currentPaper.questions?.multiChoice?.length" class="question-section">
						<h3>二、多选题（每题{{ currentPaper.multiChoiceScore }}分，共{{ currentPaper.questions.multiChoice.length }}题）</h3>
						<div v-for="(question, index) in currentPaper.questions.multiChoice" :key="'multi-'+index" class="question-item">
							<div class="question-title">{{ index + 1 }}. {{ question.content }}</div>
							<div class="options">
								<div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
									{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIndex] }}. {{ option }}
								</div>
							</div>
						</div>
					</div>
					
					<!-- 判断题部分 -->
					<div v-if="currentPaper.questions?.judgment?.length" class="question-section">
						<h3>三、判断题（每题{{ currentPaper.judgmentScore }}分，共{{ currentPaper.questions.judgment.length }}题）</h3>
						<div v-for="(question, index) in currentPaper.questions.judgment" :key="'judge-'+index" class="question-item">
							<div class="question-title">{{ index + 1 }}. {{ question.content }}</div>
							<div class="options">
								<div class="option-item">A. 正确</div>
								<div class="option-item">B. 错误</div>
							</div>
						</div>
					</div>
					
					<!-- 简答题部分 -->
					<div v-if="currentPaper.questions?.essay?.length" class="question-section">
						<h3>四、简答题（每题{{ currentPaper.essayScore }}分，共{{ currentPaper.questions.essay.length }}题）</h3>
						<div v-for="(question, index) in currentPaper.questions.essay" :key="'essay-'+index" class="question-item">
							<div class="question-title">{{ index + 1 }}. {{ question.content }}</div>
							<div class="answer-area">答题区域：__________</div>
						</div>
					</div>
				</div>
	</div>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCool } from "/@/cool";
import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { Document, Download } from "@element-plus/icons-vue";

// 获取服务
const { service } = useCool();

// 组卷对话框
const generateVisible = ref(false);
const previewVisible = ref(false);

// 选中的行
const selection = ref([]);

// 当前试卷
const currentPaper = ref({});

// 组卷表单
const generateForm = reactive({
	name: '',
	totalScore: 100,
	duration: 60,
	paperType: 1,
	singleChoice: {
		count: 10,
		score: 2,
		level: 0
	},
	multiChoice: {
		count: 5,
		score: 4,
		level: 0
	},
	judgment: {
		count: 10,
		score: 2,
		level: 0
	},
	essay: {
		count: 2,
		score: 10,
		level: 0
	}
});

// 计算当前配置总分
function calculateTotalScore() {
	return (
		generateForm.singleChoice.count * generateForm.singleChoice.score +
		generateForm.multiChoice.count * generateForm.multiChoice.score +
		generateForm.judgment.count * generateForm.judgment.score +
		generateForm.essay.count * generateForm.essay.score
	);
}

// 初始化表格
const Table = useTable({
	columns: [
		{
			type: "selection",
			width: 60
		},
		{
			label: "试卷名称",
			prop: "name",
			minWidth: 180,
			showOverflowTooltip: true
		},
		{
			label: "试卷类型",
			prop: "paperType",
			minWidth: 100
		},
		{
			label: "总分",
			prop: "totalScore",
			minWidth: 80
		},
		{
			label: "时长(分钟)",
			prop: "duration",
			minWidth: 100
		},
		{
			label: "题目数量",
			prop: "questionCount",
			minWidth: 100
		},
		{
			label: "状态",
			prop: "status",
			minWidth: 80
		},
		{
			label: "创建时间",
			prop: "createTime",
			minWidth: 150
		},
		{
			label: "操作",
			type: "op",
			width: 260,
		}
	]
});

// 初始化表单
const Upsert = useUpsert({
	width: "700px",
	items: [
		{
			prop: "name",
			label: "试卷名称",
			component: {
				name: "el-input",
				props: {
					maxlength: 100,
					"show-word-limit": true
				}
			},
			required: true
		},
		{
			prop: "paperType",
			label: "试卷类型",
			value: 1,
			component: {
				name: "el-select",
				options: [
					{
						label: "固定试卷",
						value: 1
					},
					{
						label: "随机试卷",
						value: 2
					}
				]
			},
			required: true
		},
		{
			prop: "totalScore",
			label: "总分",
			value: 100,
			component: {
				name: "el-input-number",
				props: {
					min: 1,
					max: 200
				}
			},
			required: true
		},
		{
			prop: "duration",
			label: "考试时长(分钟)",
			value: 60,
			component: {
				name: "el-input-number",
				props: {
					min: 10,
					max: 180
				}
			},
			required: true
		},
		{
			prop: "description",
			label: "试卷说明",
			component: {
				name: "el-input",
				props: {
					type: "textarea",
					rows: 3,
					maxlength: 500,
					"show-word-limit": true
				}
			},
			required: false
		}
	]
});

// CRUD实例
let crud = null;

// 模拟数据
const mockList = [
	{
		id: 1,
		name: "工程实训项目需求分析测试",
		paperType: 1,
		totalScore: 100,
		duration: 60,
		status: 1,
		createTime: "2023-06-15 10:30:45",
		description: "工程实训项目的需求分析与用例设计知识测试",
		questionCount: 25
	},
	{
		id: 2,
		name: "软件工程项目管理评估",
		paperType: 1,
		totalScore: 100,
		duration: 90,
		status: 1,
		createTime: "2023-06-20 14:25:12",
		description: "软件工程管理与团队协作能力测试",
		questionCount: 30
	},
	{
		id: 3,
		name: "数据库设计与实现考核",
		paperType: 2,
		totalScore: 100,
		duration: 60,
		status: 0,
		createTime: "2023-07-05 09:15:30",
		description: "工程实训中数据库设计与SQL实现技能测试",
		questionCount: 20
	},
	{
		id: 4,
		name: "前端开发技术测验",
		paperType: 1,
		totalScore: 100,
		duration: 45,
		status: 0,
		createTime: "2023-07-10 16:40:22",
		description: "工程实训项目前端开发技术与框架应用测试",
		questionCount: 22
	},
	{
		id: 5,
		name: "系统架构设计评估",
		paperType: 1,
		totalScore: 100,
		duration: 75,
		status: 1,
		createTime: "2023-08-05 08:30:15",
		description: "工程实训项目系统架构与设计模式应用",
		questionCount: 28
	},
	{
		id: 6,
		name: "后端接口开发测试",
		paperType: 2,
		totalScore: 100,
		duration: 90,
		status: 1,
		createTime: "2023-08-18 13:45:30",
		description: "工程实训项目后端API设计与实现测试",
		questionCount: 25
	},
	{
		id: 7,
		name: "软件测试技术考核",
		paperType: 1,
		totalScore: 100,
		duration: 60,
		status: 0,
		createTime: "2023-09-01 10:20:00",
		description: "工程实训项目测试计划与测试用例设计",
		questionCount: 24
	},
	{
		id: 8,
		name: "项目文档编写规范",
		paperType: 2,
		totalScore: 120,
		duration: 120,
		status: 1,
		createTime: "2023-09-15 14:30:45",
		description: "工程实训项目技术文档与用户手册编写规范",
		questionCount: 35
	},
	{
		id: 9,
		name: "敏捷开发流程测验",
		paperType: 1,
		totalScore: 80,
		duration: 45,
		status: 1,
		createTime: "2023-10-05 09:10:20",
		description: "工程实训项目敏捷开发方法与实践",
		questionCount: 20
	},
	{
		id: 10,
		name: "项目部署与运维考核",
		paperType: 2,
		totalScore: 100,
		duration: 60,
		status: 0,
		createTime: "2023-10-20 11:25:35",
		description: "工程实训项目部署、运维与监控技术测试",
		questionCount: 25
	}
];

// 使用useCrud钩子
const { loadData } = useCrud({
	service: {
		page: () => {
			return Promise.resolve({
				list: mockList,
				pagination: {
					total: mockList.length,
					page: 1,
					size: 20
				}
			});
		},
		info: () => {
			return Promise.resolve({});
		},
		add: (data) => {
			// 生成一个新ID
			const newId = Math.max(...mockList.map(item => item.id)) + 1;
			// 创建新试卷对象
			const newPaper = {
				...data,
				id: newId,
				createTime: new Date().toLocaleString(),
				status: 0, // 默认为草稿状态
				questionCount: data.questionCount || Math.floor(Math.random() * 20) + 15 // 随机题目数量
			};
			// 添加到列表
			mockList.unshift(newPaper);
			
			return Promise.resolve({
				code: 1000,
				data: newPaper
			});
		},
		update: (data) => {
			const index = mockList.findIndex(item => item.id === data.id);
			if (index !== -1) {
				mockList[index] = {
					...mockList[index],
					...data
				};
			}
			
			return Promise.resolve({
				code: 1000,
				data: mockList[index]
			});
		},
		delete: (ids) => {
			ids.forEach(id => {
				const index = mockList.findIndex(item => item.id === id);
				if (index !== -1) {
					mockList.splice(index, 1);
				}
			});
			
			return Promise.resolve({
				code: 1000
			});
		}
	}
});

// CRUD初始化加载事件
function onLoad({ ctx, app }: any) {
	console.log("CRUD组件已加载", ctx, app);
	crud = app;
	
	// 替换服务方法
	Object.assign(crud.service, {
		page: () => {
			return Promise.resolve({
				list: mockList,
				pagination: {
					total: mockList.length,
					page: 1,
					size: 20
				}
			});
		},
		info: () => Promise.resolve({}),
		add: (data) => {
			// 生成一个新ID
			const newId = Math.max(...mockList.map(item => item.id)) + 1;
			// 创建新试卷对象
			const newPaper = {
				...data,
				id: newId,
				createTime: new Date().toLocaleString(),
				status: 0, // 默认为草稿状态
				questionCount: data.questionCount || Math.floor(Math.random() * 20) + 15 // 随机题目数量
			};
			// 添加到列表
			mockList.unshift(newPaper);
			
			return Promise.resolve({
				code: 1000,
				data: newPaper
			});
		},
		update: (data) => {
			const index = mockList.findIndex(item => item.id === data.id);
			if (index !== -1) {
				mockList[index] = {
					...mockList[index],
					...data
				};
			}
			
			return Promise.resolve({
				code: 1000,
				data: mockList[index]
			});
		},
		delete: (ids) => {
			ids.forEach(id => {
				const index = mockList.findIndex(item => item.id === id);
				if (index !== -1) {
					mockList.splice(index, 1);
				}
			});
			
			return Promise.resolve({
				code: 1000
			});
		}
	});
	
	// 立即刷新
	setTimeout(() => {
		crud.refresh();
	}, 100);
}

// 模拟数据 (因为只是前端展示，不涉及后端)
function mockData() {
	// 直接更新表格数据
	if (Table.value) {
		Table.value.setData(mockList);
	}
	
	// 请求数据
	if (crud && crud.refresh) {
		crud.refresh();
	}
}

// 选择变更事件
function selectionChange(val: any) {
	selection.value = val;
}

// 刷新列表
function refresh() {
	console.log("刷新按钮被点击");
	if (crud) {
		crud.refresh();
		setTimeout(() => {
			if (Table.value) {
				Table.value.setData(mockList);
			}
		}, 100);
	}
}

// 新增
function add() {
	console.log("新增按钮被点击");
	if (crud) {
		crud.rowAdd();
	}
}

// 批量删除
function deleteMulti() {
	console.log("批量删除按钮被点击", selection.value);
	if (crud && selection.value.length > 0) {
		ElMessageBox.confirm("确定要删除选中的试卷吗?", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning"
		}).then(() => {
			// 删除选中的行
			const ids = selection.value.map(item => item.id);
			
			// 从mockList中删除
			ids.forEach(id => {
				const index = mockList.findIndex(item => item.id === id);
				if (index !== -1) {
					mockList.splice(index, 1);
				}
			});
			
			// 更新表格数据
			if (Table.value) {
				Table.value.setData(mockList);
			}
			
			ElMessage.success("删除成功");
			crud.refresh();
		});
	}
}

// 打开组卷对话框
function generatePaper() {
	// 重置表单数据
	Object.assign(generateForm, {
		name: '',
		totalScore: 100,
		duration: 60,
		paperType: 1,
		singleChoice: {
			count: 10,
			score: 2,
			level: 0
		},
		multiChoice: {
			count: 5,
			score: 4,
			level: 0
		},
		judgment: {
			count: 10,
			score: 2,
			level: 0
		},
		essay: {
			count: 2,
			score: 10,
			level: 0
		}
	});
	
	generateVisible.value = true;
}

// 确认生成试卷
function confirmGenerate() {
	const totalScore = calculateTotalScore();
	if (totalScore !== generateForm.totalScore) {
		ElMessage.warning(`当前配置题目总分(${totalScore})与预设总分(${generateForm.totalScore})不一致，请调整`);
		return;
	}
	
	if (generateForm.name.trim() === '') {
		ElMessage.warning("请输入试卷名称");
		return;
	}
	
	// 创建新试卷
	const newPaper = {
		name: generateForm.name,
		paperType: generateForm.paperType,
		totalScore: generateForm.totalScore,
		duration: generateForm.duration,
		description: generateForm.paperType === 1 ? "固定试卷，题目内容固定" : "随机试卷，每次抽取不同题目",
		status: 0, // 草稿状态
		singleChoiceCount: generateForm.singleChoice.count,
		multiChoiceCount: generateForm.multiChoice.count,
		judgmentCount: generateForm.judgment.count,
		essayCount: generateForm.essay.count,
		singleChoiceScore: generateForm.singleChoice.score,
		multiChoiceScore: generateForm.multiChoice.score,
		judgmentScore: generateForm.judgment.score,
		essayScore: generateForm.essay.score,
		questionCount: generateForm.singleChoice.count + generateForm.multiChoice.count + 
					  generateForm.judgment.count + generateForm.essay.count
	};
	
	// 关闭对话框
	generateVisible.value = false;
	
	// 直接添加到列表中
	if (crud) {
		// 添加新数据到mockList
		const newId = Math.max(...mockList.map(item => item.id)) + 1;
		const newPaperWithId = {
			...newPaper,
			id: newId,
			createTime: new Date().toLocaleString()
		};
		mockList.unshift(newPaperWithId);
		
		ElMessage.success("试卷生成成功!");
		
		// 刷新表格
		if (Table.value) {
			Table.value.setData(mockList);
		}
		
		// 刷新CRUD视图
		crud.refresh();
	} else {
		ElMessage.error("系统错误，请稍后重试!");
	}
}

// 导出试卷
function exportPaper() {
	if (selection.value.length === 0) {
		ElMessage.warning("请选择要导出的试卷");
		return;
	}
	
	ElMessage.success("试卷导出成功!");
}

// 查看试卷
function viewPaper(row) {
	// 准备试题数据库
	const questionBank = {
		singleChoice: [
			{
				content: "在工程实训项目中，需求分析阶段的主要任务是什么？",
				options: ["编写代码", "确定软件需要实现的功能", "进行系统测试", "部署软件"],
				answers: ["确定软件需要实现的功能"]
			},
			{
				content: "工程实训过程中，关于接口和抽象类的描述，以下哪项是正确的？",
				options: ["接口可以包含实现代码，抽象类不能", "一个类可以实现多个接口，但只能继承一个抽象类", "抽象类中的方法必须是抽象的", "接口中不能定义变量"],
				answers: ["一个类可以实现多个接口，但只能继承一个抽象类"]
			},
			{
				content: "在工程实训项目的面向对象编程中，下列哪种关系表示'是一种'的概念？",
				options: ["组合关系", "聚合关系", "继承关系", "依赖关系"],
				answers: ["继承关系"]
			},
			{
				content: "工程实训项目中，以下哪种数据结构适合实现先进先出（FIFO）的操作？",
				options: ["栈", "队列", "树", "图"],
				answers: ["队列"]
			},
			{
				content: "在工程实训项目的Web开发中，HTTP状态码200表示什么？",
				options: ["请求成功", "资源未找到", "服务器错误", "重定向"],
				answers: ["请求成功"]
			},
			{
				content: "工程实训项目中，以下哪个不是关系型数据库管理系统？",
				options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
				answers: ["MongoDB"]
			},
			{
				content: "在工程实训的前端开发中，下列哪个CSS选择器的优先级最高？",
				options: ["标签选择器", "类选择器", "ID选择器", "通配符选择器"],
				answers: ["ID选择器"]
			},
			{
				content: "工程实训项目中，以下哪个协议用于安全的网页浏览？",
				options: ["HTTP", "FTP", "HTTPS", "SMTP"],
				answers: ["HTTPS"]
			},
			{
				content: "在工程实训项目的前端开发中，以下哪个不是JavaScript的数据类型？",
				options: ["String", "Boolean", "Float", "Undefined"],
				answers: ["Float"]
			},
			{
				content: "工程实训常用的Python中，以下哪个不是内置的数据结构？",
				options: ["List", "Dictionary", "Set", "Tree"],
				answers: ["Tree"]
			}
		],
		multiChoice: [
			{
				content: "在工程实训项目中使用Git版本控制系统，以下哪些命令用于将本地更改提交到远程仓库？",
				options: ["git pull", "git push", "git commit", "git fetch", "git merge"],
				answers: ["git commit", "git push"]
			},
			{
				content: "工程实训项目中，以下哪些是JavaScript的基本数据类型？",
				options: ["Number", "String", "Boolean", "Object", "Array"],
				answers: ["Number", "String", "Boolean"]
			},
			{
				content: "关于工程实训项目中SQL注入攻击的防御措施，下列哪些是有效的？",
				options: ["使用参数化查询", "输入验证", "使用ORM框架", "不验证用户输入", "使用存储过程"],
				answers: ["使用参数化查询", "输入验证", "使用ORM框架", "使用存储过程"]
			},
			{
				content: "工程实训项目开发中，以下哪些属于敏捷开发方法？",
				options: ["Scrum", "XP（极限编程）", "瀑布模型", "看板（Kanban）", "原型法"],
				answers: ["Scrum", "XP（极限编程）", "看板（Kanban）"]
			},
			{
				content: "在工程实训的Web开发中，以下哪些技术用于前端开发？",
				options: ["HTML", "CSS", "JavaScript", "PHP", "Java"],
				answers: ["HTML", "CSS", "JavaScript"]
			},
			{
				content: "工程实训项目中，以下哪些是关系型数据库的特点？",
				options: ["使用表格存储数据", "支持SQL查询", "强一致性", "高扩展性", "无Schema设计"],
				answers: ["使用表格存储数据", "支持SQL查询", "强一致性"]
			},
			{
				content: "关于工程实训项目中RESTful API设计，以下哪些说法是正确的？",
				options: [
					"使用HTTP方法表示操作类型", 
					"资源通过URL进行标识", 
					"状态由客户端维护", 
					"所有请求都必须使用POST方法", 
					"总是返回XML格式数据"
				],
				answers: ["使用HTTP方法表示操作类型", "资源通过URL进行标识", "状态由客户端维护"]
			}
		],
		judgment: [
			{
				content: "在工程实训的软件测试中，单元测试主要关注的是程序的最小可测试单元。",
				answers: ["正确"]
			},
			{
				content: "工程实训项目中，HTTPS协议只使用对称加密技术。",
				answers: ["错误"]
			},
			{
				content: "在工程实训项目的Java开发中，所有的类都直接或间接继承自Object类。",
				answers: ["正确"]
			},
			{
				content: "工程实训项目的数据库设计中，主键允许有重复值。",
				answers: ["错误"]
			},
			{
				content: "在工程实训项目的前端开发中，HTML5的<article>标签用于定义独立的自包含内容。",
				answers: ["正确"]
			},
			{
				content: "工程实训项目中使用的JavaScript是一种编译型语言。",
				answers: ["错误"]
			},
			{
				content: "在工程实训项目的Python开发中，缩进是用来表示代码块的。",
				answers: ["正确"]
			},
			{
				content: "工程实训项目的Web开发中，HTTP协议是无状态的协议。",
				answers: ["正确"]
			},
			{
				content: "在工程实训项目的前端开发中，CSS选择器中，.className表示选择所有class属性为className的元素。",
				answers: ["正确"]
			},
			{
				content: "工程实训项目数据库开发中，在SQL的GROUP BY子句中必须使用HAVING子句。",
				answers: ["错误"]
			}
		],
		essay: [
			{
				content: "请简述工程实训项目中敏捷开发方法与传统瀑布模型的主要区别。",
				answers: ["敏捷开发强调迭代、增量式开发，强调团队协作和快速响应变化，而瀑布模型是一种线性开发方法，按照固定的阶段顺序进行，不易应对需求变更。在工程实训项目中，敏捷开发更适合需求变化较频繁的场景。"]
			},
			{
				content: "请简述工程实训项目中分布式系统的主要特点和面临的主要挑战。",
				answers: ["分布式系统的主要特点包括：资源共享、开放性、并发性、可扩展性、透明性等。面临的主要挑战有：异构性、安全性、故障容错、可伸缩性、一致性等问题。在工程实训项目中，需要考虑这些挑战并采取相应的架构设计和技术方案。"]
			},
			{
				content: "请解释工程实训项目中面向对象编程的封装、继承和多态的概念，并举例说明它们的应用场景。",
				answers: ["封装是将数据和方法组合在一个单元中，并对外部隐藏实现细节；继承是一种类之间的关系，子类继承父类的属性和方法；多态允许不同类的对象对同一消息做出响应，实现了接口的统一性和实现的多样性。应用场景：例如在工程实训项目的系统设计中，可以定义一个用户基类，不同类型的用户通过继承获得基本属性，并通过多态实现不同的业务逻辑处理。"]
			},
			{
				content: "请分析工程实训项目中关系型数据库和NoSQL数据库的区别，以及各自在项目中适用的场景。",
				answers: ["关系型数据库采用表格模型存储数据，支持ACID事务，适合结构化数据和复杂查询；NoSQL数据库采用多种数据模型，如键值、文档、列族、图等，通常提供更高的扩展性和性能，但弱化了一致性。在工程实训项目中，关系型数据库适用于需要严格事务的核心业务数据管理，NoSQL适合大规模数据处理、实时应用和灵活Schema的应用场景如日志分析、即时消息等。"]
			},
			{
				content: "请评述云计算对工程实训项目的软件开发和部署方式带来的变革。",
				answers: ["云计算为工程实训项目带来了根本性变革：1）资源弹性伸缩，按需付费；2）降低了基础设施投入和维护成本；3）促进了微服务架构和容器技术的发展；4）实现了持续集成/持续部署(CI/CD)；5）催生了DevOps文化和工具链；6）提高了应用的可用性和可靠性；7）加速了全球化部署和服务交付；8）带来了新的安全和合规挑战。在工程实训项目中，可以充分利用云服务简化开发环境搭建和应用部署。"]
			}
		]
	};
	
	// 根据试卷配置生成对应数量的题目
	const singleChoiceCount = row.singleChoiceCount || Math.floor(Math.random() * 5) + 3;
	const multiChoiceCount = row.multiChoiceCount || Math.floor(Math.random() * 3) + 2;
	const judgmentCount = row.judgmentCount || Math.floor(Math.random() * 4) + 3;
	const essayCount = row.essayCount || Math.floor(Math.random() * 2) + 1;
	
	// 随机选择题目
	const getRandomQuestions = (arr, count) => {
		const shuffled = [...arr].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, Math.min(count, arr.length));
	};
	
	// 模拟获取试卷详情
	const paperDetail = {
		...row,
		singleChoiceScore: row.singleChoiceScore || 2,
		multiChoiceScore: row.multiChoiceScore || 4,
		judgmentScore: row.judgmentScore || 2,
		essayScore: row.essayScore || 10,
		questions: {
			singleChoice: getRandomQuestions(questionBank.singleChoice, singleChoiceCount),
			multiChoice: getRandomQuestions(questionBank.multiChoice, multiChoiceCount),
			judgment: getRandomQuestions(questionBank.judgment, judgmentCount),
			essay: getRandomQuestions(questionBank.essay, essayCount)
		}
	};
	
	currentPaper.value = paperDetail;
	previewVisible.value = true;
}

// 编辑试卷
function editPaper(row) {
	if (crud) {
		crud.rowEdit(row);
	}
}

// 发布试卷
function publishPaper(row) {
	ElMessageBox.confirm("确定要发布该试卷吗?", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	}).then(() => {
		// 修改状态
		const index = mockList.findIndex(item => item.id === row.id);
		if (index !== -1) {
			mockList[index].status = 1;
		}
		
		// 更新表格数据
		if (Table.value) {
			Table.value.setData(mockList);
		}
		
		ElMessage.success("发布成功");
		crud.refresh();
	});
}

// 撤回试卷
function unpublishPaper(row) {
	ElMessageBox.confirm("确定要撤回该试卷吗?", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	}).then(() => {
		// 修改状态
		const index = mockList.findIndex(item => item.id === row.id);
		if (index !== -1) {
			mockList[index].status = 0;
		}
		
		// 更新表格数据
		if (Table.value) {
			Table.value.setData(mockList);
		}
		
		ElMessage.success("撤回成功");
		crud.refresh();
	});
}

// 删除试卷
function deletePaper(row) {
	ElMessageBox.confirm("确定要删除该试卷吗?", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	}).then(() => {
		// 从mockList中删除
		const index = mockList.findIndex(item => item.id === row.id);
		if (index !== -1) {
			mockList.splice(index, 1);
		}
		
		// 更新表格数据
		if (Table.value) {
			Table.value.setData(mockList);
		}
		
		ElMessage.success("删除成功");
		crud.refresh();
	});
}
</script>

<style lang="scss" scoped>
.question-config {
	display: flex;
	align-items: center;
	gap: 10px;
	
	span {
		margin-right: 5px;
	}
}

.score-summary {
	text-align: right;
	margin-top: 10px;
	font-size: 14px;
	
	.total-score {
		font-size: 16px;
		font-weight: bold;
		color: #f56c6c;
	}
}

.paper-preview {
	padding: 10px;
	
	.paper-header {
		text-align: center;
		margin-bottom: 20px;
		
		h2 {
			margin-bottom: 10px;
		}
		
		.paper-info {
			display: flex;
			justify-content: center;
			gap: 20px;
			color: #666;
			font-size: 14px;
		}
	}
	
	.paper-body {
		.question-section {
			margin-bottom: 20px;
			
			h3 {
				margin-bottom: 15px;
				font-size: 16px;
				border-bottom: 1px solid #eee;
				padding-bottom: 8px;
			}
			
			.question-item {
				margin-bottom: 15px;
				
				.question-title {
					margin-bottom: 8px;
					font-weight: bold;
				}
				
				.options {
					margin-left: 20px;
					
					.option-item {
						margin-bottom: 5px;
					}
				}
				
				.answer-area {
					margin-top: 10px;
					margin-left: 20px;
					color: #999;
				}
			}
		}
	}
}
</style> 