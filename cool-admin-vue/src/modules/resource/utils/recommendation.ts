/**
 * 资源推荐系统
 * 实现冷启动和热启动推荐策略
 */
import { getResources } from './indexedDB';

// 用户访问历史存储 (resourceId -> 访问次数)
interface VisitHistory {
  [resourceId: number]: number;
}

// 全局访问历史 (resourceId -> 访问次数)
const globalVisitHistory: VisitHistory = {};

// 用户访问历史 (userId -> { resourceId -> 访问次数 })
const userVisitHistory: { [userId: string]: VisitHistory } = {};

// 用户兴趣标签 (userId -> [categoryIds])
const userInterests: { [userId: string]: number[] } = {};

/**
 * 记录资源访问历史
 * @param userId 用户ID
 * @param resourceId 资源ID
 */
export const recordResourceVisit = (userId: string, resourceId: number): void => {
  // 记录全局访问历史
  if (!globalVisitHistory[resourceId]) {
    globalVisitHistory[resourceId] = 0;
  }
  globalVisitHistory[resourceId]++;
  
  // 记录用户访问历史
  if (!userVisitHistory[userId]) {
    userVisitHistory[userId] = {};
  }
  if (!userVisitHistory[userId][resourceId]) {
    userVisitHistory[userId][resourceId] = 0;
  }
  userVisitHistory[userId][resourceId]++;
  
  // 更新本地存储
  localStorage.setItem('resourceRecommendation:globalVisitHistory', JSON.stringify(globalVisitHistory));
  localStorage.setItem('resourceRecommendation:userVisitHistory', JSON.stringify(userVisitHistory));
};

/**
 * 设置用户兴趣分类
 * @param userId 用户ID
 * @param interests 兴趣分类ID数组
 */
export const setUserInterests = (userId: string, interests: number[]): void => {
  userInterests[userId] = interests;
  localStorage.setItem('resourceRecommendation:userInterests', JSON.stringify(userInterests));
};

/**
 * 添加用户兴趣分类
 * @param userId 用户ID
 * @param categoryId 分类ID
 */
export const addUserInterest = (userId: string, categoryId: number): void => {
  if (!userInterests[userId]) {
    userInterests[userId] = [];
  }
  
  if (!userInterests[userId].includes(categoryId)) {
    userInterests[userId].push(categoryId);
    localStorage.setItem('resourceRecommendation:userInterests', JSON.stringify(userInterests));
  }
};

/**
 * 初始化推荐系统，从本地存储加载数据
 */
export const initRecommendationSystem = (): void => {
  try {
    // 加载全局访问历史
    const savedGlobalHistory = localStorage.getItem('resourceRecommendation:globalVisitHistory');
    if (savedGlobalHistory) {
      Object.assign(globalVisitHistory, JSON.parse(savedGlobalHistory));
    }
    
    // 加载用户访问历史
    const savedUserHistory = localStorage.getItem('resourceRecommendation:userVisitHistory');
    if (savedUserHistory) {
      Object.assign(userVisitHistory, JSON.parse(savedUserHistory));
    }
    
    // 加载用户兴趣
    const savedUserInterests = localStorage.getItem('resourceRecommendation:userInterests');
    if (savedUserInterests) {
      Object.assign(userInterests, JSON.parse(savedUserInterests));
    }
  } catch (error) {
    console.error('初始化推荐系统失败:', error);
  }
};

/**
 * 获取热门资源
 * @param limit 限制数量
 * @returns 资源ID数组
 */
const getPopularResources = (limit: number = 5): number[] => {
  // 根据访问次数排序
  const sortedResources = Object.entries(globalVisitHistory)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => Number(id))
    .slice(0, limit);
  
  return sortedResources;
};

/**
 * 获取用户最感兴趣的分类
 * @param userId 用户ID
 * @returns 分类ID数组
 */
const getUserTopCategories = (userId: string): number[] => {
  // 如果用户有明确设置的兴趣，直接返回
  if (userInterests[userId] && userInterests[userId].length > 0) {
    return userInterests[userId];
  }
  
  // 如果用户有访问历史，分析访问历史中的分类
  if (userVisitHistory[userId]) {
    const userHistory = userVisitHistory[userId];
    const categoryCount: { [categoryId: number]: number } = {};
    
    // 统计每个分类的访问次数
    Object.keys(userHistory).forEach(async (resourceId) => {
      try {
        const resources = await getResources({ id: Number(resourceId) });
        if (resources.length > 0) {
          const categoryId = resources[0].categoryId;
          if (!categoryCount[categoryId]) {
            categoryCount[categoryId] = 0;
          }
          categoryCount[categoryId] += userHistory[Number(resourceId)];
        }
      } catch (error) {
        console.error('获取资源分类失败:', error);
      }
    });
    
    // 返回访问次数最多的前3个分类
    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => Number(id))
      .slice(0, 3);
  }
  
  // 默认返回所有分类的前三个
  return [101, 103, 301];
};

