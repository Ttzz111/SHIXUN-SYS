<template>
	<div class="practice-activity">
		<cl-crud @load="onLoad" :service="mockService">
			<!-- 顶部区域：标题、描述和操作按钮 -->
			<div class="header">
				<div class="title">工程实践实训活动管理</div>
				<div class="desc">管理工程实践实训中心的活动、课程及实训项目</div>
			</div>

			<!-- 操作/搜索栏 -->
			<cl-row class="toolbox">
				<cl-refresh-btn />
				<cl-add-btn text="新增实训活动" />
				<cl-multi-delete-btn />
				
				<cl-flex1 />
				
				<!-- 筛选 -->
				<el-select 
					v-model="filterCategory" 
					placeholder="实训类型" 
					clearable 
					@change="onFilterChange"
					class="filter-item"
				>
					<el-option 
						v-for="item in categoryOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
				
				<el-select 
					v-model="filterStatus" 
					placeholder="活动状态" 
					clearable 
					@change="onFilterChange"
					class="filter-item"
				>
					<el-option 
						v-for="item in statusOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
				
				<cl-search-key placeholder="请输入实训活动名称" />
			</cl-row>

			<!-- 数据概览卡片 -->
			<div class="data-stats">
				<div class="stat-card">
					<div class="stat-value">{{ stats.totalActivities }}</div>
					<div class="stat-label">活动总数</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{{ stats.availableActivities }}</div>
					<div class="stat-label">可报名活动</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{{ stats.totalQuota }}</div>
					<div class="stat-label">培训总名额</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{{ stats.remainingQuota }}</div>
					<div class="stat-label">剩余名额</div>
				</div>
			</div>
			
			<!-- 使用cl-table -->
			<cl-row>
				<cl-table ref="Table" />
			</cl-row>
			
			<!-- 分页 -->
			<cl-row>
				<cl-flex1 />
				<cl-pagination />
			</cl-row>
			
			<!-- 表单 -->
			<cl-upsert ref="Upsert" />
		</cl-crud>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { ElMessage, ElMessageBox } from 'element-plus';

const { service } = useCool();

// 筛选条件
const filterCategory = ref('');
const filterStatus = ref(null);
const loading = ref(false);

// 表格数据
// 移除 tableData
// 移除 selection
// 移除 handleSelectionChange

// 格式化时间函数
const formatTime = (startTime, endTime) => {
	const start = new Date(startTime);
	const end = new Date(endTime);
	const isSameDay = start.toDateString() === end.toDateString();
	
	if (isSameDay) {
		return `${startTime.split(' ')[0].replace(/-/g, '/')} ${startTime.split(' ')[1].slice(0, 5)}-${endTime.split(' ')[1].slice(0, 5)}`;
	} else {
		return `${startTime.replace(/-/g, '/').slice(0, 16)} 至 ${endTime.replace(/-/g, '/').slice(0, 16)}`;
	}
};

// 获取剩余名额的标签类型
const getRemainingQuotaType = (remaining, total) => {
	const percent = (remaining / total) * 100;
	if (percent <= 20) {
		return 'danger';
	} else if (percent <= 50) {
		return 'warning';
	} else {
		return 'success';
	}
};

// 模拟分类数据
const categoryOptions = [
	{ label: '基础工程实践', value: '基础工程实践' },
	{ label: '创新实践', value: '创新实践' },
	{ label: '计算机辅助设计', value: '计算机辅助设计' },
	{ label: '虚拟仿真实训', value: '虚拟仿真实训' },
	{ label: '电子电气技术', value: '电子电气技术' },
	{ label: '智能控制技术', value: '智能控制技术' }
];

// 模拟子分类数据
const subcategoryMap = {
	'基础工程实践': [
		{ label: '机械加工基础', value: '机械加工基础' },
		{ label: '工程材料实践', value: '工程材料实践' },
		{ label: '测量技术实训', value: '测量技术实训' }
	],
	'创新实践': [
		{ label: '精密制造', value: '精密制造' },
		{ label: '先进制造', value: '先进制造' },
		{ label: '增材制造', value: '增材制造' },
		{ label: '创新设计实践', value: '创新设计实践' }
	],
	'计算机辅助设计': [
		{ label: 'CAD/CAM', value: 'CAD/CAM' },
		{ label: '工程仿真', value: '工程仿真' },
		{ label: '数字化设计', value: '数字化设计' }
	],
	'虚拟仿真实训': [
		{ label: 'VR/AR应用', value: 'VR/AR应用' },
		{ label: '虚拟装配实训', value: '虚拟装配实训' },
		{ label: '数字孪生技术', value: '数字孪生技术' }
	],
	'电子电气技术': [
		{ label: '电路设计实训', value: '电路设计实训' },
		{ label: 'PCB设计与制作', value: 'PCB设计与制作' },
		{ label: '电气控制系统', value: '电气控制系统' }
	],
	'智能控制技术': [
		{ label: '单片机技术', value: '单片机技术' },
		{ label: 'PLC编程与控制', value: 'PLC编程与控制' },
		{ label: '机器人控制技术', value: '机器人控制技术' }
	]
};

