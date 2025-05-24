<template>
  <div class="detail-container">
    <div class="back-button">
      <el-button icon="el-icon-arrow-left" @click="goBack">返回论坛</el-button>
    </div>
    
    <div v-if="post" class="post-detail">
      <el-card shadow="hover" class="post-card">
        <!-- 帖子标题和分类 -->
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <el-tag size="medium" :type="getCategoryType(post.category)">{{ post.category }}</el-tag>
        </div>
        
        <!-- 帖子元信息 -->
        <div class="post-meta">
          <div class="author-info">
            <i class="el-icon-user"></i>
            <span class="author-name">{{ post.author }}</span>
          </div>
          <div class="post-time">
            <i class="el-icon-time"></i>
            <span>{{ post.createTime }}</span>
          </div>
          <div class="post-stats">
            <span><i class="el-icon-view"></i> {{ post.views }}</span>
            <span><i class="el-icon-chat-dot-round"></i> {{ post.comments.length }}</span>
            <span class="like-button" @click.stop="likePost">
              <i :class="isLiked ? 'el-icon-star-on' : 'el-icon-star-off'"></i> 
              {{ post.likes }}
            </span>
          </div>
        </div>
        
        <!-- 帖子内容 -->
        <div class="post-content">
          {{ post.content }}
        </div>
      </el-card>
      
      <!-- 评论区 -->
      <el-card shadow="hover" class="comments-card">
        <template #header>
          <div class="comments-header">
            <h3><i class="el-icon-chat-dot-round"></i> 评论 ({{ post.comments.length }})</h3>
          </div>
        </template>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-if="post.comments.length === 0" class="no-comments">
            <el-empty description="暂无评论，快来发表第一条评论吧！"></el-empty>
          </div>
          
          <div v-else class="comment-items">
            <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
              <div class="comment-author">
                <strong>{{ comment.author }}</strong>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 发表评论 -->
        <div class="comment-form">
          <h4>发表评论</h4>
          <el-form :model="commentForm" :rules="commentRules" ref="commentFormRef">
            <el-form-item prop="author">
              <el-input v-model="commentForm.author" placeholder="请输入您的名字" maxlength="20">
                <template #prepend>
                  <i class="el-icon-user"></i>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="content">
              <el-input
                v-model="commentForm.content"
                type="textarea"
                :rows="3"
                placeholder="请输入评论内容"
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitComment">发表评论</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
    
    <div v-else class="post-not-found">
      <el-empty description="帖子不存在或已被删除">
        <el-button @click="goBack">返回论坛</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 帖子数据
const post = ref(null)
const isLiked = ref(false)

// 评论表单
const commentForm = reactive({
  author: '',
  content: ''
})

// 表单验证规则
const commentRules = {
  author: [{ required: true, message: '请输入您的名字', trigger: 'blur' }],
  content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }]
}

const commentFormRef = ref(null)

// 根据分类返回不同的标签类型
const getCategoryType = (category) => {
  const types = {
    '学习讨论': 'info',
    '资源分享': 'success',
    '问题求助': 'warning',
    '经验交流': 'primary',
    '项目展示': ''
  }
  return types[category] || 'info'
}

// 加载帖子数据
const loadPost = () => {
  const postId = Number(route.query.id)
  if (!postId) {
    post.value = null
    return
  }
  
  const storedPosts = localStorage.getItem('forumPosts')
  if (storedPosts) {
    const posts = JSON.parse(storedPosts)
    const foundPost = posts.find(p => p.id === postId)
    
    if (foundPost) {
      // 增加浏览量
      foundPost.views += 1
      localStorage.setItem('forumPosts', JSON.stringify(posts))
      
      post.value = foundPost
      
      // 检查是否已点赞
      const likedPosts = JSON.parse(localStorage.getItem('forumLikedPosts') || '[]')
      isLiked.value = likedPosts.includes(postId)
    } else {
      post.value = null
    }
  } else {
    post.value = null
  }
}

// 返回论坛
const goBack = () => {
  router.push('/forum')
}

// 点赞帖子
const likePost = () => {
  if (!post.value) return
  
  const postId = post.value.id
  const likedPosts = JSON.parse(localStorage.getItem('forumLikedPosts') || '[]')
  
  if (isLiked.value) {
    // 取消点赞
    post.value.likes -= 1
    const index = likedPosts.indexOf(postId)
    if (index > -1) {
      likedPosts.splice(index, 1)
    }
    isLiked.value = false
    ElMessage({
      type: 'info',
      message: '已取消点赞'
    })
  } else {
    // 点赞
    post.value.likes += 1
    likedPosts.push(postId)
    isLiked.value = true
    ElMessage({
      type: 'success',
      message: '点赞成功'
    })
  }
  
  // 更新localStorage
  localStorage.setItem('forumLikedPosts', JSON.stringify(likedPosts))
  
  // 更新帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postIndex = storedPosts.findIndex(p => p.id === postId)
  if (postIndex > -1) {
    storedPosts[postIndex].likes = post.value.likes
    localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
  }
}

// 提交评论
const submitComment = () => {
  commentFormRef.value?.validate((valid) => {
    if (valid && post.value) {
      const now = new Date()
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      const newComment = {
        id: post.value.comments.length > 0 ? Math.max(...post.value.comments.map(c => c.id)) + 1 : 1,
        author: commentForm.author,
        content: commentForm.content,
        time: formattedDate
      }
      
      // 添加评论到当前帖子
      post.value.comments.push(newComment)
      
      // 更新localStorage
      const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
      const postIndex = storedPosts.findIndex(p => p.id === post.value.id)
      if (postIndex > -1) {
        storedPosts[postIndex].comments = post.value.comments
        localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
      }
      
      // 重置表单
      commentForm.content = ''
      
      ElMessage({
        type: 'success',
        message: '评论发表成功！'
      })
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.post-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
}

.author-info, .post-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.post-stats {
  display: flex;
  gap: 15px;
}

.like-button {
  cursor: pointer;
  transition: color 0.2s;
}

.like-button:hover {
  color: #409EFF;
}

.el-icon-star-on {
  color: #F56C6C;
}

.post-content {
  line-height: 1.8;
  font-size: 16px;
  color: #303133;
  white-space: pre-wrap;
}

.comments-card {
  border-radius: 8px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.comments-list {
  margin-bottom: 30px;
}

.no-comments {
  padding: 20px 0;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.comment-author {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #606266;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.comment-form {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.comment-form h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
}

.post-not-found {
  padding: 50px 0;
  text-align: center;
}
</style>
