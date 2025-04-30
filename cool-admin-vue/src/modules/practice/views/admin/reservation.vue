<template>
	<div class="practice-reservation page-container">
		<cl-crud ref="Crud">
			<cl-row>
				<!-- 刷新按钮 -->
				<cl-refresh-btn />
				
				<!-- 批量删除 -->
				<cl-multi-delete-btn />
				
				<cl-flex1 />
				
				<!-- 过滤选择 -->
				<div class="filter-box">
					<el-select v-model="filter.status" placeholder="预约状态" clearable @change="onFilterChange">
						<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
					
					<el-select v-model="filter.activityId" placeholder="实践活动" clearable @change="onFilterChange">
						<el-option v-for="item in activityOptions" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</div>
				
				<!-- 搜索 -->
				<cl-search-key placeholder="请输入学生姓名/学号" />
			</cl-row>
			
			<cl-row>
				<!-- 数据表格 -->
				<cl-table ref="Table" />
			</cl-row>
			
			<cl-row>
				<cl-flex1 />
				<cl-pagination />
			</cl-row>
			
			<!-- 操作表单 -->
			<cl-upsert ref="Upsert" />
		</cl-crud>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { ElMessage } from 'element-plus';

const { service } = useCool();

// 状态选项
const statusOptions = [
	{ label: '待审核', value: 0 },
	{ label: '已通过', value: 1 },
	{ label: '已拒绝', value: 2 },
	{ label: '已取消', value: 3 },
	{ label: '已完成', value: 4 }
];

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
		status: 0
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

// 活动选项
const activityOptions = activities.map(item => ({
	id: item.id,
	name: item.name
}));