// 状态选项
const statusOptions = [
	{ label: '已关闭', value: 0 },
	{ label: '开放中', value: 1 }
];

// 获取子分类选项
const getSubcategoryOptions = (category) => {
	if (!category) return [];
	return subcategoryMap[category] || [];
};

// 模拟教师数据
const teacherOptions = [
	{ label: '张工 (机械加工)', value: 1001 },
	{ label: '李明 (精密制造)', value: 1002 },
	{ label: '王红 (激光技术)', value: 1003 },
	{ label: '赵坤 (VR/AR技术)', value: 1004 },
	{ label: '陈静 (CAD/CAM)', value: 1005 },
	{ label: '刘伟 (3D打印)', value: 1006 },
	{ label: '郑亮 (电气控制)', value: 1007 },
	{ label: '吴芳 (智能控制)', value: 1008 }
];

// 模拟数据 - 工程实践实训活动
const practiceActivities = [
	{
		id: 1,
		name: '工程训练IA实训活动',
		category: '基础工程实践',
		subcategory: '机械加工基础',
		location: '工程实训中心A101',
		startTime: '2025-05-10 08:00:00',
		endTime: '2025-05-10 12:00:00',
		quota: 30,
		remainingQuota: 15,
		description: '工程训练IA实训项目，学习基础工程知识、机械加工基础技能，熟悉常用工具设备的使用方法。',
		status: 1,
		teacherId: 1001,
		teacherName: '张工',
		createTime: '2025-04-10 10:00:00'
	},
	{
		id: 2,
		name: '精密铸造创新实训',
		category: '创新实践',
		subcategory: '精密制造',
		location: '工程实训中心B203',
		startTime: '2025-05-15 14:00:00',
		endTime: '2025-05-15 18:00:00',
		quota: 20,
		remainingQuota: 5,
		description: '精密铸造技术实践，学习先进铸造技术原理与应用，体验精密铸造全过程，培养创新思维。',
		status: 1,
		teacherId: 1002,
		teacherName: '李明',
		createTime: '2025-04-12 15:30:00'
	},
	{
		id: 3,
		name: '激光加工技术实训',
		category: '创新实践',
		subcategory: '先进制造',
		location: '工程实训中心C105',
		startTime: '2025-05-20 09:00:00',
		endTime: '2025-05-20 17:00:00',
		quota: 15,
		remainingQuota: 0,
		description: '激光加工技术实训，掌握激光加工原理与工艺参数调控，学习激光设备操作与维护，完成激光切割、打标等实训任务。',
		status: 0,
		teacherId: 1003,
		teacherName: '王红',
		createTime: '2025-04-15 09:20:00'
	},
	{
		id: 4,
		name: 'VR/AR工程应用实训',
		category: '虚拟仿真实训',
		subcategory: 'VR/AR应用',
		location: 'VR实训室D302',
		startTime: '2025-06-01 13:00:00',
		endTime: '2025-06-01 16:00:00',
		quota: 25,
		remainingQuota: 12,
		description: '虚拟现实与增强现实技术在工程领域的应用实训，体验VR/AR设备，学习基础开发与应用案例分析。',
		status: 1,
		teacherId: 1004,
		teacherName: '赵坤',
		createTime: '2025-04-20 14:10:00'
	},
	{
		id: 5,
		name: '工程CAD/CAM实训',
		category: '计算机辅助设计',
		subcategory: 'CAD/CAM',
		location: '计算机辅助设计中心E201',
		startTime: '2025-05-25 09:00:00',
		endTime: '2025-05-25 17:00:00',
		quota: 35,
		remainingQuota: 20,
		description: '工程CAD/CAM实训课程，学习计算机辅助设计与制造技术，掌握CAD建模、CAM编程及数控加工技术。',
		status: 1,
		teacherId: 1005,
		teacherName: '陈静',
		createTime: '2025-04-18 11:35:00'
	},
	{
		id: 6,
		name: '3D打印创新实训',
		category: '创新实践',
		subcategory: '增材制造',
		location: '3D打印实验室F102',
		startTime: '2025-06-05 13:30:00',
		endTime: '2025-06-06 17:30:00',
		quota: 18,
		remainingQuota: 8,
		description: '3D打印技术实训课程，学习增材制造原理，掌握3D打印设备操作与参数调控，完成创新设计与制造项目。',
		status: 1,
		teacherId: 1006,
		teacherName: '刘伟',
		createTime: '2025-04-25 16:40:00'
	}
];

