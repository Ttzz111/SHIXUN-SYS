<template>
	<div class="view-my">
		<el-scrollbar>
			<div class="p-[20px]">
				<div class="header">
				<div class="title">{{ $t('基本信息') }}</div>
					<div class="datetime">
						<div class="date">{{ currentDate }}</div>
						<div class="time">{{ currentTime }}</div>
					</div>
				</div>

				<el-form label-width="100px" :model="form" :disabled="loading" label-position="top">
					<div class="form-container">
						<div class="form-left">
					<el-form-item :label="$t('头像')">
						<cl-upload v-model="form.headImg" />
					</el-form-item>

							<el-form-item :label="$t('姓名')">
								<el-input
									v-model="form.realName"
									:placeholder="$t('请填写姓名')"
									clearable
								/>
							</el-form-item>

							<el-form-item :label="$t('学号/工号')">
								<el-input
									v-model="form.studentId"
									:placeholder="$t('请填写学号或工号')"
									clearable
								/>
							</el-form-item>

							<el-form-item :label="$t('性别')">
								<el-radio-group v-model="form.gender">
									<el-radio :label="1">{{ $t('男') }}</el-radio>
									<el-radio :label="2">{{ $t('女') }}</el-radio>
								</el-radio-group>
							</el-form-item>

							<el-form-item :label="$t('学院')">
								<el-input
									v-model="form.college"
									:placeholder="$t('请填写学院')"
									clearable
								/>
							</el-form-item>
						</div>

						<div class="form-right">
							<el-form-item :label="$t('专业')">
								<el-input
									v-model="form.major"
									:placeholder="$t('请填写专业')"
									clearable
								/>
							</el-form-item>

					<el-form-item :label="$t('昵称')">
						<el-input
							v-model="form.nickName"
							:placeholder="$t('请填写昵称')"
							clearable
						/>
					</el-form-item>

					<el-form-item :label="$t('手机号')">
						<el-input
							v-model="form.phone"
							:placeholder="$t('请填写手机号')"
							clearable
						/>
					</el-form-item>

					<el-form-item :label="$t('邮箱')">
						<el-input
							v-model="form.email"
							:placeholder="$t('请填写邮箱')"
							clearable
						/>
					</el-form-item>

					<el-form-item :label="$t('原密码')">
						<el-input
							v-model="form.oldPassword"
							type="password"
							:placeholder="$t('请填写原密码')"
							clearable
						/>
					</el-form-item>

					<el-form-item :label="$t('新密码')">
						<el-input
							v-model="form.password"
							type="password"
							:placeholder="$t('请填写新密码')"
							clearable
						/>
					</el-form-item>
						</div>
					</div>

					<el-form-item class="submit-btn">
						<el-button type="primary" :disabled="loading" @click="save">{{
							$t('保存修改')
						}}</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-scrollbar>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'my-info'
});

import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref, onUnmounted } from 'vue';
import { useBase } from '/$/base';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { service } = useCool();
const { user } = useBase();

// 当前日期和时间
const currentDate = ref('');
const currentTime = ref('');
let timer: number | null = null;

// 更新日期和时间
function updateDateTime() {
	const now = new Date();
	
	// 格式化日期：YYYY年MM月DD日 星期X
	const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
	currentDate.value = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 星期${weekdays[now.getDay()]}`;
	
	// 格式化时间：HH:MM:SS
	currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

// 表单数据
const form = reactive({
	headImg: '',
	realName: '',
	studentId: '',
	gender: 1,
	college: '',
	major: '',
	nickName: '',
	phone: '',
	email: '',
	password: '',
	oldPassword: ''
});

// 保存状态
const loading = ref(false);

// 保存
async function save() {
	loading.value = true;

	await service.base.comm
		.personUpdate(form)
		.then(() => {
			form.password = '';
			form.oldPassword = '';

			ElMessage.success(t('修改成功'));
			user.get();
		})
		.catch(err => {
			ElMessage.error(err.message);
		});

	loading.value = false;
}

onMounted(() => {
	// 初始化日期时间
	updateDateTime();
	// 每秒更新一次时间
	timer = window.setInterval(updateDateTime, 1000);

	form.headImg = user.info?.headImg || '';
	form.realName = user.info?.realName || '';
	form.studentId = user.info?.studentId || '';
	form.gender = user.info?.gender || 1;
	form.college = user.info?.college || '';
	form.major = user.info?.major || '';
	form.nickName = user.info?.nickName || '';
	form.phone = user.info?.phone || '';
	form.email = user.info?.email || '';
});

onUnmounted(() => {
	// 清除定时器
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
});
</script>

<style lang="scss">
.view-my {
	background-color: var(--el-bg-color);
	height: 100%;
	box-sizing: border-box;
	border-radius: 6px;

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;

		.title {
			font-size: 15px;
			font-weight: bold;
		}

		.datetime {
			text-align: right;
			color: var(--el-text-color-secondary);

			.date {
				font-size: 14px;
				margin-bottom: 4px;
			}

			.time {
				font-size: 20px;
				font-weight: bold;
			}
		}
	}

	.el-form {
		width: 100%;
		max-width: 100%;
	}

	.form-container {
		display: flex;
		gap: 40px;
		justify-content: space-between;

		.form-left,
		.form-right {
			flex: 1;
			min-width: 0;
		}
	}

	.submit-btn {
		margin-top: 20px;
		text-align: center;
	}
}
</style>
