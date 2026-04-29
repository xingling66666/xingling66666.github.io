const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `my-pwa-${CACHE_VERSION}`;

// 需要缓存的第三方资源域名列表
const THIRD_PARTY_DOMAINS = [
    'fonts.googleapis.cn',
    'unpkg.com',
];

/**
 * 判断是否需要缓存的本地资源
 * 缓存规则：
 * 1. 根路径 /
 * 2. 当前目录及子目录下的 .html 文件
 * 3. ./js/ 目录下的 .js 文件
 * 4. ./css/ 目录下的 .css 文件
 */
function shouldCacheLocal(url) {
    if (url.origin !== self.location.origin) return false;
    
    const path = url.pathname;
    
    // 缓存根路径 /
    if (path === '/') return true;
    
    // 缓存 .html 文件
    if (path.endsWith('.html')) return true;
    
    // 缓存 ./js/ 目录下的 .js 文件
    if (path.startsWith('/js/') && path.endsWith('.js')) return true;
    
    // 缓存 ./css/ 目录下的 .css 文件
    if (path.startsWith('/css/') && path.endsWith('.css')) return true;
    
    return false;
}

/**
 * 判断是否需要缓存的第三方资源
 */
function shouldCacheThirdParty(url) {
    return THIRD_PARTY_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
}

// ========== Install 事件 ==========
self.addEventListener('install', function (event) {
    const urlsToPreCache = ['/'];
    
    event.waitUntil(
        Promise.all([
            self.skipWaiting(),  // 立即激活新 SW，不等页面关闭
            caches.open(CACHE_NAME).then(function (cache) {
                return cache.addAll(urlsToPreCache).catch(err => {
                    console.warn('预缓存根路径失败:', err);
                });
            })
        ])
    );
});

// ========== Activate 事件 ==========
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (name) {
                    if (name !== CACHE_NAME) {
                        console.log('删除旧缓存:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();  // 立即控制所有客户端
        })
    );
});

// ========== Message 事件 ==========
self.addEventListener('message', function (event) {
    const { type } = event.data;
    
    if (type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    } else if (type === 'SKIP_WAITING') {
        self.skipWaiting().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    } else if (type === 'CLEAR_CACHE') {
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (name) {
                    return caches.delete(name);
                })
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// ========== Fetch 事件 ==========
self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);
    const request = event.request;
    
    // 非 GET 请求不缓存
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }
    
    // 缓存本地资源
    if (shouldCacheLocal(url)) {
        event.respondWith(
            caches.match(request).then(function (response) {
                if (response) return response;
                return fetch(request).then(function (networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }
    
    // 缓存第三方 CDN 资源
    if (shouldCacheThirdParty(url)) {
        event.respondWith(
            caches.match(request).then(function (response) {
                if (response) return response;
                return fetch(request).then(function (networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }
    
    // 其他请求正常网络请求，不缓存
    event.respondWith(fetch(request));
});