// 统计数据
const stats = computed(() => {
	let filteredData = [...practiceActivities];
	
	// 应用筛选
	if (filterCategory.value) {
		filteredData = filteredData.filter(item => item.category === filterCategory.value);
	}
	
	if (filterStatus.value !== null) {
		filteredData = filteredData.filter(item => item.status === filterStatus.value);
	}
	
	return {
		totalActivities: filteredData.length,
		availableActivities: filteredData.filter(item => item.status === 1 && item.remainingQuota > 0).length,
		totalQuota: filteredData.reduce((sum, item) => sum + item.quota, 0),
		remainingQuota: filteredData.reduce((sum, item) => sum + item.remainingQuota, 0)
	};
});

// 模拟CRUD服务
const mockService = {
	page: (params) => {
		console.log('查询参数', params);
		
		// 处理搜索
		let list = [...practiceActivities];
		
		// 应用筛选条件
		if (filterCategory.value) {
			list = list.filter(item => item.category === filterCategory.value);
		}
		
		if (filterStatus.value !== null) {
			list = list.filter(item => item.status === filterStatus.value);
		}
		
		// 关键字搜索
		if (params.keyWord) {
			list = list.filter(item => item.name.includes(params.keyWord));
		}
		
		// 排序
		if (params.order) {
			const [prop, order] = params.order.split(' ');
			list.sort((a, b) => {
				return order === 'desc' 
					? b[prop] > a[prop] ? 1 : -1
					: a[prop] > b[prop] ? 1 : -1;
			});
		}
		
		// 分页
		const page = params.page || 1;
		const size = params.size || 20;
		const total = list.length;
		
		list = list.slice((page - 1) * size, page * size);
		
		return Promise.resolve({
			list,
			pagination: {
				total,
				page,
				size
			}
		});
	},
	
	add: (params) => {
		console.log('添加', params);
		
		return new Promise((resolve) => {
			// 模拟添加
			const id = Math.max(...practiceActivities.map(item => item.id)) + 1;
			const teacherInfo = teacherOptions.find(t => t.value === params.teacherId);
			const newActivity = {
				...params,
				id,
				createTime: new Date().toLocaleString(),
				remainingQuota: params.quota,
				teacherName: teacherInfo ? teacherInfo.label.split(' ')[0] : '未知'
			};
			practiceActivities.push(newActivity);
			ElMessage.success('创建实训活动成功！');
			resolve();
		});
	},
	
	update: (params) => {
		console.log('更新', params);
		
		return new Promise((resolve) => {
			// 模拟更新
			const index = practiceActivities.findIndex(item => item.id === params.id);
			if (index !== -1) {
				// 注意保留一些不更新的字段
				const remainingQuota = params.quota - (practiceActivities[index].quota - practiceActivities[index].remainingQuota);
				const teacherInfo = teacherOptions.find(t => t.value === params.teacherId);
				
				practiceActivities[index] = { 
					...practiceActivities[index], 
					...params,
					remainingQuota: Math.max(0, remainingQuota),
					teacherName: teacherInfo ? teacherInfo.label.split(' ')[0] : practiceActivities[index].teacherName
				};
				ElMessage.success('更新实训活动成功！');
			}
			resolve();
		});
	},
	
	delete: (params) => {
		console.log('删除', params);
		
		return new Promise((resolve) => {
			// 模拟删除
			const { ids } = params;
			ids.forEach(id => {
				const index = practiceActivities.findIndex(item => item.id === id);
				if (index !== -1) {
					practiceActivities.splice(index, 1);
				}
			});
			ElMessage.success('删除实训活动成功！');
			resolve();
		});
	},
	
	info: (params) => {
		console.log('查询详情', params);
		
		return new Promise((resolve) => {
			// 模拟查询
			const { id } = params;
			const item = practiceActivities.find(item => item.id === id);
			resolve(item || {});
		});
	}
};

