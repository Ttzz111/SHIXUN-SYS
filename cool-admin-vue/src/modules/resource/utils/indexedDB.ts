/**
 * 资源库IndexedDB工具
 * 用于在浏览器中存储大型资源文件
 */

// 数据库名称和版本
const DB_NAME = 'ResourceLibraryDB';
const DB_VERSION = 1;

// 存储对象名称
const STORE_RESOURCES = 'resources';
const STORE_FILES = 'files';

// 打开数据库连接
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 数据库升级或创建时
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建资源信息存储
      if (!db.objectStoreNames.contains(STORE_RESOURCES)) {
        const resourceStore = db.createObjectStore(STORE_RESOURCES, { keyPath: 'id' });
        resourceStore.createIndex('status', 'status', { unique: false });
        resourceStore.createIndex('userId', 'userId', { unique: false });
        resourceStore.createIndex('categoryId', 'categoryId', { unique: false });
        resourceStore.createIndex('type', 'type', { unique: false });
      }

      // 创建文件内容存储
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 添加资源
export const addResource = async (resource: any, fileData: Blob): Promise<number> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_RESOURCES, STORE_FILES], 'readwrite');
  
  // 生成唯一ID
  const id = Date.now();
  
  // 存储资源信息
  const resourceStore = transaction.objectStore(STORE_RESOURCES);
  const resourceWithId = { ...resource, id };
  await objectStoreRequest(resourceStore.add(resourceWithId));
  
  // 存储文件内容
  const fileStore = transaction.objectStore(STORE_FILES);
  await objectStoreRequest(fileStore.add({ id, data: fileData }));
  
  return id;
};

// 获取资源列表
export const getResources = async (filter: any = {}): Promise<any[]> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_RESOURCES, 'readonly');
  const store = transaction.objectStore(STORE_RESOURCES);
  
  // 获取所有资源
  const resources = await objectStoreRequest(store.getAll());
  
  // 应用筛选条件
  return resources.filter((resource: any) => {
    for (const key in filter) {
      if (filter[key] !== undefined && filter[key] !== '' && resource[key] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
};

// 获取资源文件
export const getResourceFile = async (id: number): Promise<Blob> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_FILES, 'readonly');
  const store = transaction.objectStore(STORE_FILES);
  
  const file = await objectStoreRequest(store.get(id));
  return file.data;
};

// 更新资源状态
export const updateResourceStatus = async (id: number, status: string, auditRemark?: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_RESOURCES, 'readwrite');
  const store = transaction.objectStore(STORE_RESOURCES);
  
  // 获取当前资源
  const resource = await objectStoreRequest(store.get(id));
  
  // 更新状态
  resource.status = status;
  if (auditRemark) {
    resource.auditRemark = auditRemark;
  }
  
  // 保存更新
  await objectStoreRequest(store.put(resource));
};

// 删除资源
export const deleteResource = async (id: number): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_RESOURCES, STORE_FILES], 'readwrite');
  
  // 删除资源信息
  const resourceStore = transaction.objectStore(STORE_RESOURCES);
  await objectStoreRequest(resourceStore.delete(id));
  
  // 删除文件内容
  const fileStore = transaction.objectStore(STORE_FILES);
  await objectStoreRequest(fileStore.delete(id));
};

// 创建URL
export const createResourceUrl = async (id: number): Promise<string> => {
  try {
    const file = await getResourceFile(id);
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('创建资源URL失败:', error);
    return '';
  }
};

// 辅助函数：包装IDBRequest为Promise
function objectStoreRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
} 