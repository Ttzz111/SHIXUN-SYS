<template>
	<div class="fake-container">
		<cl-crud ref="Crud">
			<el-row class="mb20">
				<el-col :span="24">
					<cl-refresh-btn />
					<cl-add-btn class="ml10" />
					<cl-multi-delete-btn class="ml10" />
					<el-button type="primary" @click="showImportDialog" class="ml10">
						<template #icon>
							<el-icon><Upload /></el-icon>
						</template>
						<span>批量导入</span>
					</el-button>
				</el-col>
			</el-row>

			<el-row :gutter="15" class="mb20">
				<el-col :span="6">
					<cl-filter label="题目内容">
						<el-input v-model="form.content" placeholder="请输入题目内容" clearable @keydown.enter="search" />
					</cl-filter>
				</el-col>
				
				<el-col :span="6">
					<cl-filter label="题目类型">
						<el-select v-model="form.type" placeholder="请选择题目类型" clearable @change="search">
							<el-option label="单选题" :value="1" />
							<el-option label="多选题" :value="2" />
							<el-option label="判断题" :value="3" />
							<el-option label="简答题" :value="4" />
						</el-select>
					</cl-filter>
				</el-col>
				
				<el-col :span="6">
					<cl-filter label="难度等级">
						<el-select v-model="form.level" placeholder="请选择难度等级" clearable @change="search">
							<el-option label="简单" :value="1" />
							<el-option label="中等" :value="2" />
							<el-option label="困难" :value="3" />
						</el-select>
					</cl-filter>
				</el-col>
				
				<el-col :span="6">
					<cl-search-key placeholder="输入题目内容搜索" />
				</el-col>
			</el-row>

			<el-table :data="tableData" border style="width: 100%" class="mb20">
				<el-table-column type="selection" width="55" />
				<el-table-column prop="content" label="题目内容" min-width="200" show-overflow-tooltip />
				<el-table-column prop="typeText" label="题目类型" width="100" />
				<el-table-column prop="score" label="分值" width="80" />
				<el-table-column prop="levelText" label="难度等级" width="100" />
				<el-table-column prop="createTime" label="创建时间" width="150" />
				<el-table-column label="操作" width="150">
					<template #default="scope">
						<el-button size="small" @click="viewQuestion(scope.row)">查看</el-button>
						<el-button size="small" type="danger" @click="deleteQuestion(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-row type="flex" justify="end">
				<cl-flex1 />
				<el-pagination
					v-model:current-page="pagination.page"
					v-model:page-size="pagination.size"
					:total="pagination.total"
					:page-sizes="[10, 20, 50, 100]"
					layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
				/>
			</el-row>
		</cl-crud>

		<!-- 查看题目详情对话框 -->
		<el-dialog v-model="detailDialog.visible" :title="detailDialog.title" width="600px">
			<div class="question-detail">
				<div class="detail-item">
					<div class="label">题目内容:</div>
					<div class="content">{{ detailDialog.question.content }}</div>
				</div>
				<div class="detail-item">
					<div class="label">题目类型:</div>
					<div class="content">{{ detailDialog.question.typeText }}</div>
				</div>
				<div class="detail-item">
					<div class="label">分值:</div>
					<div class="content">{{ detailDialog.question.score }}</div>
				</div>
				<div class="detail-item">
					<div class="label">难度等级:</div>
					<div class="content">{{ detailDialog.question.levelText }}</div>
				</div>
				
				<div v-if="[1, 2, 3].includes(detailDialog.question.type)" class="detail-item">
					<div class="label">选项:</div>
					<div class="content">
						<ul>
							<li v-for="(option, index) in detailDialog.question.options" :key="index">
								{{ option }}
							</li>
						</ul>
					</div>
				</div>
				
				<div class="detail-item">
					<div class="label">{{ [1, 2, 3].includes(detailDialog.question.type) ? '正确答案:' : '参考答案:' }}</div>
					<div class="content">
						<ul v-if="Array.isArray(detailDialog.question.answers)">
							<li v-for="(answer, index) in detailDialog.question.answers" :key="index">
								{{ answer }}
							</li>
						</ul>
						<span v-else>{{ detailDialog.question.answers }}</span>
					</div>
				</div>
				
				<div class="detail-item">
					<div class="label">解析:</div>
					<div class="content">{{ detailDialog.question.analysis }}</div>
				</div>
				
				<div class="detail-item">
					<div class="label">标签:</div>
					<div class="content">
						<el-tag v-for="tag in detailDialog.question.tags" :key="tag" style="margin-right: 5px">
							{{ tag }}
						</el-tag>
					</div>
				</div>
			</div>
		</el-dialog>

		<!-- 批量导入对话框 -->
		<el-dialog v-model="importDialog.visible" title="批量导入题目" width="500px">
			<el-upload
				class="upload-demo"
				drag
				action="#"
				:auto-upload="false"
				:on-change="handleFileChange"
				accept=".xlsx,.xls"
			>
				<el-icon class="el-icon--upload"><Upload /></el-icon>
				<div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
				<template #tip>
					<div class="el-upload__tip">
						请上传Excel格式的题库文件(.xlsx或.xls)，
						<el-link type="primary" :underline="true" href="#" @click.prevent="downloadTemplate">下载模板</el-link>
					</div>
				</template>
			</el-upload>
			<div class="dialog-footer">
				<el-button @click="importDialog.visible = false">取消</el-button>
				<el-button type="primary" @click="simulateImport">确认导入</el-button>
			</div>
		</el-dialog>

		<!-- 添加/编辑题目对话框 -->
		<el-dialog 
			v-model="editDialog.visible" 
			:title="editDialog.isEdit ? '编辑题目' : '添加题目'" 
			width="700px"
			destroy-on-close
		>
			<el-form :model="editDialog.form" label-width="100px" ref="editFormRef">
				<el-form-item label="题目内容" prop="content" required>
					<el-input 
						v-model="editDialog.form.content" 
						type="textarea" 
						:rows="4" 
						maxlength="500" 
						show-word-limit
						placeholder="请输入题目内容"
					/>
				</el-form-item>
				
				<el-form-item label="题目类型" prop="type" required>
					<el-select v-model="editDialog.form.type" placeholder="请选择题目类型" @change="handleTypeChange">
						<el-option label="单选题" :value="1" />
						<el-option label="多选题" :value="2" />
						<el-option label="判断题" :value="3" />
						<el-option label="简答题" :value="4" />
					</el-select>
				</el-form-item>
				
				<el-form-item label="分值" prop="score" required>
					<el-input-number v-model="editDialog.form.score" :min="1" :max="100" />
				</el-form-item>
				
				<el-form-item label="难度等级" prop="level" required>
					<el-select v-model="editDialog.form.level" placeholder="请选择难度等级">
						<el-option label="简单" :value="1" />
						<el-option label="中等" :value="2" />
						<el-option label="困难" :value="3" />
					</el-select>
				</el-form-item>
				
				<el-form-item label="选项" prop="options" v-if="[1, 2, 3].includes(editDialog.form.type)">
					<el-card class="box-card" shadow="never">
						<template v-for="(option, index) in editDialog.form.options" :key="index">
							<div class="option-item">
								<el-input v-model="editDialog.form.options[index]" placeholder="请输入选项内容" />
								<el-button 
									type="danger" 
									icon="Delete" 
									circle 
									@click="removeOption(index)"
									v-if="editDialog.form.type !== 3 || editDialog.form.options.length > 2"
								/>
							</div>
						</template>
						<el-button type="primary" @click="addOption" v-if="editDialog.form.type !== 3">添加选项</el-button>
					</el-card>
				</el-form-item>
				
				<el-form-item 
					:label="[1, 2, 3].includes(editDialog.form.type) ? '正确答案' : '参考答案'" 
					prop="answers" 
					required
				>
					<el-select 
						v-if="[1, 2, 3].includes(editDialog.form.type)"
						v-model="editDialog.form.answers" 
						:multiple="editDialog.form.type === 2"
						placeholder="请选择正确答案"
					>
						<el-option 
							v-for="(option, index) in editDialog.form.options" 
							:key="index" 
							:label="option" 
							:value="option"
						/>
					</el-select>
					<el-input 
						v-else
						v-model="editDialog.form.answerText" 
						type="textarea" 
						:rows="4"
						placeholder="请输入参考答案"
					/>
				</el-form-item>
				
				<el-form-item label="解析" prop="analysis">
					<el-input 
						v-model="editDialog.form.analysis" 
						type="textarea" 
						:rows="3"
						placeholder="请输入题目解析"
					/>
				</el-form-item>
				
				<el-form-item label="标签" prop="tags">
					<el-select
						v-model="editDialog.form.tags"
						multiple
						filterable
						allow-create
						default-first-option
						placeholder="请输入标签"
					>
						<el-option
							v-for="tag in tagOptions"
							:key="tag"
							:label="tag"
							:value="tag"
						/>
					</el-select>
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="editDialog.visible = false">取消</el-button>
					<el-button type="primary" @click="saveQuestion">确认</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Delete } from '@element-plus/icons-vue';