// 声明CRUD、Table和Upsert引用
const Crud = ref(null);
const Table = ref(null);
const Upsert = ref(null);

// CRUD组件加载完成的回调
const onLoad = ({ ctx, app }) => {
	console.log('CRUD组件加载完成', ctx, app);
	Crud.value = app;
	
	// 初始加载数据
	app.refresh();
};

// 筛选改变事件
const onFilterChange = () => {
	// 刷新表格数据，应用筛选条件
	if (Crud.value) {
		Crud.value.refresh();
	}
};

// 初始化表格配置
const { compute, setPagination, setData } = useTable({
	props: {
		height: "100%"
	},
	columns: [
		{ type: 'selection' },
		{
			label: '活动名称',
			prop: 'name',
			minWidth: 160,
			showOverflowTooltip: true,
			fixed: true
		},
		{
			label: '实训类型',
			prop: 'category',
			width: 120
		},
		{
			label: '实训方向',
			prop: 'subcategory',
			width: 120
		},
		{
			label: '实训地点',
			prop: 'location',
			minWidth: 120,
			showOverflowTooltip: true
		},
		{
			label: '指导教师',
			prop: 'teacherName',
			width: 100
		},
		{
			label: '实训时间',
			prop: 'startTime',
			minWidth: 180,
			formatter: ({ startTime, endTime }) => {
				return formatTime(startTime, endTime);
			}
		},
		{
			label: '名额',
			prop: 'quota',
			width: 80,
			align: 'center'
		},
		{
			label: '剩余名额',
			prop: 'remainingQuota',
			width: 80,
			align: 'center',
			formatter: ({ remainingQuota, quota }) => {
				const type = getRemainingQuotaType(remainingQuota, quota);
				return `<el-tag type="${type}" size="small" effect="light">${remainingQuota}</el-tag>`;
			}
		},
		{
			label: '状态',
			prop: 'status',
			width: 80,
			align: 'center',
			dict: [
				{ label: '已关闭', value: 0, type: 'danger' },
				{ label: '开放中', value: 1, type: 'success' }
			]
		},
		{
			label: '创建时间',
			prop: 'createTime',
			width: 160,
			sortable: true
		},
		{
			type: 'op',
			label: '操作',
			width: 160,
			align: 'center',
			fixed: 'right',
			buttons: [
				{
					label: '编辑',
					type: 'primary',
					click: (_, row) => {
						Crud.value?.edit(row);
					}
				},
				{
					label: '删除',
					type: 'danger',
					click: (_, row) => {
						ElMessageBox.confirm('确定要删除该实训活动吗？', '提示', {
							type: 'warning'
						})
							.then(() => {
								Crud.value?.del(row.id);
							})
							.catch(() => {});
					}
				}
			]
		}
	]
});

