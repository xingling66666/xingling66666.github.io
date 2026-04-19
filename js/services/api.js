// api.js - API 请求服务

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
 * 显示超时提示
 * @param {AbortController} controller - AbortController 实例（用于取消 HTTP 请求）
 * @returns {number} 定时器 ID
 */
function showTimeoutTip(controller = null) {
    return setTimeout(() => {
        const confirmed = confirm('请求已超过6秒，是否继续等待？\n点击"确定"继续等待，点击"取消"刷新页面');
        if (!confirmed) {
            if (controller) {
                controller.abort();
            }
            window.location.reload();
        }
    }, 6000);
}

/**
 * 使用 XMLHttpRequest 发送请求（带超时提示）
 * @param {string} url - 请求地址
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
function xhrRequest(url, options = {}) {
    const { method = 'GET', headers = {}, body = null, timeout = API_CONFIG.TIMEOUT } = options;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let tipTimeoutId = showTimeoutTip();

        xhr.timeout = timeout;
        xhr.open(method, url, true);

        Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
        });

        xhr.onload = () => {
            clearTimeout(tipTimeoutId);
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
            clearTimeout(tipTimeoutId);
            reject(new Error('Network error'));
        };

        xhr.ontimeout = () => {
            clearTimeout(tipTimeoutId);
            reject(new Error('Request timeout'));
        };

        xhr.send(body);
    });
}

/**
 * 使用 Fetch API 发送请求（带超时提示）
 * @param {string} url - 请求地址
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
async function fetchRequest(url, options = {}) {
    const { method = 'GET', headers = {}, body = null, timeout = API_CONFIG.TIMEOUT } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const tipTimeoutId = showTimeoutTip(controller);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        clearTimeout(tipTimeoutId);

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
        clearTimeout(tipTimeoutId);
        throw error;
    }
}

/**
 * 统一的请求方法（自动降级：优先 Fetch，失败后使用 XHR）
 * @param {string} url - 请求地址
 * @param {Object} options - 请求选项
 * @returns {Promise<any>}
 */
async function universalRequest(url, options = {}) {
    // 优先使用 Fetch API
    if (window.fetch) {
        try {
            return await fetchRequest(url, options);
        } catch (error) {
            console.warn('Fetch 请求失败，降级使用 XHR:', error);
            return await xhrRequest(url, options);
        }
    } else {
        // 不支持 Fetch，直接使用 XHR
        return await xhrRequest(url, options);
    }
}

/**
 * 获取英雄数据
 * @returns {Promise<Object>}
 */
export async function fetchHeroData() {
    try {
        const data = await universalRequest(API_CONFIG.HERO_API);
        return data;
    } catch (error) {
        console.error('获取英雄数据失败:', error);
        throw error;
    }
}

/**
 * 获取短链接
 * @param {string} longUrl - 长链接
 * @returns {Promise<string>}
 */
export async function getShortLink(longUrl) {
    // 检查是否为 HTTP 或 HTTPS 链接
    const isHttps = longUrl.startsWith('https://');
    const isHttp = longUrl.startsWith('http://');
    
    if (!isHttps && !isHttp) {
        alert('链接格式错误，请检查链接是否以 http:// 或 https:// 开头');
        return longUrl;
    }
    
    // 如果不是 HTTPS，提示用户可能生成失败
    if (!isHttps) {
        const confirmed = confirm('当前链接不是 HTTPS 协议，部分短链接 API 仅支持 HTTPS，可能生成失败。\n是否继续？取消将放弃生成短链接，使用长连接。');
        if (!confirmed) {
            return longUrl;
        }
    }

    try {
        const url = `${API_CONFIG.SHORT_LINK_API}${encodeURIComponent(longUrl)}`;
        const response = await universalRequest(url);

        if (response && response.shorturl) {
            return response.shorturl;
        }

        throw new Error('返回结果格式错误: ' + JSON.stringify(response));

    } catch (error) {
        console.error('获取短链接失败:', error);
        alert('短链接生成失败，将使用原链接');
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

    return await universalRequest(url, {
        method: 'POST',
        body: formData
    });
}

export default {
    fetchHeroData,
    getShortLink,
    requestWithRetry,
    batchRequest,
    downloadFile,
    uploadFile
};