// 模拟学生数据
const students = [
	{ id: 1, name: '张三', studentId: '2023001001', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
	{ id: 2, name: '李四', studentId: '2023001002', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
	{ id: 3, name: '王五', studentId: '2023001003', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
	{ id: 4, name: '赵六', studentId: '2023001004', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
	{ id: 5, name: '钱七', studentId: '2023001005', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' }
];

// 模拟预约数据
const reservations = [
	{
		id: 1,
		activityId: 1,
		studentId: 1,
		reservationTime: '2025-04-12 14:30:00',
		status: 1,
		comment: '希望能学习到更多工程基础知识',
		feedback: '审核通过，请按时参加'
	},
	{
		id: 2,
		activityId: 1,
		studentId: 2,
		reservationTime: '2025-04-12 15:20:00',
		status: 1,
		comment: '想提升工程实践能力',
		feedback: '审核通过，请按时参加'
	},
	{
		id: 3,
		activityId: 1,
		studentId: 3,
		reservationTime: '2025-04-13 09:15:00',
		status: 0,
		comment: '对工程训练很感兴趣',
		feedback: ''
	},
	{
		id: 4,
		activityId: 2,
		studentId: 4,
		reservationTime: '2025-04-14 10:30:00',
		status: 2,
		comment: '希望参加精工细铸实践',
		feedback: '名额已满，请选择其他活动'
	},
	{
		id: 5,
		activityId: 2,
		studentId: 5,
		reservationTime: '2025-04-15 16:45:00',
		status: 1,
		comment: '对精密铸造技术很感兴趣',
		feedback: '审核通过，请按时参加'
	},
	{
		id: 6,
		activityId: 4,
		studentId: 1,
		reservationTime: '2025-04-16 11:20:00',
		status: 3,
		comment: '想体验VR技术在工程中的应用',
		feedback: '',
		cancelReason: '时间冲突，无法参加'
	},
	{
		id: 7,
		activityId: 4,
		studentId: 3,
		reservationTime: '2025-04-17 14:05:00',
		status: 4,
		comment: '希望了解VR技术',
		feedback: '已完成活动，表现良好'
	}
];

// 过滤条件
const filter = reactive({
	status: '',
	activityId: ''
});

// 处理过滤变化
const onFilterChange = () => {
	Crud.value?.refresh({
		...filter
	});
};

// 模拟CRUD服务
const mockService = {
	page: (params) => {
		console.log('查询参数', params);
		
		// 处理数据，合并学生和活动信息
		let list = reservations.map(item => {
			const student = students.find(s => s.id === item.studentId) || {};
			const activity = activities.find(a => a.id === item.activityId) || {};
			
			return {
				...item,
				studentName: student.name,
				studentNumber: student.studentId,
				studentAvatar: student.avatar,
				activityName: activity.name,
				activityTime: activity.startTime ? `${activity.startTime.split(' ')[0].replace(/-/g, '/')} ${activity.startTime.split(' ')[1].slice(0, 5)}-${activity.endTime.split(' ')[1].slice(0, 5)}` : '',
				activityLocation: activity.location
			};
		});
		
		// 过滤
		if (params.status !== undefined && params.status !== '') {
			list = list.filter(item => item.status == params.status);
		}
		
		if (params.activityId !== undefined && params.activityId !== '') {
			list = list.filter(item => item.activityId == params.activityId);
		}
		
		// 搜索
		if (params.keyWord) {
			list = list.filter(item => 
				item.studentName?.includes(params.keyWord) || 
				item.studentNumber?.includes(params.keyWord)
			);
		}
		
		// 排序
		if (params.order) {
			const [prop, order] = params.order.split(' ');
			list.sort((a, b) => {
				return order === 'desc' 
					? b[prop] > a[prop] ? 1 : -1
					: a[prop] > b[prop] ? 1 : -1;
			});
		} else {
			// 默认按预约时间倒序
			list.sort((a, b) => new Date(b.reservationTime).getTime() - new Date(a.reservationTime).getTime());
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
	
	update: (params) => {
		console.log('更新', params);
		// 模拟更新
		const index = reservations.findIndex(item => item.id === params.id);
		if (index !== -1) {
			reservations[index] = { ...reservations[index], ...params };
			
			// 如果是审批通过，更新活动剩余名额
			if (params.status === 1 && reservations[index].status !== 1) {
				const activityIndex = activities.findIndex(a => a.id === reservations[index].activityId);
				if (activityIndex !== -1 && activities[activityIndex].remainingQuota > 0) {
					activities[activityIndex].remainingQuota--;
				}
			}
			
			// 如果是取消预约，恢复活动剩余名额
			if (params.status === 3 && reservations[index].status === 1) {
				const activityIndex = activities.findIndex(a => a.id === reservations[index].activityId);
				if (activityIndex !== -1) {
					activities[activityIndex].remainingQuota++;
				}
			}
		}
		return Promise.resolve();
	},
	
	delete: (params) => {
		console.log('删除', params);
		// 模拟删除
		const { ids } = params;
		ids.forEach(id => {
			const index = reservations.findIndex(item => item.id === id);
			if (index !== -1) {
				// 如果是已审核通过的预约，要恢复活动名额
				if (reservations[index].status === 1) {
					const activityIndex = activities.findIndex(a => a.id === reservations[index].activityId);
					if (activityIndex !== -1) {
						activities[activityIndex].remainingQuota++;
					}
				}
				reservations.splice(index, 1);
			}
		});
		return Promise.resolve();
	},
	
	info: (params) => {
		console.log('查询详情', params);
		// 模拟查询
		const { id } = params;
		const item = reservations.find(item => item.id === id);
		
		if (item) {
			const student = students.find(s => s.id === item.studentId) || {};
			const activity = activities.find(a => a.id === item.activityId) || {};
			
			return Promise.resolve({
				...item,
				studentName: student.name,
				studentNumber: student.studentId,
				activityName: activity.name
			});
		}
		
		return Promise.resolve({});
	}
};

// crud
const Crud = useCrud({
	service: mockService
}, app => {
	app.refresh();
});

// 表格
const Table = useTable({
	columns: [
		{ type: 'selection' },
		{
			label: '学生信息',
			prop: 'studentName',
			minWidth: 150,
			formatter: ({ studentName, studentNumber, studentAvatar }) => {
				return `
					<div style="display: flex; align-items: center;">
						<el-avatar size="small" src="${studentAvatar}" style="margin-right: 8px;"></el-avatar>
						<div>
							<div>${studentName}</div>
							<div style="font-size: 12px; color: #999;">${studentNumber}</div>
						</div>
					</div>
				`;
			}
		},
		{
			label: '实践活动',
			prop: 'activityName',
			minWidth: 150
		},
		{
			label: '活动时间/地点',
			prop: 'activityTime',
			minWidth: 200,
			formatter: ({ activityTime, activityLocation }) => {
				return `<div>${activityTime}</div><div style="font-size: 12px; color: #666;">${activityLocation}</div>`;
			}
		},
		{
			label: '预约时间',
			prop: 'reservationTime',
			minWidth: 150
		},
		{
			label: '学生留言',
			prop: 'comment',
			minWidth: 200,
			showOverflowTooltip: true
		},
		{
			label: '状态',
			prop: 'status',
			width: 100,
			dict: [
				{ label: '待审核', value: 0, type: 'info' },
				{ label: '已通过', value: 1, type: 'success' },
				{ label: '已拒绝', value: 2, type: 'danger' },
				{ label: '已取消', value: 3, type: 'warning' },
				{ label: '已完成', value: 4, type: 'primary' }
			]
		},
		{
			type: 'op',
			buttons: [
				{
					label: '审核',
					type: 'primary',
					visible: ({ status }) => status === 0,
					click: (_, { row }) => {
						Upsert.value?.open({
							title: '预约审核',
							props: { id: row.id },
							isEdit: true,
							items: [
								{
									label: '学生姓名',
									prop: 'studentName',
									component: { name: 'el-input', props: { disabled: true } }
								},
								{
									label: '实践活动',
									prop: 'activityName',
									component: { name: 'el-input', props: { disabled: true } }
								},
								{
									label: '学生留言',
									prop: 'comment',
									component: { name: 'el-input', props: { disabled: true, type: 'textarea', rows: 2 } }
								},
								{
									label: '审核结果',
									prop: 'status',
									value: 1,
									component: {
										name: 'el-radio-group',
										options: [
											{ label: '通过', value: 1 },
											{ label: '拒绝', value: 2 }
										]
									}
								},
								{
									label: '审核意见',
									prop: 'feedback',
									component: {
										name: 'el-input',
										props: {
											type: 'textarea',
											rows: 3,
											placeholder: '请输入审核意见'
										}
									},
									rules: {
										required: true,
										message: '请输入审核意见'
									}
								}
							]
						});
					}
				},
				{
					label: '完成',
					type: 'success',
					visible: ({ status }) => status === 1,
					click: (_, { row }) => {
						mockService.update({ id: row.id, status: 4, feedback: '活动已完成' }).then(() => {
							ElMessage.success('操作成功');
							Crud.value?.refresh();
						});
					}
				},
				{
					label: '查看',
					type: 'info',
					visible: ({ status }) => status !== 0,
					click: (_, { row }) => {
						Upsert.value?.open({
							title: '预约详情',
							props: { id: row.id },
							isEdit: false,
							items: [
								{
									label: '学生姓名',
									prop: 'studentName',
									component: { name: 'el-input', props: { disabled: true } }
								},
								{
									label: '实践活动',
									prop: 'activityName',
									component: { name: 'el-input', props: { disabled: true } }
								},
								{
									label: '学生留言',
									prop: 'comment',
									component: { name: 'el-input', props: { disabled: true, type: 'textarea', rows: 2 } }
								},
								{
									label: '状态',
									prop: 'status',
									component: {
										name: 'el-select',
										props: { disabled: true },
										options: statusOptions
									}
								},
								{
									label: '审核意见',
									prop: 'feedback',
									component: {
										name: 'el-input',
										props: {
											type: 'textarea',
											rows: 3,
											disabled: true
										}
									}
								},
								{
									label: '取消原因',
									prop: 'cancelReason',
									component: {
										name: 'el-input',
										props: {
											type: 'textarea',
											rows: 2,
											disabled: true
										}
									},
									visible: ({ status }) => status === 3
								}
							]
						});
					}
				},
				{
					label: '删除',
					type: 'danger',
					click: (_, { row }) => {
						mockService.delete({ ids: [row.id] }).then(() => {
							ElMessage.success('删除成功');
							Crud.value?.refresh();
						});
					}
				}
			]
		}
	]
});

// 表单
const Upsert = useUpsert();
</script>

<style lang="scss" scoped>
.practice-reservation {
	padding: 20px;
	
	.filter-box {
		display: flex;
		gap: 10px;
		margin-right: 10px;
	}
}
</style> 