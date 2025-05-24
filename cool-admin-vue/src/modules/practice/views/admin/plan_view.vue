<template>
  <div class="plan-view-container">
    <div class="welcome-banner">
      <h1>学生实践方案总览</h1>
      <p>查看所有学生提交的实践项目方案，支持按项目、学生姓名、学号筛选，点击可预览方案材料和教师评阅。</p>
    </div>
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.projectName" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentId" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="plan-list-card" style="margin-top: 18px;">
      <el-table :data="filteredList" border stripe style="width: 100%">
        <el-table-column prop="projectName" label="项目名称" min-width="200" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="desc" label="方案说明" min-width="180" />
        <el-table-column prop="time" label="上传时间" width="170" />
        <el-table-column label="材料" min-width="180">
          <template #default="scope">
            <div>
              <el-link v-for="(file, idx) in scope.row.fileList" :key="idx" :href="file.url || '#'" target="_blank" type="primary" style="margin-right: 8px;">
                <el-icon style="margin-right:2px"><document /></el-icon>{{ file.name }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="教师评阅" min-width="160">
          <template #default="scope">
            <span v-if="scope.row.review">{{ scope.row.review }}</span>
            <span v-else style="color:#aaa">暂无评阅</span>
            <el-button size="small" type="primary" style="margin-left:10px;" @click="openReviewDialog(scope.row)">评阅</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="reviewDialog.visible" title="教师评阅" width="400px">
      <el-form>
        <el-form-item label="评语">
          <el-input v-model="reviewDialog.text" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="请输入评语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Document } from '@element-plus/icons-vue'

const planList = ref([])
const searchForm = reactive({
  projectName: '',
  studentName: '',
  studentId: ''
})

const loadPlanList = () => {
  // 这里假设上传方案时已包含studentName、studentId字段
  planList.value = JSON.parse(localStorage.getItem('practiceUploads') || '[]')
}

onMounted(() => {
  loadPlanList()
})

const handleSearch = () => {
  // 直接触发filteredList的计算属性刷新
}
const resetSearch = () => {
  searchForm.projectName = ''
  searchForm.studentName = ''
  searchForm.studentId = ''
}

const filteredList = computed(() => {
  return planList.value.filter(item => {
    const pn = !searchForm.projectName || (item.projectName && item.projectName.includes(searchForm.projectName))
    const sn = !searchForm.studentName || (item.studentName && item.studentName.includes(searchForm.studentName))
    const sid = !searchForm.studentId || (item.studentId && item.studentId.includes(searchForm.studentId))
    return pn && sn && sid
  })
})

const reviewDialog = reactive({
  visible: false,
  row: null,
  text: ''
})

const openReviewDialog = (row) => {
  reviewDialog.row = row
  reviewDialog.text = row.review || ''
  reviewDialog.visible = true
}
const submitReview = () => {
  if (!reviewDialog.row) return
  // 更新localStorage
  const all = JSON.parse(localStorage.getItem('practiceUploads') || '[]')
  const idx = all.findIndex(r => r.time === reviewDialog.row.time && r.projectId === reviewDialog.row.projectId)
  if (idx !== -1) {
    all[idx].review = reviewDialog.text
    localStorage.setItem('practiceUploads', JSON.stringify(all))
  }
  loadPlanList()
  reviewDialog.visible = false
}

const handleDelete = (row) => {
  // 删除本地localStorage
  const all = JSON.parse(localStorage.getItem('practiceUploads') || '[]')
  const idx = all.findIndex(r => r.time === row.time && r.projectId === row.projectId)
  if (idx !== -1) {
    all.splice(idx, 1)
    localStorage.setItem('practiceUploads', JSON.stringify(all))
  }
  loadPlanList()
}
</script>

<style scoped>
.plan-view-container {
  padding: 20px;
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
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 2px;
}
.welcome-banner p {
  font-size: 15px;
  opacity: 0.92;
  margin-bottom: 0;
}
.search-card {
  margin-bottom: 18px;
}
.plan-list-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(58,142,230,0.06);
  padding: 18px 0 0 0;
}
</style>