// 表单数据
const form = reactive({
	content: '',
	type: undefined,
	level: undefined
});

// 搜索方法
function search() {
	loadTableData();
}

// 分页信息
const pagination = reactive({
	page: 1,
	size: 10,
	total: 0
});

// 分页方法
const handleSizeChange = (val: number) => {
	pagination.size = val;
	loadTableData();
};

const handleCurrentChange = (val: number) => {
	pagination.page = val;
	loadTableData();
};

// 表格数据
const tableData = ref([]);

// 导入对话框
const importDialog = reactive({
	visible: false,
	file: null
});

// 打开导入对话框
const showImportDialog = () => {
	importDialog.visible = true;
};

// 文件变更事件
const handleFileChange = (file) => {
	importDialog.file = file;
};

// 下载模板
const downloadTemplate = () => {
	ElMessage.info('模板下载功能模拟中...');
};

// 模拟导入
const simulateImport = () => {
	if (!importDialog.file) {
		ElMessage.warning('请先选择文件');
		return;
	}
	
	ElMessage.success('模拟导入成功，已添加5条数据');
	importDialog.visible = false;
	
	// 添加一些随机题目
	addRandomQuestions(5);
	
	// 刷新表格
	loadTableData();
};

// 问题详情对话框
const detailDialog = reactive({
	visible: false,
	title: '题目详情',
	question: {}
});

