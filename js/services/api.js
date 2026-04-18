// api.js - API 请求服务
import * as storage from '../services/storage.js';

// API 基础配置
const API_CONFIG = {
    // 英雄数据 API
    HERO_API: 'https://ouwhiy7vaifi44w6ee26vxikny0bzigt.lambda-url.ap-east-1.on.aws/getheros',
    // 短链接 API
    SHORT_LINK_API: 'https://api.mmp.cc/api/dwz?longurl=',
    // 请求超时时间
    TIMEOUT: 30000
};

/**
 * 发送 HTTP 请求
 * @param {string} url - 请求地址
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
function request(url, options = {}) {
    const { method = 'GET', headers = {}, body = null, timeout = API_CONFIG.TIMEOUT } = options;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // 设置超时
        xhr.timeout = timeout;

        xhr.open(method, url, true);

        // 设置请求头
        Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
        });

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    resolve(xhr.responseText);
                }
            } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error'));
        };

        xhr.ontimeout = () => {
            reject(new Error('Request timeout'));
        };

        xhr.send(body);
    });
}

/**
 * 使用 Fetch API 发送请求
 * @param {string} url - 请求地址
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
async function fetchRequest(url, options = {}) {
    const { method = 'GET', headers = {}, body = null, timeout = API_CONFIG.TIMEOUT } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();

    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * 获取英雄数据
 * @returns {Promise<Object>}
 */
export async function fetchHeroData() {
    try {
        const data = await fetchRequest(API_CONFIG.HERO_API);
        return data;
    } catch (error) {
        console.error('获取英雄数据失败:', error);
        throw error;
    }
}

/**
 * 更新英雄配置
 * @returns {Promise<boolean>}
 */
export async function updateHeroConfig() {
    try {
        const data = await fetchHeroData();
        storage.setAllHeros(data);
        return true;
    } catch (error) {
        console.error('更新英雄配置失败:', error);
        return false;
    }
}

/**
 * 获取短链接
 * @param {string} longUrl - 长链接
 * @returns {Promise<string>}
 */
export async function getShortLink(longUrl) {
    // 确保是 HTTPS 链接
    if (!longUrl.startsWith('https://') && !longUrl.startsWith('http://')) {
        longUrl = `https://${longUrl}`;
    }

    try {
        const url = `${API_CONFIG.SHORT_LINK_API}${encodeURIComponent(longUrl)}`;
        const response = await fetchRequest(url);

        if (response && response.shorturl) {
            return response.shorturl;
        }

        throw new Error('返回结果格式错误: ' + JSON.stringify(response));

    } catch (error) {
        console.error('获取短链接失败:', error);
        // 失败时返回原链接
        return longUrl;
    }
}

/**
 * 带重试的请求
 * @param {Function} requestFn - 请求函数
 * @param {number} maxRetries - 最大重试次数
 * @returns {Promise<any>}
 */
export async function requestWithRetry(requestFn, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;

            if (i < maxRetries - 1) {
                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    throw lastError;
}

/**
 * 批量请求
 * @param {Array<Function>} requests - 请求函数数组
 * @param {number} concurrency - 并发数
 * @returns {Promise<Array>}
 */
export async function batchRequest(requests, concurrency = 3) {
    const results = [];
    const queue = [...requests];

    async function worker() {
        while (queue.length > 0) {
            const requestFn = queue.shift();
            try {
                const result = await requestFn();
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error });
            }
        }
    }

    const workers = Array(Math.min(concurrency, requests.length))
        .fill(null)
        .map(() => worker());

    await Promise.all(workers);
    return results;
}

/**
 * 下载文件
 * @param {string} url - 文件地址
 * @param {string} filename - 文件名
 */
export function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 上传文件
 * @param {File} file - 文件对象
 * @param {string} url - 上传地址
 * @returns {Promise<any>}
 */
export async function uploadFile(file, url) {
    const formData = new FormData();
    formData.append('file', file);

    return await fetchRequest(url, {
        method: 'POST',
        body: formData
    });
}

// 导出默认对象
export default {
    fetchHeroData,
    updateHeroConfig,
    getShortLink,
    requestWithRetry,
    batchRequest,
    downloadFile,
    uploadFile
};