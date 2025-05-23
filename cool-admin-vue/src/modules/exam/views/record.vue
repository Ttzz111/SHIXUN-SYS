<template>
  <div class="record-container">
    <!-- 顶部Banner -->
    <div class="banner">
      <h1>实践成果记录</h1>
      <p>在这里，您可以像发朋友圈一样记录和展示自己的每一项实践成果。</p>
    </div>

    <!-- 发布新成果入口 -->
    <el-card class="publish-section">
      <el-input
        v-model="newContent"
        type="textarea"
        :rows="3"
        placeholder="记录你的新成果..."
        maxlength="200"
        show-word-limit
        style="margin-bottom: 10px;"
      />
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        action="#"
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        :on-change="handleImageChange"
        :file-list="fileList"
        list-type="picture-card"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-button type="primary" @click="publishRecord" :disabled="!newContent || imgLoading">发布成果</el-button>
    </el-card>

    <!-- 成果动态流 -->
    <div class="feed-section">
      <el-card v-for="(item, idx) in recordList" :key="item.id" class="feed-card">
        <div class="feed-header">
          <el-avatar icon="el-icon-user-solid" size="medium" style="margin-right:10px;" />
          <div style="flex:1">
            <div class="feed-title">{{ item.title }}</div>
            <div class="feed-meta">
              <span>{{ item.time }}</span>
              <el-tag v-for="tag in item.tags" :key="tag" size="small" style="margin-left:8px;">{{ tag }}</el-tag>
            </div>
          </div>
          <el-button type="danger" size="small" @click="deleteRecord(idx)">删除</el-button>
        </div>
        <div class="feed-content">{{ item.content }}</div>
        <el-image
          v-if="item.imgUrl"
          :src="item.imgUrl"
          fit="cover"
          class="feed-img"
        />
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'

const defaultList = [
  {
    id: 1,
    title: '基于vslam的多旋翼自主无人机成果 - 立项与方案设计',
    content: '完成了项目立项，制定了无人机自主飞行的技术方案。',
    imgUrl: '',
    time: '2025-05-06 10:00',
    tags: ['项目', '方案设计']
  },
  {
    id: 2,
    title: '基于vslam的多旋翼自主无人机成果 - 结构搭建与调试',
    content: '完成了无人机结构的搭建，并进行了初步调试。',
    imgUrl: '',
    time: '2025-05-07 15:30',
    tags: ['项目', '搭建']
  },
  {
    id: 3,
    title: '基于vslam的多旋翼自主无人机成果 - 自主飞行测试与总结',
    content: '无人机顺利完成自主飞行测试，项目取得阶段性成果！',
    imgUrl: '',
    time: '2025-05-08 09:00',
    tags: ['项目', '测试', '总结']
  }
]

const recordList = ref([])

onMounted(() => {
  const local = localStorage.getItem('recordList')
  if (local) {
    recordList.value = JSON.parse(local)
  } else {
    recordList.value = defaultList
  }
})

watch(recordList, (val) => {
  localStorage.setItem('recordList', JSON.stringify(val))
}, { deep: true })

const newContent = ref('')
const fileList = ref([])
const newImgUrl = ref('')
const imgLoading = ref(false)
const uploadRef = ref()

function handleImageChange(file) {
  imgLoading.value = true
  const reader = new FileReader()
  reader.onload = e => {
    newImgUrl.value = e.target.result as string
    imgLoading.value = false
  }
  reader.readAsDataURL(file.raw)
  fileList.value = [file]
}

function publishRecord() {
  if (!newContent.value) return
  if (imgLoading.value) {
    alert('图片还在处理中，请稍等...')
    return
  }
  recordList.value.unshift({
    id: Date.now(),
    title: '新成果',
    content: newContent.value,
    imgUrl: newImgUrl.value,
    time: new Date().toLocaleString(),
    tags: ['自定义']
  })
  newContent.value = ''
  fileList.value = []
  newImgUrl.value = ''
  imgLoading.value = false
  if (uploadRef.value) uploadRef.value.clearFiles()
}

function deleteRecord(idx) {
  ElMessageBox.confirm(
    '确定要删除这条成果记录吗？',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    recordList.value.splice(idx, 1)
  })
}
</script>

<style scoped>
.record-container {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}
.banner {
  background: linear-gradient(135deg, #6f7ad3 0%, #1989fa 100%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.banner h1 {
  margin: 0;
  font-size: 24px;
}
.banner p {
  margin: 10px 0 0;
  opacity: 0.9;
}
.publish-section {
  margin-bottom: 20px;
}
.feed-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.feed-card {
  margin-bottom: 0;
}
.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.feed-title {
  font-weight: bold;
  font-size: 18px;
}
.feed-meta {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}
.feed-content {
  margin: 10px 0;
  font-size: 15px;
}
.feed-img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  margin-top: 8px;
}
</style>