// 查看题目详情
const viewQuestion = (row) => {
	detailDialog.question = row;
	detailDialog.visible = true;
};

// 删除题目
const deleteQuestion = (row) => {
	ElMessageBox.confirm('确定要删除这道题目吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		// 从本地存储中删除
		const questions = JSON.parse(localStorage.getItem('fakeQuestions') || '[]');
		const index = questions.findIndex(q => q.id === row.id);
		if (index !== -1) {
			questions.splice(index, 1);
			localStorage.setItem('fakeQuestions', JSON.stringify(questions));
			ElMessage.success('删除成功');
			loadTableData();
		}
	}).catch(() => {
		// 取消删除
	});
};

// 添加/编辑对话框
const editDialog = reactive({
	visible: false,
	isEdit: false,
	form: {
		id: 0,
		content: '',
		type: 1,
		score: 5,
		level: 1,
		options: ['', ''],
		answers: [],
		answerText: '',
		analysis: '',
		tags: []
	}
});

// 编辑表单ref
const editFormRef = ref(null);

// 标签选项
const tagOptions = [
	'软件工程', '版本控制', '需求分析', '测试', '开发方法', 
	'Java', '面向对象', '云计算', '虚拟化', '容器', 
	'Docker', '网络安全', 'HTTPS', '数据中心', '大数据', 'Hadoop'
];

