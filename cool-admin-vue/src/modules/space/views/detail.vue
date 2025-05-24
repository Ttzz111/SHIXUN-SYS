<template>
  <div class="detail-container">
    <div class="back-button">
      <el-button icon="el-icon-arrow-left" @click="goBack">返回论坛</el-button>
    </div>
    
    <div v-if="post" class="post-detail">
      <el-card shadow="hover" class="post-card">
        <!-- 帖子标题和分类 -->
        <div class="post-header">
          <div class="post-header-left">
            <el-tag size="medium" :type="getCategoryType(post.category)" class="category-tag">{{ post.category }}</el-tag>
            <h1 class="post-title">{{ post.title }}</h1>
          </div>
          <div>
            <el-button 
              v-if="isAdmin"
              type="danger" 
              size="small" 
              icon="el-icon-delete" 
              style="margin-left: 10px;" 
              @click="deletePost">删除帖子</el-button>
          </div>
        </div>
        
        <!-- 帖子元信息 -->
        <div class="post-meta">
          <div class="author-info">
            <el-avatar :size="40" :src="post.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
            <span class="author-name">{{ post.author }}</span>
            <span class="post-time">{{ post.createTime }}</span>
          </div>
          <div class="post-actions">
            <span class="action-item">
              <span class="action-icon">👁️</span> {{ post.views }}
            </span>
            <span class="action-item">
              <span class="action-icon">💬</span> {{ post.comments.length }}
            </span>
            <span 
              class="action-item like-btn" 
              :class="{ 'is-liked': isLiked }" 
              @click="toggleLike"
            >
              <span class="action-icon" :class="{ 'is-liked': isLiked }">♥</span> {{ post.likes }}
            </span>
            <span 
              class="action-item favorite-btn" 
              :class="{ 'is-favorited': isFavorited }" 
              @click="toggleFavorite"
            >
              <span class="action-icon" :class="{ 'is-favorited': isFavorited }">★</span> {{ post.favorites || 0 }}
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBase } from '/$/base'

const router = useRouter()
const route = useRoute()
const { user } = useBase()

// 帖子数据
const post = ref(null)
const isLiked = ref(false)
const isFavorited = ref(false)

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

// 判断当前用户是否为管理员
const isAdmin = ref(false)

// 当前用户名
const currentUser = ref('')

// 用户的收藏列表
const userFavorites = ref([])

// 用户的点赞列表
const userLikes = ref([])

// 检查用户权限
const checkUserRole = () => {
  // 从系统获取当前登录用户的角色
  isAdmin.value = user.info?.roleLabel === '管理员'
  
  // 从系统获取当前登录用户的用户名
  currentUser.value = user.info?.username || '游客'
  
  // 加载用户的收藏和点赞数据
  loadUserData()
}

// 加载用户数据
const loadUserData = () => {
  const storedFavorites = localStorage.getItem(`userFavorites_${currentUser.value}`)
  if (storedFavorites) {
    userFavorites.value = JSON.parse(storedFavorites)
  }
  
  const storedLikes = localStorage.getItem(`userLikes_${currentUser.value}`)
  if (storedLikes) {
    userLikes.value = JSON.parse(storedLikes)
  }
  
  // 如果帖子已加载，检查点赞和收藏状态
  if (post.value) {
    isLiked.value = userLikes.value.includes(post.value.id)
    isFavorited.value = userFavorites.value.includes(post.value.id)
  }
}

