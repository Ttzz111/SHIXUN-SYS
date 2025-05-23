<template>
  <div class="practice-container">
    <!-- 渐变色欢迎Banner -->
    <div class="welcome-banner">
      <h1>实践项目预览</h1>
      <p>浏览所有开放的实践项目，预约参与并等待教师审批。项目涵盖创新、机械、智能、软件等多个方向，快来选择你感兴趣的项目吧！</p>
    </div>
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="项目名称">
            <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable />
          </el-form-item>
          <el-form-item label="发布教师">
            <el-input v-model="searchForm.teacher" placeholder="请输入教师姓名" clearable />
          </el-form-item>
          <el-form-item label="项目状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px;">
              <el-option label="进行中" value="ongoing"></el-option>
              <el-option label="已结束" value="ended"></el-option>
              <el-option label="即将开始" value="upcoming"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <!-- 项目列表区域，带滚动条 -->
    <div class="project-list-scroll">
      <el-row :gutter="20">
        <el-col :span="8" v-for="project in projectList" :key="project.id">
          <el-card class="project-card" :body-style="{ padding: '0px' }">
            <div class="project-card-top" :class="'status-' + project.status"></div>
            <div class="project-header">
              <div>
                <h3 class="project-title">{{ project.name }}</h3>
                <div class="project-meta">
                  <span>项目编号：{{ project.projectNo }}</span>
                  <span style="margin-left: 16px;">发布时间：{{ project.publishTime }}</span>
                </div>
              </div>
              <el-tag :type="getStatusType(project.status)" effect="plain">{{ getStatusText(project.status) }}</el-tag>
            </div>
            <div class="project-content">
              <div class="project-info">
                <p><i class="el-icon-user"></i> <span class="info-label">发布教师：</span><span class="info-value">{{ project.teacher }}</span></p>
                <p><i class="el-icon-time"></i> <span class="info-label">截止时间：</span><span class="info-value">{{ project.deadline }}</span></p>
                <p><i class="el-icon-document"></i> <span class="info-label">项目要求：</span><span class="info-value">{{ project.requirements }}</span></p>
                <p><i class="el-icon-s-custom"></i> <span class="info-label">参与人数：</span><span class="info-value">{{ project.participants }}</span></p>
                <!-- 项目类型标签和剩余天数 -->
                <div class="project-tags">
                  <el-tag size="small" type="info">{{ getProjectType(project.id) }}</el-tag>
                  <span class="remain-days">剩余{{ getRemainDays(project.deadline) }}天</span>
                </div>
                <!-- 项目进度条 -->
                <el-progress :percentage="getProjectProgress(project.status)" :color="getProgressColor(project.status)" style="margin-top:8px;" :show-text="false"/>
              </div>
              <el-divider style="margin: 12px 0 8px 0;"/>
              <div class="project-actions">
                <el-button type="primary" size="large" round @click="handlePreview(project)">查看详情</el-button>
                <template v-if="reservationStatus[project.id]">
                  <el-tag type="warning" style="margin-left:8px;">{{ getReservationStatus(project.id) }}</el-tag>
                  <el-button type="danger" size="large" round style="margin-left:8px;" @click="handleCancelReserve(project)">取消预约</el-button>
                </template>
                <el-button 
                  v-else
                  type="success" 
                  size="large"
                  round
                  @click="openReserveDialog(project)"
                  :disabled="!canReserve(project)"
                >
                  预约参与
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!-- 预约弹窗表单 -->
    <el-dialog
      title="填写预约信息"
      v-model="reserveDialogVisible"
      width="420px"
      :before-close="closeReserveDialog"
    >
      <el-form :model="reserveForm" :rules="reserveRules" ref="reserveFormRef" label-width="90px" status-icon>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="reserveForm.studentId" maxlength="20" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="reserveForm.name" maxlength="10" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="reserveForm.contact" maxlength="20" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="申请理由" prop="reason">
          <el-input v-model="reserveForm.reason" type="textarea" :rows="3" maxlength="100" show-word-limit placeholder="请填写申请理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeReserveDialog">取消</el-button>
        <el-button type="primary" @click="submitReserve">提交预约</el-button>
      </template>
    </el-dialog>
    <!-- 预览对话框 -->
    <el-dialog
      title="项目详情"
      v-model="previewDialogVisible"
      width="60%"
      :before-close="handleClosePreview"
    >
      <div class="preview-content" v-if="currentProject">
        <h2>{{ currentProject.name }}</h2>
        <div class="preview-info">
          <p><strong>发布教师：</strong>{{ currentProject.teacher }}</p>
          <p><strong>截止时间：</strong>{{ currentProject.deadline }}</p>
          <p><strong>项目状态：</strong>{{ getStatusText(currentProject.status) }}</p>
          <p><strong>项目要求：</strong></p>
          <div class="requirements-content">{{ currentProject.requirements }}</div>
          <p><strong>项目描述：</strong></p>
          <div class="description-content">{{ currentProject.description }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  teacher: '',
  status: ''
})