// 处理题目类型变化
const handleTypeChange = (val) => {
	// 如果是判断题，自动设置选项为"正确"和"错误"
	if (val === 3) {
		editDialog.form.options = ['正确', '错误'];
	} else if (editDialog.form.options.length === 0) {
		editDialog.form.options = ['', ''];
	}
	
	// 清空答案
	editDialog.form.answers = val === 2 ? [] : '';
};

// 添加选项
const addOption = () => {
	editDialog.form.options.push('');
};

// 移除选项
const removeOption = (index) => {
	editDialog.form.options.splice(index, 1);
};

// 保存题目
const saveQuestion = () => {
	// 表单验证
	if (!editDialog.form.content) {
		ElMessage.warning('请输入题目内容');
		return;
	}
	
	if (editDialog.form.type === undefined) {
		ElMessage.warning('请选择题目类型');
		return;
	}
	
	if (!editDialog.form.score) {
		ElMessage.warning('请输入分值');
		return;
	}
	
	if (editDialog.form.level === undefined) {
		ElMessage.warning('请选择难度等级');
		return;
	}
	
	if ([1, 2, 3].includes(editDialog.form.type)) {
		// 检查选项
		if (editDialog.form.options.some(option => !option)) {
			ElMessage.warning('请填写完整的选项');
			return;
		}
		
		// 检查答案
		if (editDialog.form.type === 1 && !editDialog.form.answers) {
			ElMessage.warning('请选择正确答案');
			return;
		} else if (editDialog.form.type === 2 && editDialog.form.answers.length === 0) {
			ElMessage.warning('请选择正确答案');
			return;
		} else if (editDialog.form.type === 3 && !editDialog.form.answers) {
			ElMessage.warning('请选择正确答案');
			return;
		}
	} else {
		// 简答题检查参考答案
		if (!editDialog.form.answerText) {
			ElMessage.warning('请输入参考答案');
			return;
		}
	}
	
	// 构建要保存的题目对象
	const typeMap = {
		1: '单选题',
		2: '多选题',
		3: '判断题',
		4: '简答题'
	};
	
	const levelMap = {
		1: '简单',
		2: '中等',
		3: '困难'
	};
	
	const question = {
		id: editDialog.isEdit ? editDialog.form.id : Date.now(),
		content: editDialog.form.content,
		type: editDialog.form.type,
		typeText: typeMap[editDialog.form.type],
		score: editDialog.form.score,
		level: editDialog.form.level,
		levelText: levelMap[editDialog.form.level],
		options: [1, 2, 3].includes(editDialog.form.type) ? [...editDialog.form.options] : [],
		answers: editDialog.form.type === 4 ? [editDialog.form.answerText] : 
				 (editDialog.form.type === 2 ? [...editDialog.form.answers] : [editDialog.form.answers]),
		analysis: editDialog.form.analysis,
		tags: [...editDialog.form.tags],
		createTime: editDialog.isEdit ? editDialog.form.createTime : new Date().toISOString().slice(0, 19).replace('T', ' ')
	};
	
	// 从本地存储中获取现有题目
	const questions = JSON.parse(localStorage.getItem('fakeQuestions') || '[]');
	
	if (editDialog.isEdit) {
		// 编辑模式：更新现有题目
		const index = questions.findIndex(q => q.id === question.id);
		if (index !== -1) {
			questions[index] = question;
		}
	} else {
		// 添加模式：添加新题目
		questions.push(question);
	}
	
	// 保存回本地存储
	localStorage.setItem('fakeQuestions', JSON.stringify(questions));
	
	// 关闭对话框并刷新表格
	editDialog.visible = false;
	ElMessage.success(editDialog.isEdit ? '更新成功' : '添加成功');
	loadTableData();
};

// 打开添加对话框
const openAddDialog = () => {
	// 重置表单
	editDialog.form = {
		id: 0,
		content: '',
		type: 1,
		score: 5,
		level: 1,
		options: ['', ''],
		answers: [],
		answerText: '',
		analysis: '',
		tags: []
	};
	editDialog.isEdit = false;
	editDialog.visible = true;
};

