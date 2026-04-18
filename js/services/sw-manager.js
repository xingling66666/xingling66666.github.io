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
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.active) return null;
    
    return new Promise((resolve) => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => resolve(null), 3000);
        
        channel.port1.onmessage = (e) => {
            clearTimeout(timeout);
            resolve(e.data.version);
        };
        
        registration.active.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
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
        channel.port1.onmessage = (e) => {
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
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.active) return false;
    
    return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => resolve(e.data.success);
        registration.active.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);
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