// 项目列表数据
const projectList = ref([
  {
    id: 1,
    name: '工程创客训练：立式绳驱动蛇形自动充电手臂结构及控制系统设计',
    teacher: '王教授',
    deadline: '2025-06-30',
    status: 'ongoing',
    requirements: '掌握机械设计、控制系统设计基础，熟悉SolidWorks、MATLAB等软件',
    description: '本项目旨在设计一种新型的立式绳驱动蛇形机械臂，实现自动充电功能。要求学生掌握机械结构设计、控制系统设计、传感器应用等知识。',
    participants: 12,
    publishTime: '2025-05-01',
    projectNo: 'P2025001'
  },
  {
    id: 2,
    name: '工程创客训练：反射式钢筘筘齿计数器研制',
    teacher: '李教授',
    deadline: '2025-07-15',
    status: 'ongoing',
    requirements: '掌握光学原理、电子电路设计、单片机编程等基础知识',
    description: '开发一种基于反射式原理的钢筘筘齿计数系统，要求具有高精度、高可靠性，适用于工业现场环境。',
    participants: 8,
    publishTime: '2025-05-1',
    projectNo: 'P2025002'
  },
  {
    id: 3,
    name: '工程创客训练：飞机机舱紧固件表面腐蚀损伤检测系统研制',
    teacher: '张教授',
    deadline: '2025-07-20',
    status: 'ongoing',
    requirements: '掌握图像处理、机器视觉、Python编程等知识',
    description: '设计开发一套用于检测飞机机舱紧固件表面腐蚀损伤的自动化检测系统，要求具有高精度、高效率。',
    participants: 15,
    publishTime: '2025-05-1',
    projectNo: 'P2025003'
  },
  {
    id: 4,
    name: '工程创客训练：空气源热泵蒸发器设计、计算与制作',
    teacher: '刘教授',
    deadline: '2025-08-01',
    status: 'upcoming',
    requirements: '掌握热力学、传热学、制冷原理等基础知识，熟悉CAD软件',
    description: '完成空气源热泵蒸发器的设计、热力计算和实物制作，要求具有较高的换热效率和可靠性。',
    participants: 10,
    publishTime: '2025-06-20',
    projectNo: 'P2025004'
  },
  {
    id: 5,
    name: '工程创客训练：基于机器视觉的凸轮类零件尺寸测量',
    teacher: '陈教授',
    deadline: '2025-08-15',
    status: 'upcoming',
    requirements: '掌握机器视觉、图像处理、Python编程等知识',
    description: '开发一套基于机器视觉的凸轮类零件尺寸自动测量系统，要求测量精度高、速度快。',
    participants: 7,
    publishTime: '2025-06-25',
    projectNo: 'P2025005'
  },
  {
    id: 6,
    name: 'Web开发实践项目',
    teacher: '赵教授',
    deadline: '2025-04-30',
    status: 'ended',
    requirements: '掌握HTML、CSS、JavaScript基础，熟悉Vue.js框架',
    description: '本项目旨在帮助学生掌握现代Web开发技术，通过实践项目提升实际开发能力。',
    participants: 20,
    publishTime: '2025-04-1',
    projectNo: 'P2025006'
  }
])