// 打开编辑对话框
const openEditDialog = (row) => {
	const answers = row.answers || [];
	
	// 设置表单数据
	editDialog.form = {
		id: row.id,
		content: row.content,
		type: row.type,
		score: row.score,
		level: row.level,
		options: [...(row.options || [])],
		answers: row.type === 2 ? [...answers] : (answers.length > 0 ? answers[0] : ''),
		answerText: row.type === 4 && answers.length > 0 ? answers[0] : '',
		analysis: row.analysis || '',
		tags: [...(row.tags || [])],
		createTime: row.createTime
	};
	
	editDialog.isEdit = true;
	editDialog.visible = true;
};

// 加载表格数据
const loadTableData = () => {
	// 从本地存储中获取题目
	let questions = JSON.parse(localStorage.getItem('fakeQuestions') || '[]');
	
	// 应用筛选条件
	if (form.content) {
		questions = questions.filter(q => q.content.includes(form.content));
	}
	
	if (form.type !== undefined && form.type !== null) {
		questions = questions.filter(q => q.type === form.type);
	}
	
	if (form.level !== undefined && form.level !== null) {
		questions = questions.filter(q => q.level === form.level);
	}
	
	// 更新分页信息
	pagination.total = questions.length;
	
	// 应用分页
	const start = (pagination.page - 1) * pagination.size;
	const end = start + pagination.size;
	tableData.value = questions.slice(start, end);
};

