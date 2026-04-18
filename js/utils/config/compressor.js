// utils/config/compressor.js

import { TAB_KEYS, DEFAULT_VICTORY } from './constants.js';

/**
 * 压缩配置
 */
export function compressConfig(config) {
    const compressed = {
        v: config.version,
        n: config.name,
        vc: config.victory,
        ad: {
            map: config.advanced?.mapName || '',
            ban: config.advanced?.heroBans || '',
            rg: config.advanced?.randomGen || {},
            rs: config.advanced?.randomShuffle || {}
        },
        ct: config.createdAt,
        ut: config.updatedAt
    };
    
    TAB_KEYS.forEach(tabKey => {
        if (config[tabKey]) {
            compressed[tabKey] = config[tabKey];
        }
    });
    
    return compressed;
}

/**
 * 解压配置
 */
export function decompressConfig(compressed) {
    const now = new Date().toISOString();
    const defaultName = `未命名配置_${now}`;
    
    const config = {
        version: compressed.v || 1,
        name: compressed.n || defaultName,
        victory: compressed.vc || DEFAULT_VICTORY,
        advanced: {
            mapID: compressed.ad?.map || '',
            heroBans: compressed.ad?.ban || '',
            randomGen: compressed.ad?.rg || {},
            randomShuffle: compressed.ad?.rs || {}
        },
        createdAt: compressed.ct || now,
        updatedAt: compressed.ut || now
    };
    
    TAB_KEYS.forEach(tabKey => {
        if (compressed[tabKey]) {
            config[tabKey] = compressed[tabKey];
        } else {
            // 从配置中获取 mode，如果没有则默认为 'all'
            const mode = compressed[tabKey]?.mode || 'all';
            config[tabKey] = { mode, data: {} };
        }
    });
    
    return config;
}