/**
 * 获取用户感兴趣的资源推荐
 * @param userId 用户ID
 * @param limit 限制数量
 * @returns 资源数组
 */
export const getRecommendedResources = async (userId: string, limit: number = 10): Promise<any[]> => {
  // 获取所有已审核通过的资源
  const allResources = await getResources({ status: 'approved' });
  
  // 如果用户没有访问历史，执行冷启动推荐
  if (!userVisitHistory[userId] || Object.keys(userVisitHistory[userId]).length === 0) {
    return getColdStartRecommendations(userId, allResources, limit);
  }
  
  // 否则执行热启动推荐
  return getHotStartRecommendations(userId, allResources, limit);
};

/**
 * 冷启动推荐策略
 * @param userId 用户ID
 * @param resources 所有资源
 * @param limit 限制数量
 * @returns 推荐资源数组
 */
const getColdStartRecommendations = (userId: string, resources: any[], limit: number): any[] => {
  // 获取用户感兴趣的分类
  const topCategories = getUserTopCategories(userId);
  
  // 策略1: 基于用户兴趣分类的资源
  let recommendations: any[] = resources.filter(resource => 
    topCategories.includes(resource.categoryId)
  );
  
  // 策略2: 如果基于兴趣的推荐不足，添加最新上传的资源
  if (recommendations.length < limit) {
    const latestResources = resources
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      .filter(resource => !recommendations.includes(resource))
      .slice(0, limit - recommendations.length);
    
    recommendations = recommendations.concat(latestResources);
  }
  
  // 策略3: 如果仍然不足，添加全局热门资源
  if (recommendations.length < limit) {
    const popularResourceIds = getPopularResources(limit - recommendations.length);
    const popularResources = resources.filter(resource => 
      popularResourceIds.includes(resource.id) && !recommendations.includes(resource)
    );
    
    recommendations = recommendations.concat(popularResources);
  }
  
  // 如果推荐仍不足，随机补充
  if (recommendations.length < limit) {
    const remainingResources = resources.filter(resource => 
      !recommendations.includes(resource)
    );
    
    // 随机打乱
    const shuffled = remainingResources.sort(() => 0.5 - Math.random());
    recommendations = recommendations.concat(shuffled.slice(0, limit - recommendations.length));
  }
  
  return recommendations.slice(0, limit);
};

/**
 * 热启动推荐策略
 * @param userId 用户ID
 * @param resources 所有资源
 * @param limit 限制数量
 * @returns 推荐资源数组
 */
const getHotStartRecommendations = (userId: string, resources: any[], limit: number): any[] => {
  const userHistory = userVisitHistory[userId] || {};
  let recommendations: any[] = [];
  
  // 策略1: 基于用户访问次数的资源相似推荐
  // 找出用户访问最多的几个资源
  const topVisitedResourceIds = Object.entries(userHistory)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => Number(id))
    .slice(0, 3);
  
  // 找出这些资源的类型和分类
  const topResourceTypes: Set<string> = new Set();
  const topResourceCategories: Set<number> = new Set();
  
  const topResources = resources.filter(resource => topVisitedResourceIds.includes(resource.id));
  topResources.forEach(resource => {
    if (resource.type) topResourceTypes.add(resource.type);
    if (resource.categoryId) topResourceCategories.add(resource.categoryId);
  });
  
  // 推荐类似的资源（相同类型或分类）
  recommendations = resources.filter(resource => 
    (resource.type && topResourceTypes.has(resource.type)) || 
    (resource.categoryId && topResourceCategories.has(resource.categoryId)) &&
    !topVisitedResourceIds.includes(resource.id)
  );
  
  // 如果相似推荐不足，添加热门资源
  if (recommendations.length < limit) {
    const popularResourceIds = getPopularResources(limit - recommendations.length);
    const popularResources = resources.filter(resource => 
      popularResourceIds.includes(resource.id) && 
      !recommendations.includes(resource) &&
      !topVisitedResourceIds.includes(resource.id)
    );
    
    recommendations = recommendations.concat(popularResources);
  }
  
  // 如果仍然不足，添加最新资源
  if (recommendations.length < limit) {
    const latestResources = resources
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      .filter(resource => 
        !recommendations.includes(resource) && 
        !topVisitedResourceIds.includes(resource.id)
      )
      .slice(0, limit - recommendations.length);
    
    recommendations = recommendations.concat(latestResources);
  }
  
  // 如果推荐仍不足，随机补充
  if (recommendations.length < limit) {
    const remainingResources = resources.filter(resource => 
      !recommendations.includes(resource) && 
      !topVisitedResourceIds.includes(resource.id)
    );
    
    // 随机打乱
    const shuffled = remainingResources.sort(() => 0.5 - Math.random());
    recommendations = recommendations.concat(shuffled.slice(0, limit - recommendations.length));
  }
  
  return recommendations.slice(0, limit);
}; 