// 预览对话框控制
const previewDialogVisible = ref(false)
const currentProject = ref(null)

// 预约状态
const reservationStatus = ref({
  1: {
    status: 'approved',
    time: new Date().toLocaleString(),
    studentId: '20250001',
    name: '张三',
    contact: '13800000000',
    reason: '希望提升工程实践能力，参与创新项目。'
  }
})

// 预约弹窗表单相关
const reserveDialogVisible = ref(false)
const reserveForm = reactive({
  studentId: '',
  name: '',
  contact: '',
  reason: ''
})
const reserveFormRef = ref()
const reserveRules = {
  studentId: [ { required: true, message: '请输入学号', trigger: 'blur' } ],
  name: [ { required: true, message: '请输入姓名', trigger: 'blur' } ],
  contact: [ { required: true, message: '请输入联系方式', trigger: 'blur' } ],
  reason: [ { required: true, message: '请填写申请理由', trigger: 'blur' } ]
}
let reserveProject = null

// 搜索处理
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  ElMessage.success('搜索功能待实现')
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.teacher = ''
  searchForm.status = ''
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    ongoing: 'success',
    ended: 'info',
    upcoming: 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    ongoing: '进行中',
    ended: '已结束',
    upcoming: '即将开始'
  }
  return statusMap[status] || '未知'
}

// 预览处理
const handlePreview = (project) => {
  currentProject.value = project
  previewDialogVisible.value = true
}

// 关闭预览
const handleClosePreview = () => {
  previewDialogVisible.value = false
  currentProject.value = null
}

// 预约处理
const openReserveDialog = (project) => {
  reserveProject = project
  reserveForm.studentId = ''
  reserveForm.name = ''
  reserveForm.contact = ''
  reserveForm.reason = ''
  reserveDialogVisible.value = true
  nextTick(() => reserveFormRef.value && reserveFormRef.value.clearValidate())
}

// 取消预约
const handleCancelReserve = (project) => {
  ElMessageBox.confirm(
    `确定要取消对"${project.name}"的预约吗？`,
    '取消预约',
    {
      confirmButtonText: '确定',
      cancelButtonText: '返回',
      type: 'warning'
    }
  ).then(() => {
    reservationStatus.value[project.id] = undefined
    ElMessage.success('已取消预约')
  })
}

// 获取预约状态文本
const getReservationStatus = (projectId) => {
  const status = reservationStatus.value[projectId]
  if (!status) return ''
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status.status] || ''
}

// 判断是否可以预约
const canReserve = (project) => {
  if (project.status !== 'ongoing') return false
  if (reservationStatus.value[project.id]) return false
  return true
}

// 项目类型标签（模拟）
const typeList = ['创新', '机械', '智能', '软件', '工程', '设计']
const getProjectType = (id: number) => typeList[id % typeList.length]
// 剩余天数
const getRemainDays = (deadline: string) => {
  const end = new Date(deadline).getTime()
  const now = Date.now()
  const diff = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)))
  return diff
}
// 项目进度条（模拟）
const getProjectProgress = (status: string) => {
  if (status === 'ongoing') return 60
  if (status === 'upcoming') return 10
  if (status === 'ended') return 100
  return 0
}
const getProgressColor = (status: string) => {
  if (status === 'ongoing') return '#409EFF'
  if (status === 'upcoming') return '#E6A23C'
  if (status === 'ended') return '#909399'
  return '#dcdfe6'
}

