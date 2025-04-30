<template>
	<div class="page-register">
		<div class="box">
			<div class="logo">
				<div class="icon">
					<img src="/logo.png" alt="Logo" />
				</div>

				<span>工程实训学习与实践管理系统</span>
			</div>

			<p class="desc">{{ $t('创建您的账号，开启实训学习之旅') }}</p>

			<div class="form">
				<el-form ref="registerForm" :model="registerForm" :rules="rules" label-position="top">
					<el-form-item :label="$t('用户名')" prop="username">
						<el-input
							v-model="registerForm.username"
							:placeholder="$t('请输入学号或工号')"
							maxlength="20"
						/>
					</el-form-item>
					
					<el-form-item :label="$t('姓名')" prop="name">
						<el-input
							v-model="registerForm.name"
							:placeholder="$t('请输入真实姓名')"
							maxlength="20"
						/>
					</el-form-item>
					
					<el-form-item :label="$t('密码')" prop="password">
						<el-input
							v-model="registerForm.password"
							type="password"
							:placeholder="$t('请输入密码')"
							maxlength="20"
							show-password
							autocomplete="new-password"
						/>
					</el-form-item>
					
					<el-form-item :label="$t('确认密码')" prop="confirmPassword">
						<el-input
							v-model="registerForm.confirmPassword"
							type="password"
							:placeholder="$t('请再次输入密码')"
							maxlength="20"
							show-password
							autocomplete="new-password"
						/>
					</el-form-item>
					
					<el-form-item :label="$t('邮箱')" prop="email">
						<el-input
							v-model="registerForm.email"
							:placeholder="$t('请输入邮箱')"
							maxlength="50"
						/>
					</el-form-item>
					
					<el-form-item :label="$t('用户类型')" prop="userType">
						<el-radio-group v-model="registerForm.userType">
							<el-radio :label="1">{{ $t('学生') }}</el-radio>
							<el-radio :label="2">{{ $t('教师') }}</el-radio>
						</el-radio-group>
					</el-form-item>
					
					<el-form-item>
						<el-checkbox v-model="registerForm.agreement" label="">
							{{ $t('我已阅读并同意') }}
							<el-link type="primary" @click="showAgreement">{{ $t('《用户协议》') }}</el-link>
							{{ $t('和') }}
							<el-link type="primary" @click="showPrivacy">{{ $t('《隐私政策》') }}</el-link>
						</el-checkbox>
					</el-form-item>
					
					<div class="op">
						<el-button type="primary" @click="handleRegister">
							{{ $t('注册') }}
						</el-button>
						<el-button @click="goToLogin">
							{{ $t('返回登录') }}
						</el-button>
					</div>
				</el-form>
			</div>
		</div>

		<div class="bg">
			<cl-svg name="bg"></cl-svg>
		</div>

		<a href="https://cool-js.com" class="copyright">
			Copyright © {{ new Date().getFullYear() }} 工程实训学习与实践管理系统
		</a>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

// 表单数据
const registerForm = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  email: '',
  userType: 1,
  agreement: false
});

// 表单验证规则
const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error(t('请输入密码')));
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value?.validateField('confirmPassword');
    }
    callback();
  }
};

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error(t('请再次输入密码')));
  } else if (value !== registerForm.password) {
    callback(new Error(t('两次输入密码不一致')));
  } else {
    callback();
  }
};

const validateAgreement = (rule: any, value: boolean, callback: Function) => {
  if (!value) {
    callback(new Error(t('请阅读并同意用户协议和隐私政策')));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: t('请输入用户名'), trigger: 'blur' },
    { min: 3, max: 20, message: t('长度在 3 到 20 个字符'), trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('请输入姓名'), trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: t('密码长度不能小于6位'), trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: t('请输入正确的邮箱地址'), trigger: 'blur' }
  ],
  userType: [
    { required: true, message: t('请选择用户类型'), trigger: 'change' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
};

// 表单引用
const registerFormRef = ref<any>(null);

// 注册处理
const handleRegister = () => {
  registerFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 表单验证通过，提交注册
      ElMessage.success(t('注册成功，即将跳转到登录页面'));
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      ElMessage.error(t('请完善注册信息'));
      return false;
    }
  });
};

// 显示协议
const showAgreement = () => {
  // 显示用户协议弹窗
};

const showPrivacy = () => {
  // 显示隐私政策弹窗
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};
</script>

<style lang="scss" scoped>
$color: #2c3142;

.page-register {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	position: relative;
	background-color: #fff;
	color: $color;

	.bg {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 90%;
		pointer-events: none;
		transform: rotate(180deg) scaleY(-1);

		.cl-svg {
			height: 100%;
			width: 100%;
		}
	}

	.copyright {
		position: absolute;
		bottom: 15px;
		left: 0;
		text-align: center;
		width: 100%;
		color: var(--el-color-info);
		font-size: 14px;
		user-select: none;
	}

	.box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 50%;
		position: absolute;
		right: 0;
		top: 0;
		z-index: 9;
		overflow-y: auto;

		.logo {
			height: 50px;
			margin-bottom: 20px;
			display: flex;
			align-items: center;
			user-select: none;

			.icon {
				border-radius: 8px;
				padding: 5px;
				margin-right: 10px;
				background-color: $color;

				img {
					height: 36px;
				}
			}

			span {
				font-size: 32px;
				font-weight: bold;
				line-height: 1;
				letter-spacing: 3px;
			}
		}

		.desc {
			font-size: 15px;
			letter-spacing: 1px;
			margin-bottom: 30px;
			user-select: none;
			max-width: 80%;
			text-align: center;
		}

		.form {
			width: 350px;

			:deep(.el-form) {
				.el-form-item {
					margin-bottom: 20px;
				}

				.el-form-item__label {
					color: var(--el-color-info);
					padding-left: 5px;
					user-select: none;
				}

				.el-input {
					box-sizing: border-box;
					font-size: 15px;
					border: 0;
					border-radius: 0;
					background-color: #f8f8f8;
					padding: 0 5px;
					border-radius: 8px;
					position: relative;

					&__wrapper {
						box-shadow: none;
						background-color: transparent;
					}

					&__inner {
						height: 45px;
						color: #333;
					}

					&:-webkit-autofill {
						-webkit-box-shadow: 0 0 0 1000px #f8f8f8 inset;
						box-shadow: 0 0 0 1000px #f8f8f8 inset;
					}
				}
			}
		}

		.op {
			display: flex;
			justify-content: space-between;
			margin-top: 30px;

			:deep(.el-button) {
				height: 45px;
				width: 48%;
				font-size: 16px;
				border-radius: 8px;
				letter-spacing: 1px;
			}
		}
	}
}

@media screen and (max-width: 1024px) {
	.page-register {
		.box {
			width: 100%;
		}
	}
}
</style> 