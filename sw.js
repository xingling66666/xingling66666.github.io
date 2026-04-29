const CACHE_VERSION = 'v0.1.2';  // 改这里就能触发清理
const CACHE_NAME = `my-pwa-${CACHE_VERSION}`;

// 需要缓存的第三方资源域名列表
const THIRD_PARTY_DOMAINS = [
    'fonts.googleapis.cn',
    'unpkg.com',
];

/**
 * 判断是否需要缓存的本地资源
 */
function shouldCacheLocal(url) {
    if (url.origin !== self.location.origin) return false;
    
    const path = url.pathname;
    
    if (path === '/') return true;
    if (path.endsWith('.html')) return true;
    if (path.startsWith('/js/') && path.endsWith('.js')) return true;
    if (path.startsWith('/css/') && path.endsWith('.css')) return true;
    
    return false;
}

/**
 * 判断是否需要缓存的第三方资源
 */
function shouldCacheThirdParty(url) {
    return THIRD_PARTY_DOMAINS.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
}

// 安装事件
self.addEventListener('install', function (event) {
    console.log('SW 安装中...', CACHE_VERSION);
    
    // 预缓存根路径
    const urlsToPreCache = ['/'];
    
    event.waitUntil(
        (async () => {
            // 立即激活新版本
            await self.skipWaiting();
            
            const cache = await caches.open(CACHE_NAME);
            for (const url of urlsToPreCache) {
                try {
                    await cache.add(url);
                    console.log('预缓存成功:', url);
                } catch (err) {
                    console.warn('预缓存失败:', url, err);
                }
            }
        })()
    );
});

// 激活事件 - 核心：清理旧版本缓存
self.addEventListener('activate', function (event) {
    console.log('SW 激活中...', CACHE_VERSION);
    
    event.waitUntil(
        (async () => {
            // 获取所有缓存名称
            const cacheNames = await caches.keys();
            
            // 删除所有不是当前版本的缓存
            const deletePromises = cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    console.log('删除旧缓存:', cacheName);
                    return caches.delete(cacheName);
                }
            });
            
            await Promise.all(deletePromises);
            console.log('旧缓存清理完成，当前版本:', CACHE_VERSION);
            
            // 立即控制所有客户端
            await self.clients.claim();
            
            // 🆕 通知所有页面刷新（可选）
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_UPDATED',
                    version: CACHE_VERSION
                });
            });
        })()
    );
});

// 消息监听
self.addEventListener('message', function (event) {
    const { type } = event.data;
    
    if (type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    } else if (type === 'SKIP_WAITING') {
        self.skipWaiting().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    } else if (type === 'CLEAR_CACHE') {
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            event.ports[0].postMessage({ success: true });
        })();
    }
});

// 请求拦截
self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);
    const request = event.request;
    
    // 非 GET 请求不缓存
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }
    
    // 🆕 如果是 JS/CSS 文件且当前页面是开发模式，跳过缓存
    const isDev = self.location.hostname === 'localhost' || 
                  self.location.hostname === '127.0.0.1';
    
    if (isDev && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
        event.respondWith(fetch(request));
        return;
    }
    
    // 缓存本地资源
    if (shouldCacheLocal(url)) {
        event.respondWith(
            caches.match(request).then(async (response) => {
                if (response) return response;
                
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.status === 200) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (err) {
                    // 返回离线页面（如果有）
                    if (request.mode === 'navigate') {
                        const offlinePage = await caches.match('/offline.html');
                        if (offlinePage) return offlinePage;
                    }
                    return new Response('网络连接失败', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                }
            })
        );
        return;
    }
    
    // 缓存第三方 CDN 资源
    if (shouldCacheThirdParty(url)) {
        event.respondWith(
            caches.match(request).then(async (response) => {
                if (response) return response;
                
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.status === 200) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (err) {
                    return new Response('CDN 资源加载失败', { status: 503 });
                }
            })
        );
        return;
    }
    
    // 其他请求正常网络请求
    event.respondWith(fetch(request));
});