// 预约弹窗表单相关
const closeReserveDialog = () => {
  reserveDialogVisible.value = false
}
const submitReserve = () => {
  reserveFormRef.value.validate((valid: boolean) => {
    if (!valid) return
    // 模拟预约成功
    reservationStatus.value[reserveProject.id] = {
      status: 'pending',
      time: new Date().toLocaleString(),
      ...reserveForm
    }
    ElMessage.success('预约成功，等待教师审批')
    reserveDialogVisible.value = false
  })
}
</script>

<style scoped>
.practice-container {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-card {
  background-color: #fff;
  border-radius: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.project-list-scroll {
  max-height: 62vh;
  min-height: 320px;
  overflow-y: auto;
  padding-right: 6px;
  margin-top: 20px;
}

.project-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 32px 0 rgba(64,158,255,0.15);
}

.project-card-top {
  height: 6px;
  border-radius: 8px 8px 0 0;
  margin-bottom: -6px;
}

.status-ongoing {
  background: linear-gradient(90deg, #67C23A 0%, #409EFF 100%);
}

.status-ended {
  background: linear-gradient(90deg, #909399 0%, #C0C4CC 100%);
}

.status-upcoming {
  background: linear-gradient(90deg, #E6A23C 0%, #F56C6C 100%);
}

.project-header {
  padding: 15px 15px 0 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: none;
}

.project-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.project-content {
  padding: 15px;
}

.project-info {
  margin-bottom: 15px;
}

.project-info p {
  margin: 8px 0;
  color: #606266;
}

.project-info i {
  margin-right: 5px;
  color: #409EFF;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-content {
  padding: 20px;
}

.preview-info {
  margin-top: 20px;
}

.requirements-content,
.description-content {
  margin-top: 10px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}

.project-meta {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.page-header {
  margin-bottom: 18px;
  padding: 8px 0 0 2px;
}
.page-header h2 {
  font-size: 26px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}
.page-desc {
  color: #666;
  font-size: 15px;
  margin-bottom: 0;
}
.project-tags {
  margin: 8px 0 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.remain-days {
  color: #E6A23C;
  font-size: 13px;
  margin-left: 8px;
}
.el-divider {
  margin: 12px 0 8px 0 !important;
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
.project-card {
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(58,142,230,0.08);
  border: none;
  margin-bottom: 24px;
  overflow: hidden;
  background: #fff;
}
.project-header {
  padding: 18px 18px 0 18px;
  border-bottom: 1px solid #f2f6fc;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: none;
}
.project-title {
  margin: 0;
  font-size: 20px;
  color: #222;
  font-weight: 600;
}
.project-meta {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.project-content {
  padding: 18px;
}
.project-info {
  margin-bottom: 10px;
}
.project-info p {
  margin: 7px 0;
  color: #606266;
  font-size: 15px;
}
.info-label {
  color: #909399;
  font-size: 14px;
}
.info-value {
  color: #222;
  font-weight: 500;
}
.project-tags {
  margin: 8px 0 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.remain-days {
  color: #E6A23C;
  font-size: 13px;
  margin-left: 8px;
}
.el-divider {
  margin: 12px 0 8px 0 !important;
}
.project-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 8px;
}
.project-card-top {
  height: 6px;
  border-radius: 14px 14px 0 0;
  margin-bottom: -6px;
}
.status-ongoing {
  background: linear-gradient(90deg, #67C23A 0%, #409EFF 100%);
}
.status-ended {
  background: linear-gradient(90deg, #909399 0%, #C0C4CC 100%);
}
.status-upcoming {
  background: linear-gradient(90deg, #E6A23C 0%, #F56C6C 100%);
}
.project-list-scroll {
  max-height: 62vh;
  min-height: 320px;
  overflow-y: auto;
  padding-right: 6px;
  margin-top: 20px;
}
.page-header {
  display: none;
}
</style>