// 添加随机题目
const addRandomQuestions = (count) => {
	// 获取现有题目
	const questions = JSON.parse(localStorage.getItem('fakeQuestions') || '[]');
	
	// 题目模板
	const templates = [
		{
			content: "在软件工程中，需求分析阶段的主要任务是什么？",
			type: 1,
			typeText: '单选题',
			score: 5,
			level: 2,
			levelText: '中等',
			options: ["编写代码", "确定软件需要实现的功能", "进行系统测试", "部署软件"],
			answers: ["确定软件需要实现的功能"],
			analysis: "需求分析是软件工程的第一步，主要任务是明确用户需求，确定软件需要实现的功能。",
			tags: ["软件工程", "需求分析"]
		},
		{
			content: "Git版本控制系统中，以下哪些命令用于将本地更改提交到远程仓库？",
			type: 2,
			typeText: '多选题',
			score: 8,
			level: 2,
			levelText: '中等',
			options: ["git pull", "git push", "git commit", "git fetch", "git merge"],
			answers: ["git commit", "git push"],
			analysis: "git commit用于将更改提交到本地仓库，git push用于将本地更改推送到远程仓库。",
			tags: ["Git", "版本控制"]
		},
		{
			content: "在软件测试中，单元测试主要关注的是程序的最小可测试单元。",
			type: 3,
			typeText: '判断题',
			score: 3,
			level: 1,
			levelText: '简单',
			options: ["正确", "错误"],
			answers: ["正确"],
			analysis: "单元测试是对软件中的最小可测试单元进行检查和验证的过程，通常是函数或方法。",
			tags: ["软件测试", "单元测试"]
		},
		{
			content: "请简述敏捷开发方法与传统瀑布模型的主要区别。",
			type: 4,
			typeText: '简答题',
			score: 10,
			level: 3,
			levelText: '困难',
			answers: ["敏捷开发强调迭代、增量式开发，强调团队协作和快速响应变化，而瀑布模型是一种线性开发方法，按照固定的阶段顺序进行，不易应对需求变更。"],
			analysis: "敏捷开发和瀑布模型的主要区别在于开发流程、需求变更处理方式和交付周期等方面。",
			tags: ["软件工程", "开发方法"]
		},
		{
			content: "在Java编程中，关于接口和抽象类的描述，以下哪项是正确的？",
			type: 1,
			typeText: '单选题',
			score: 5,
			level: 2,
			levelText: '中等',
			options: ["接口可以包含实现代码，抽象类不能", "一个类可以实现多个接口，但只能继承一个抽象类", "抽象类中的方法必须是抽象的", "接口中不能定义变量"],
			answers: ["一个类可以实现多个接口，但只能继承一个抽象类"],
			analysis: "Java支持多接口实现，但只支持单继承，即一个类只能继承一个抽象类或具体类。",
			tags: ["Java", "面向对象"]
		},
		{
			content: "在云计算环境下，IaaS（基础设施即服务）提供的主要资源是什么？",
			type: 1,
			typeText: '单选题',
			score: 5,
			level: 2,
			levelText: '中等',
			options: ["操作系统", "应用程序", "计算资源和存储资源", "开发环境"],
			answers: ["计算资源和存储资源"],
			analysis: "IaaS主要提供虚拟化的计算资源、存储资源和网络资源等基础设施服务。",
			tags: ["云计算", "虚拟化"]
		},
		{
			content: "以下哪些是容器化技术的优势？",
			type: 2,
			typeText: '多选题',
			score: 8,
			level: 2,
			levelText: '中等',
			options: ["轻量级", "隔离性好", "可移植性强", "启动速度快", "资源占用少"],
			answers: ["轻量级", "可移植性强", "启动速度快", "资源占用少"],
			analysis: "容器化技术相比虚拟机具有轻量级、启动快速、资源占用少、可移植性强等优势。",
			tags: ["容器", "Docker"]
		},
		{
			content: "网络安全中，HTTPS协议使用的是对称加密技术。",
			type: 3,
			typeText: '判断题',
			score: 3,
			level: 1,
			levelText: '简单',
			options: ["正确", "错误"],
			answers: ["错误"],
			analysis: "HTTPS协议使用的是非对称加密和对称加密的组合，非对称加密用于密钥交换，对称加密用于数据传输。",
			tags: ["网络安全", "HTTPS"]
		},
		{
			content: "请简述虚拟化技术在现代数据中心中的应用和优势。",
			type: 4,
			typeText: '简答题',
			score: 10,
			level: 3,
			levelText: '困难',
			answers: ["虚拟化技术使数据中心能够更高效地利用硬件资源，提高资源利用率，实现灵活的资源分配和管理，降低能耗和成本，同时提高系统可用性和灾难恢复能力。"],
			analysis: "虚拟化是现代数据中心的核心技术，促进了云计算的发展，解决了资源利用率低下和管理复杂等问题。",
			tags: ["虚拟化", "数据中心"]
		},
		{
			content: "在大数据处理中，Hadoop的核心组件包括哪些？",
			type: 2,
			typeText: '多选题',
			score: 6,
			level: 2,
			levelText: '中等',
			options: ["HDFS", "MapReduce", "YARN", "HBase", "Spark"],
			answers: ["HDFS", "MapReduce", "YARN"],
			analysis: "Hadoop的三个核心组件是HDFS（分布式文件系统）、MapReduce（分布式计算框架）和YARN（资源管理系统）。",
			tags: ["大数据", "Hadoop"]
		}
	];
	
	// 随机选择并添加题目
	for (let i = 0; i < count; i++) {
		const template = templates[Math.floor(Math.random() * templates.length)];
		const question = {
			...template,
			id: Date.now() + i,
			createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
		};
		questions.push(question);
	}
	
	// 保存回本地存储
	localStorage.setItem('fakeQuestions', JSON.stringify(questions));
};

