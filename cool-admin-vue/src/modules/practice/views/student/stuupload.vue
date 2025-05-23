<template>
  <div class="practice-container">
    <!-- 渐变色Banner -->
    <div class="welcome-banner">
      <h1>实践方案上传</h1>
      <p>针对已通过审批的实践项目，提交你的项目方案。可多次补充和修改，等待教师评阅与反馈。</p>
    </div>
    <div v-if="project" class="upload-card">
      <div class="project-header">
        <div>
          <h3 class="project-title">{{ project.name }}</h3>
          <div class="project-meta">
            <span>项目编号：{{ project.projectNo }}</span>
            <span style="margin-left: 16px;">发布时间：{{ project.publishTime }}</span>
          </div>
        </div>
        <el-tag type="success" effect="plain">已通过</el-tag>
      </div>
      <div class="project-content">
        <div class="project-info">
          <p><i class="el-icon-user"></i> <span class="info-label">发布教师：</span><span class="info-value">{{ project.teacher }}</span></p>
          <p><i class="el-icon-time"></i> <span class="info-label">截止时间：</span><span class="info-value">{{ project.deadline }}</span></p>
        </div>
        <el-divider />
        <!-- 上传方案表单 -->
        <el-form :model="uploadForm" :rules="uploadRules" ref="uploadFormRef" label-width="90px" class="upload-form">
          <el-form-item label="方案说明" prop="desc">
            <el-input v-model="uploadForm.desc" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请填写方案说明" />
          </el-form-item>
          <el-form-item label="上传材料" prop="fileList">
            <el-upload
              class="upload-demo"
              action="#"
              :file-list="uploadForm.fileList"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :limit="5"
              :before-upload="beforeUpload"
              multiple
              list-type="text"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持多文件，单个文件不超过10MB</div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="submitUpload">提交方案</el-button>
            <el-button @click="resetUpload">重置</el-button>
          </el-form-item>
        </el-form>
        <el-divider />
        <!-- 已上传方案列表 -->
        <div v-if="uploadList.length" class="upload-list">
          <h4>已上传方案</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, idx) in uploadList"
              :key="idx"
              :timestamp="item.time"
              placement="top"
              color="#409EFF"
            >
              <div class="upload-item">
                <div class="desc">{{ item.desc }}</div>
                <div class="files">
                  <el-link v-for="(file, fidx) in item.fileList" :key="fidx" :underline="false" type="primary" :href="file.url || '#'" target="_blank">
                    <el-icon style="margin-right:2px"><document /></el-icon>{{ file.name }}
                  </el-link>
                </div>
                <div class="actions">
                  <el-button size="small" @click="editUpload(idx)">修改</el-button>
                  <el-button size="small" type="danger" @click="removeUpload(idx)">删除</el-button>
                </div>
                <div class="review-block" v-if="item.review">
                  <el-divider />
                  <div class="review-title">教师评阅与反馈：</div>
                  <div class="review-content">{{ item.review }}</div>
                </div>
                <div class="review-block" v-else>
                  <el-divider />
                  <div class="review-title">教师评阅与反馈：</div>
                  <div class="review-content">等待教师评阅...</div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
    <div v-else class="no-project">
      <el-empty description="暂无已通过审批的项目，无法上传方案" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

// 模拟已通过项目（与stumenu.vue保持一致）
const project = {
  id: 1,
  name: '工程创客训练：立式绳驱动蛇形自动充电手臂结构及控制系统设计',
  teacher: '王教授',
  deadline: '2025-06-30',
  projectNo: 'P2025001',
  publishTime: '2025-05-01'
}

// 上传表单
const uploadForm = reactive({
  desc: '',
  fileList: []
})
const uploadFormRef = ref()
const uploadRules = {
  desc: [ { required: true, message: '请填写方案说明', trigger: 'blur' } ],
  fileList: [ { required: true, message: '请上传相关材料', trigger: 'change' } ]
}

// 已上传方案列表
const uploadList = ref([
  // 示例：
  // {
  //   desc: '初版方案说明',
  //   fileList: [{ name: '方案文档.docx', url: '#' }],
  //   time: '2024-06-01 10:00',
  //   review: '方案内容详实，建议补充实验数据。'
  // }
])

// 文件上传相关
const handleFileChange = (file, fileList) => {
  uploadForm.fileList = fileList.slice()
}
const handleFileRemove = (file, fileList) => {
  uploadForm.fileList = fileList.slice()
}
const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('单个文件不能超过10MB！')
  }
  return isLt10M
}

// 提交方案
const submitUpload = () => {
  uploadFormRef.value.validate((valid) => {
    if (!valid) return
    uploadList.value.unshift({
      desc: uploadForm.desc,
      fileList: uploadForm.fileList.map(f => ({ name: f.name, url: f.url || '#' })),
      time: new Date().toLocaleString(),
      review: '' // 教师评阅内容，初始为空
    })
    ElMessage.success('方案上传成功！')
    uploadForm.desc = ''
    uploadForm.fileList = []
    nextTick(() => uploadFormRef.value && uploadFormRef.value.clearValidate())
  })
}
// 重置
const resetUpload = () => {
  uploadForm.desc = ''
  uploadForm.fileList = []
  nextTick(() => uploadFormRef.value && uploadFormRef.value.clearValidate())
}
// 修改方案
const editUpload = (idx) => {
  const item = uploadList.value[idx]
  uploadForm.desc = item.desc
  uploadForm.fileList = item.fileList.map(f => ({ ...f }))
  uploadList.value.splice(idx, 1)
  nextTick(() => uploadFormRef.value && uploadFormRef.value.clearValidate())
}
// 删除方案
const removeUpload = (idx) => {
  uploadList.value.splice(idx, 1)
  ElMessage.success('已删除该方案')
}
</script>

<style scoped>
.practice-container {
  padding: 20px;
  box-sizing: border-box;
  height: calc(100vh - 40px); /* 设置容器高度为视窗高度减去padding */
  overflow-y: auto; /* 添加垂直滚动条 */
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
.upload-card {
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
.upload-form {
  max-width: 600px;
}
.upload-list {
  margin-top: 18px;
}
.upload-item {
  background: #f8fafd;
  border-radius: 8px;
  padding: 14px 18px 10px 18px;
  margin-bottom: 8px;
}
.upload-item .desc {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
}
.upload-item .files {
  margin-bottom: 6px;
}
.upload-item .actions {
  margin-bottom: 4px;
}
.review-block {
  background: #f4f8ff;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 8px;
}
.review-title {
  font-size: 14px;
  color: #409EFF;
  font-weight: 600;
  margin-bottom: 2px;
}
.review-content {
  font-size: 14px;
  color: #606266;
}
.no-project {
  margin-top: 60px;
}
</style>