// 保存用户数据
const saveUserData = () => {
  localStorage.setItem(`userFavorites_${currentUser.value}`, JSON.stringify(userFavorites.value))
  localStorage.setItem(`userLikes_${currentUser.value}`, JSON.stringify(userLikes.value))
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
      
      // 检查是否已点赞和收藏
      isLiked.value = userLikes.value.includes(postId)
      isFavorited.value = userFavorites.value.includes(postId)
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

// 切换点赞状态
const toggleLike = () => {
  if (!post.value) return
  
  const postId = post.value.id
  const index = userLikes.value.indexOf(postId)
  
  // 获取最新的帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postIndex = storedPosts.findIndex(p => p.id === postId)
  if (postIndex === -1) return
  
  if (index === -1) {
    // 添加点赞
    userLikes.value.push(postId)
    // 确保使用存储中的最新点赞数
    storedPosts[postIndex].likes += 1
    post.value.likes = storedPosts[postIndex].likes
    isLiked.value = true
    ElMessage({
      type: 'success',
      message: '点赞成功！',
      duration: 1000
    })
  } else {
    // 取消点赞
    userLikes.value.splice(index, 1)
    // 确保使用存储中的最新点赞数
    storedPosts[postIndex].likes = Math.max(0, storedPosts[postIndex].likes - 1)
    post.value.likes = storedPosts[postIndex].likes
    isLiked.value = false
    ElMessage({
      type: 'info',
      message: '已取消点赞',
      duration: 1000
    })
  }
  
  // 更新本地存储
  saveUserData()
  localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
}

// 切换收藏状态
const toggleFavorite = () => {
  if (!post.value) return
  
  const postId = post.value.id
  const index = userFavorites.value.indexOf(postId)
  
  // 获取最新的帖子数据
  const storedPosts = JSON.parse(localStorage.getItem('forumPosts'))
  const postIndex = storedPosts.findIndex(p => p.id === postId)
  if (postIndex === -1) return
  
  if (index === -1) {
    // 添加收藏
    userFavorites.value.push(postId)
    // 确保使用存储中的最新收藏数
    storedPosts[postIndex].favorites = (storedPosts[postIndex].favorites || 0) + 1
    post.value.favorites = storedPosts[postIndex].favorites
    isFavorited.value = true
    ElMessage({
      type: 'success',
      message: '收藏成功！',
      duration: 1000
    })
  } else {
    // 取消收藏
    userFavorites.value.splice(index, 1)
    // 确保使用存储中的最新收藏数
    storedPosts[postIndex].favorites = Math.max(0, (storedPosts[postIndex].favorites || 0) - 1)
    post.value.favorites = storedPosts[postIndex].favorites
    isFavorited.value = false
    ElMessage({
      type: 'info',
      message: '已取消收藏',
      duration: 1000
    })
  }
  
  // 更新本地存储
  saveUserData()
  localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
}

// 更新帖子数据到本地存储 - 不再需要，上面已直接更新
const updatePostInStorage = () => {
  // 此方法已在toggleLike和toggleFavorite中直接实现
  console.log('This method is deprecated')
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

// 删除帖子
const deletePost = () => {
  if (!post.value) return
  
  ElMessageBox.confirm('确定要删除这篇帖子吗？此操作不可恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (!post.value) return
    
    const postId = post.value.id
    const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || '[]')
    const index = storedPosts.findIndex(p => p.id === postId)
    
    if (index > -1) {
      storedPosts.splice(index, 1)
      localStorage.setItem('forumPosts', JSON.stringify(storedPosts))
      
      ElMessage({
        type: 'success',
        message: '帖子已删除'
      })
      
      // 删除后返回论坛首页
      router.push('/forum')
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 页面加载时获取数据
onMounted(() => {
  checkUserRole()
  loadPost()
  
  // 设置默认作者为当前用户
  if (currentUser.value !== '游客') {
    commentForm.author = currentUser.value
  }
})
</script>

<style scoped>
.detail-container {
  padding: 20px;
  max-width: 90%;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;
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

.post-header-left {
  display: flex;
  align-items: center;
}

.category-tag {
  margin-right: 15px;
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

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-name {
  font-weight: 500;
  color: #606266;
}

.post-time {
  color: #909399;
  font-size: 12px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.action-icon {
  font-size: 16px;
}

.like-btn, .favorite-btn {
  transition: all 0.3s;
}

.like-btn:hover {
  color: #ff6b6b;
}

.favorite-btn:hover {
  color: #ffc107;
}

.like-btn.is-liked {
  color: #ff6b6b;
}

.favorite-btn.is-favorited {
  color: #ffc107;
}

.like-btn .action-icon.is-liked {
  color: #ff6b6b;
}

.favorite-btn .action-icon.is-favorited {
  color: #ffc107;
}

.post-content {
  line-height: 1.8;
  font-size: 16px;
  color: #303133;
  white-space: pre-wrap;
  padding: 10px 0;
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
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>
