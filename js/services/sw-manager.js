// sw-manager.js - SW 管理工具

const CONFIG = {
    testMode: false,  // true 时强制注册，忽略环境检测
};

/**
 * 检查是否为本地/开发环境
 * 匹配：localhost, 127.0.0.1, ::1, 192.168.x.x, 10.x.x.x, 172.16-31.x.x
 */
function isLocalEnvironment() {
    if (CONFIG.testMode) return false;
    
    const hostname = window.location.hostname;
    
    // 标准本地地址
    if (['localhost', '127.0.0.1', '::1'].includes(hostname)) return true;
    
    // 私有 IP 正则（一次性匹配所有内网地址）
    return /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
}

/**
 * 等待 Service Worker 激活
 * @param {number} maxRetries - 最大重试次数，默认 30 次（3秒）
 * @returns {Promise<ServiceWorker|null>} 返回激活的 SW 实例
 */
async function waitForActive(maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.active) return registration.active;
        await new Promise(r => setTimeout(r, 100));
    }
    return null;
}

/**
 * 注册 Service Worker
 */
export async function registerSW(swPath = './sw.js') {
    if (!('serviceWorker' in navigator)) {
        console.warn('浏览器不支持 Service Worker');
        return null;
    }
    
    if (isLocalEnvironment()) {
        console.log('本地环境，跳过 SW 注册');
        return null;
    }
    
    try {
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('SW 注册成功');
        return registration;
    } catch (error) {
        console.error('SW 注册失败:', error);
        return null;
    }
}

/**
 * 获取 SW 版本
 */
export async function getSWVersion() {
    if (isLocalEnvironment()) return 'local-dev';
    
    const active = await waitForActive();
    if (!active) return null;
    
    return new Promise((resolve) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => resolve(null), 1000);
        
        channel.port1.onmessage = (e) => {
            clearTimeout(timeout);
            resolve(e.data.version);
        };
        
        active.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
    });
}

/**
 * 检查更新
 */
export async function checkSWUpdate() {
    if (isLocalEnvironment()) return false;
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    await registration.update();
    return !!registration.waiting;
}

/**
 * 激活等待中的 SW
 */
export async function skipWaiting() {
    if (isLocalEnvironment()) return false;
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.waiting) return false;
    
    return new Promise((resolve) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => resolve(false), 3000);
        
        channel.port1.onmessage = (e) => {
            clearTimeout(timeout);
            if (e.data.success) location.reload();
            resolve(e.data.success);
        };
        
        registration.waiting.postMessage({ type: 'SKIP_WAITING' }, [channel.port2]);
    });
}

/**
 * 清除所有缓存
 */
export async function clearAllCache() {
    if (isLocalEnvironment()) return false;
    
    const active = await waitForActive();
    if (!active) return false;
    
    return new Promise((resolve) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => resolve(false), 3000);
        
        channel.port1.onmessage = (e) => {
            clearTimeout(timeout);
            resolve(e.data.success);
        };
        
        active.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);
    });
}

/**
 * 监听 SW 更新
 */
export function listenSWUpdate(callback) {
    if (isLocalEnvironment() || !navigator.serviceWorker) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => callback?.());
}

export default {
    registerSW,
    getSWVersion,
    checkSWUpdate,
    skipWaiting,
    clearAllCache,
    listenSWUpdate,
    isLocalEnvironment,
};