// 添加工程实训和虚拟实训的示例题目
const addExampleQuestions = () => {
	const engineeringQuestions = [
		{
			id: Date.now() + 1,
			content: "在金工实习中，车床上加工圆柱面时应选用什么刀具？",
			type: 1,
			typeText: '单选题',
			score: 5,
			level: 2,
			levelText: '中等',
			options: ["车刀", "铣刀", "钻头", "砂轮"],
			answers: ["车刀"],
			analysis: "车床加工圆柱面时应选用车刀，它是车床上最常用的刀具类型，适合加工各种旋转表面。",
			tags: ["金工实习", "车床加工"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 2,
			content: "以下哪些安全措施在金工实习中是必须遵守的？",
			type: 2,
			typeText: '多选题',
			score: 8,
			level: 2,
			levelText: '中等',
			options: ["佩戴防护眼镜", "穿着工作服", "戴安全帽", "操作机床前检查设备状态", "拆卸机床安全装置以提高工作效率"],
			answers: ["佩戴防护眼镜", "穿着工作服", "戴安全帽", "操作机床前检查设备状态"],
			analysis: "金工实习中必须严格遵守安全规定，包括正确使用个人防护装备和操作前的设备检查，不得拆卸安全装置。",
			tags: ["金工实习", "安全措施"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 3,
			content: "钳工工艺中，锯割金属时锯条的安装方向是使锯齿朝向把手方向。",
			type: 3,
			typeText: '判断题',
			score: 3,
			level: 1,
			levelText: '简单',
			options: ["正确", "错误"],
			answers: ["错误"],
			analysis: "锯割金属时锯条的安装方向应使锯齿朝向前方（远离把手），这样在向前推动锯框时才能切割金属。",
			tags: ["金工实习", "钳工工艺"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 4,
			content: "请简述车床中三爪卡盘和四爪卡盘的区别及适用范围。",
			type: 4,
			typeText: '简答题',
			score: 10,
			level: 3,
			levelText: '困难',
			answers: ["三爪卡盘是自定心的，三个爪同时移动，适合夹持圆形和六角形工件，定心精度高，操作方便，但不适合不规则工件；四爪卡盘是独立调整的，每个爪可单独移动，适合夹持不规则形状和偏心工件，调整灵活但操作较复杂，需要手动对中。"],
			analysis: "三爪卡盘和四爪卡盘是车床上常用的两种夹具，它们在结构、操作方式和适用工件类型上有明显区别。",
			tags: ["金工实习", "车床工艺", "夹具"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 5,
			content: "在铣削加工中，以下哪种铣削方式切削力波动较小，工件表面质量较好？",
			type: 1,
			typeText: '单选题',
			score: 5,
			level: 2,
			levelText: '中等',
			options: ["顺铣", "逆铣", "平铣", "端铣"],
			answers: ["顺铣"],
			analysis: "顺铣时切削刃与工件运动方向相同，切厚由大变小，切削力波动较小，获得的表面质量较好。",
			tags: ["金工实习", "铣削加工"],
			createTime: "2024-04-16 20:35"
		}
	];

	const virtualTrainingQuestions = [
		{
			id: Date.now() + 6,
			content: "在焊接作业中，电弧焊的电弧温度一般在多少范围？",
			type: 1,
			typeText: '单选题',
			score: 5,
			level: 2,
			levelText: '中等',
			options: ["1000~2000℃", "2000~3000℃", "3000~6000℃", "6000~10000℃"],
			answers: ["3000~6000℃"],
			analysis: "电弧焊的电弧温度一般在3000~6000℃范围内，这个温度足以熔化大多数金属材料。",
			tags: ["金工实习", "焊接技术"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 7,
			content: "以下哪些是数控机床相比传统机床的优势？",
			type: 2,
			typeText: '多选题',
			score: 8,
			level: 2,
			levelText: '中等',
			options: ["加工精度高", "生产效率高", "适应性强", "操作简单", "成本低"],
			answers: ["加工精度高", "生产效率高", "适应性强"],
			analysis: "数控机床相比传统机床具有加工精度高、生产效率高、适应性强等优势，但操作需要专业知识，且设备成本较高。",
			tags: ["金工实习", "数控加工"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 8,
			content: "在金工实习中，使用砂轮机磨削工具时，可以不用佩戴防护眼镜提高操作便利性。",
			type: 3,
			typeText: '判断题',
			score: 3,
			level: 1,
			levelText: '简单',
			options: ["正确", "错误"],
			answers: ["错误"],
			analysis: "使用砂轮机时必须佩戴防护眼镜，因为磨削过程中会产生高速飞溅的金属颗粒和砂轮碎屑，可能伤害眼睛。安全永远高于便利性。",
			tags: ["金工实习", "安全操作"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 9,
			content: "请详细描述车床上车削圆锥的三种方法及其适用范围。",
			type: 4,
			typeText: '简答题',
			score: 10,
			level: 3,
			levelText: '困难',
			answers: ["车削圆锥的三种方法：1. 横向进给法：通过手动调整刀具横向进给，适用于短小圆锥和锥度较大的工件，精度较低；2. 尾座偏移法：通过偏移尾座中心线使工件产生倾斜，适用于长锥度小且精度要求不高的工件；3. 复合进给法：同时使用纵向和横向进给，按预设的路径车削，适用于高精度要求和任意锥度的圆锥，是数控车床常用方法。"],
			analysis: "车削圆锥是车床常见的加工任务，不同方法适用于不同的加工需求和设备条件。",
			tags: ["金工实习", "车床工艺", "圆锥加工"],
			createTime: "2024-04-16 20:35"
		},
		{
			id: Date.now() + 10,
			content: "在测量工件尺寸时，以下哪些测量工具适合用于精密尺寸测量？",
			type: 2,
			typeText: '多选题',
			score: 6,
			level: 2,
			levelText: '中等',
			options: ["钢直尺", "游标卡尺", "千分尺", "百分表", "钢卷尺"],
			answers: ["游标卡尺", "千分尺", "百分表"],
			analysis: "游标卡尺、千分尺和百分表都是精密测量工具，精度可达0.02mm、0.01mm甚至更高，适合精密尺寸测量；而钢直尺和钢卷尺属于粗略测量工具。",
			tags: ["金工实习", "测量工具"],
			createTime: "2024-04-16 20:35"
		}
	];

	// 获取现有题目
	const existingQuestions = JSON.parse(localStorage.getItem('fakeQuestions') || '[]');
	
	// 合并题目
	const allQuestions = [...existingQuestions, ...engineeringQuestions, ...virtualTrainingQuestions];
	
	// 保存回本地存储
	localStorage.setItem('fakeQuestions', JSON.stringify(allQuestions));
	
	// 刷新表格
	loadTableData();
	
	ElMessage.success('已添加10道工程实训和虚拟实训的示例题目');
};

// 初始化：页面加载时加载表格数据，如果没有数据则添加示例题目
onMounted(() => {
	// 清空现有题目数据，强制重新加载工程实训题目
	localStorage.removeItem('fakeQuestions');
	addExampleQuestions();
	loadTableData();
});

// 监听cl-add-btn点击事件
const Crud = ref(null);
setTimeout(() => {
  document.querySelector('.cl-add-btn')?.addEventListener('click', openAddDialog);
}, 500);
</script>

<style lang="scss" scoped>
.fake-container {
	padding: 20px;
}

.mb20 {
	margin-bottom: 20px;
}

.ml10 {
	margin-left: 10px;
}

.dialog-footer {
	padding: 20px 0 0;
	text-align: right;
}

.option-item {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	
	.el-input {
		margin-right: 10px;
	}
}

.detail-item {
	margin-bottom: 16px;
}

.detail-item .label {
	font-weight: bold;
	margin-bottom: 5px;
}

.detail-item .content {
	line-height: 1.5;
}

.detail-item ul {
	margin: 0;
	padding-left: 20px;
}

:deep(.cl-filter) {
	.el-select {
		width: 100%;
	}
}

:deep(.el-form-item) {
	margin-bottom: 18px;
}

:deep(.el-form-item__label) {
	font-weight: 500;
}

:deep(.el-upload) {
	width: 100%;
	
	.el-upload-dragger {
		width: 100%;
	}
}

:deep(.el-dialog__body) {
	padding: 20px;
}
</style>
