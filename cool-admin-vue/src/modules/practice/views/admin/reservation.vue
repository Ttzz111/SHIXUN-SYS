<template>
  <div class="reservation-container">
    <!-- 渐变色欢迎Banner -->
    <div class="welcome-banner">
      <h1>实践项目预约审批</h1>
      <p>查看并审批学生的实践项目预约申请，确保项目参与人员的合理分配。</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="项目名称">
            <el-input v-model="searchForm.projectName" placeholder="请输入项目名称" clearable />
          </el-form-item>
          <el-form-item label="学生姓名">
            <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
          </el-form-item>
          <el-form-item label="审批状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 160px;">
              <el-option label="待审批" value="pending"></el-option>
              <el-option label="已通过" value="approved"></el-option>
              <el-option label="已拒绝" value="rejected"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 预约列表区域 -->
    <div class="reservation-list">
      <el-table
        v-loading="loading"
        :data="reservationList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="200">
          <template #default="scope">
            <div class="project-name-cell">
              <el-icon><document /></el-icon>
              <span>{{ scope.row.projectName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="100"></el-table-column>
        <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
        <el-table-column prop="contact" label="联系方式" width="150"></el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="170"></el-table-column>
        <el-table-column prop="status" label="审批状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请理由" min-width="180"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <template v-if="scope.row.status === 'pending'">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleApprove(scope.row)"
                >
                  通过
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleReject(scope.row)"
                >
                  拒绝
                </el-button>
              </template>
              <el-button 
                type="primary" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      title="预约详情"
      v-model="detailDialogVisible"
      width="50%"
    >
      <div class="detail-content" v-if="currentReservation">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">{{ currentReservation.projectName }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ currentReservation.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentReservation.studentId }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentReservation.contact }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentReservation.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(currentReservation.status)">
              {{ getStatusText(currentReservation.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">
            {{ currentReservation.reason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            type="success" 
            @click="handleApprove(currentReservation)"
            v-if="currentReservation?.status === 'pending'"
          >
            通过
          </el-button>
          <el-button 
            type="danger" 
            @click="handleReject(currentReservation)"
            v-if="currentReservation?.status === 'pending'"
          >
            拒绝
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  projectName: '',
  studentName: '',
  status: ''
})

// 加载状态
const loading = ref(false)

// 预约列表数据
const reservationList = ref([
  {
    id: 1,
    projectName: '工程创客训练：立式绳驱动蛇形自动充电手臂结构及控制系统设计',
    studentName: 'stu1',
    studentId: '205888',
    contact: '13800000000',
    applyTime: '2025-05-05 14:30:00',
    status: 'pending',
    reason: '我对机械设计和控制系统设计有浓厚兴趣，希望参与这个项目来提升实践能力。'
  },
  {
    id: 2,
    projectName: '工程创客训练：反射式钢筘筘齿计数器研制',
    studentName: 'stu2',
    studentId: '205288',
    contact: '13900000000',
    applyTime: '2025-05-05 10:15:00',
    status: 'approved',
    reason: '我具备光学原理和电子电路设计的基础知识，希望能参与这个项目。'
  }
])

// 详情对话框控制
const detailDialogVisible = ref(false)
const currentReservation = ref(null)

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 搜索处理
const handleSearch = () => {
  loading.value = true
  // TODO: 实现搜索逻辑
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  searchForm.projectName = ''
  searchForm.studentName = ''
  searchForm.status = ''
  handleSearch()
}

// 查看详情
const handleView = (row) => {
  currentReservation.value = row
  detailDialogVisible.value = true
}

// 审批通过
const handleApprove = (row) => {
  ElMessageBox.confirm(
    '确定要通过该预约申请吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现审批通过逻辑
    ElMessage.success('审批通过成功')
  }).catch(() => {})
}

// 审批拒绝
const handleReject = (row) => {
  ElMessageBox.confirm(
    '确定要拒绝该预约申请吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现审批拒绝逻辑
    ElMessage.success('已拒绝该申请')
  }).catch(() => {})
}

// 多选数据
const multipleSelection = ref([])

// 选择变化处理
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}
</script>

<style scoped>
.reservation-container {
  padding: 20px;
}

.welcome-banner {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.welcome-banner h1 {
  margin: 0;
  font-size: 24px;
  margin-bottom: 12px;
}

.welcome-banner p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.search-section {
  margin-bottom: 20px;
}

.search-card {
  background: #fff;
}

.reservation-list {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.detail-content {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}
</style>