// 初始化表单配置
useUpsert({
	items: [
		{
			prop: 'name',
			label: '活动名称',
			component: {
				name: 'el-input',
				props: {
					placeholder: '请输入实训活动名称'
				}
			},
			rules: {
				required: true,
				message: '请输入实训活动名称'
			}
		},
		{
			prop: 'category',
			label: '实训类型',
			value: '',
			component: {
				name: 'el-select',
				props: {
					placeholder: '请选择实训类型',
					clearable: true,
					filterable: true
				},
				options: categoryOptions
			},
			rules: {
				required: true,
				message: '请选择实训类型'
			}
		},
		{
			prop: 'subcategory',
			label: '实训方向',
			value: '',
			component: {
				name: 'el-select',
				props: {
					placeholder: '请选择实训方向',
					clearable: true,
					filterable: true
				},
				options: ref([])
			},
			rules: {
				required: true,
				message: '请选择实训方向'
			}
		},
		{
			prop: 'teacherId',
			label: '指导教师',
			value: '',
			component: {
				name: 'el-select',
				props: {
					placeholder: '请选择指导教师',
					clearable: true
				},
				options: teacherOptions
			},
			rules: {
				required: true,
				message: '请选择指导教师'
			}
		},
		{
			prop: 'location',
			label: '实训地点',
			component: {
				name: 'el-input',
				props: {
					placeholder: '请输入实训地点'
				}
			},
			rules: {
				required: true,
				message: '请输入实训地点'
			}
		},
		{
			prop: 'timeRange',
			label: '实训时间',
			component: {
				name: 'el-date-picker',
				props: {
					type: 'datetimerange',
					startPlaceholder: '开始时间',
					endPlaceholder: '结束时间',
					valueFormat: 'YYYY-MM-DD HH:mm:ss'
				}
			},
			rules: {
				required: true,
				message: '请选择实训时间'
			}
		},
		{
			prop: 'quota',
			label: '实训名额',
			value: 20,
			component: {
				name: 'el-input-number',
				props: {
					min: 1,
					max: 100,
					placeholder: '请输入实训名额'
				}
			},
			rules: {
				required: true,
				message: '请输入实训名额'
			}
		},
		{
			prop: 'description',
			label: '活动描述',
			component: {
				name: 'el-input',
				props: {
					type: 'textarea',
					rows: 3,
					placeholder: '请输入实训活动描述'
				}
			},
			rules: {
				required: true,
				message: '请输入实训活动描述'
			}
		},
		{
			prop: 'status',
			label: '状态',
			value: 1,
			component: {
				name: 'el-radio-group',
				options: statusOptions
			}
		}
	],
	
	// 提交前处理表单数据
	onSubmit(data, { next, done, close }) {
		console.log('表单数据', data);
		
		// 处理时间范围
		if (Array.isArray(data.timeRange) && data.timeRange.length === 2) {
			data.startTime = data.timeRange[0];
			data.endTime = data.timeRange[1];
			delete data.timeRange;
		}
		
		next(data);
	},
	
	// 表单打开前处理数据
	onOpen(data, { close, submit, row, mode }) {
		console.log('打开表单', data, row, mode);
		
		// 监听分类变化，更新子分类选项
		const categoryItem = this.items.find(item => item.prop === 'category');
		const subcategoryItem = this.items.find(item => item.prop === 'subcategory');
		
		if (categoryItem && subcategoryItem) {
			// 监听分类变化
			const unwatch = this.form.$watch('category', (val) => {
				subcategoryItem.component.options = getSubcategoryOptions(val);
				// 如果当前子分类不在新的选项中，则清空
				if (val && this.form.subcategory) {
					const exists = getSubcategoryOptions(val).some(opt => opt.value === this.form.subcategory);
					if (!exists) {
						this.form.subcategory = '';
					}
				}
			}, { immediate: true });
			
			// 销毁表单时取消监听
			this.on('closed', () => {
				unwatch();
			});
		}
		
		// 处理编辑时的数据转换
		if (row.id) {
			// 时间范围
			data.timeRange = [row.startTime, row.endTime];
			
			// 子分类选项更新
			if (subcategoryItem) {
				subcategoryItem.component.options = getSubcategoryOptions(row.category);
			}
		}
	}
});

// 确保组件挂载后刷新数据
onMounted(() => {
	// 控制台输出帮助调试
	console.log('工程实践实训活动管理系统已启动', {
		活动数据: practiceActivities,
		CRUD组件: Crud.value,
		表格组件: Table.value
	});
});
</script>

<style lang="scss" scoped>
.practice-activity {
	padding: 15px;
	height: 100%;
	box-sizing: border-box;
	
	.header {
		margin-bottom: 20px;
		
		.title {
			font-size: 20px;
			font-weight: bold;
			color: #303133;
			margin-bottom: 5px;
		}
		
		.desc {
			font-size: 13px;
			color: #909399;
		}
	}
	
	.toolbox {
		margin-bottom: 15px;
		
		:deep(.filter-item) {
			margin-right: 10px;
			width: 130px;
		}
	}
	
	.data-stats {
		display: flex;
		margin-bottom: 20px;
		gap: 20px;
		
		.stat-card {
			flex: 1;
			background-color: #fff;
			border-radius: 4px;
			padding: 15px;
			text-align: center;
			box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
			
			&:nth-child(1) {
				border-top: 3px solid #409eff;
			}
			
			&:nth-child(2) {
				border-top: 3px solid #67c23a;
			}
			
			&:nth-child(3) {
				border-top: 3px solid #e6a23c;
			}
			
			&:nth-child(4) {
				border-top: 3px solid #f56c6c;
			}
			
			.stat-value {
				font-size: 22px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 5px;
			}
			
			.stat-label {
				font-size: 13px;
				color: #606266;
			}
		}
	}
	
	:deep(.cl-crud) {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	:deep(.cl-table) {
		flex: 1;
		height: 0;
	}
}
</style> 