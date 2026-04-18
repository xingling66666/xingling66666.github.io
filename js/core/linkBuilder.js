// linkBuilder.js
import { URL_SCHEMES, GAMEDATA_PREFIX } from '../config/constants.js';
import { configToCustomItems, parseBanIdsFromConfig } from '../utils/config/index.js';
import * as storage from '../services/storage.js';

// ============ 辅助函数 ============

/**
 * 生成随机房间ID
 */
export function generateRoomId() {
    return Math.round(Math.random() * 1000000000000000000);
}

/**
 * 获取禁用英雄列表
 */
export { parseBanIdsFromConfig }

// ============ 链接生成 ============

/**
 * 生成仅开房链接（无自定义配置）
 */
export function buildRoomOnlyLink(gameServer, mapInfo) {
    const scheme = URL_SCHEMES[gameServer];
    if (!scheme) throw new Error('无效的游戏模式');

    const { id: mapID, type: mapType, teamerNum } = mapInfo;
    const roomId = generateRoomId();

    const roomData = {
        createType: '2',
        mapID: String(mapID),
        mapType: String(mapType),
        teamerNum: String(teamerNum),
        ullRoomid: String(roomId),
        ullExternUid: String(roomId),
        roomName: '1',
        platType: '4',
        campid: '1',
        AddPos: '0',
        AddType: '2'
    };

    return scheme + GAMEDATA_PREFIX + btoa(JSON.stringify(roomData));
}

/**
 * 生成完整游戏链接（包含自定义配置）
 */
export function generateGameLink(config, gameServer, mapInfo, banHeroData) {
    const scheme = URL_SCHEMES[gameServer];
    if (!scheme) throw new Error('无效的游戏模式');

    const { id: mapID, type: mapType, teamerNum } = mapInfo;
    const roomId = generateRoomId();
    const heroData = storage.getAllHeros();
    const bans = parseBanIdsFromConfig(config?.advanced?.heroBans || banHeroData, heroData);

    const playerCount = teamerNum / 2;
    const roomData = {
        createType: '2',
        mapID: String(mapID),
        mapType: String(mapType),
        teamerNum: String(teamerNum),
        ullRoomid: String(roomId),
        ullExternUid: String(roomId),
        roomName: '1',
        platType: '2',
        campid: '1',
        AddPos: '0',
        AddType: '2',
        banHerosCamp1: bans,
        banHerosCamp2: bans,
        customDefineItems: config ? configToCustomItems(config, playerCount) : []
    };

    console.log('roomData:', roomData);

    const url = scheme + GAMEDATA_PREFIX + btoa(JSON.stringify(roomData));

    return { url, roomData, bans };
}

/**
 * 生成分享链接（用于复制分享）
 */
export function generateShareLink(scheme) {
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]+$/, '');
    const data = btoa(scheme);
    const fullUrl = `${baseUrl}openGame.html?data=${data}`;
    console.log('完整分享链接:', fullUrl);
    return fullUrl;
}

// ============ 链接打开 ============

/**
 * 打开游戏链接
 */
export function openGameLink(url) {
    // QQ内特殊处理
    if (navigator.userAgent.includes("QQ/")) {
        if (url.includes(URL_SCHEMES.zsf)) {
            url = url.replace(
                new RegExp(URL_SCHEMES.zsf),
                'https://h5.nes.smoba.qq.com/pvpesport.web.user/#/launch-game-mp-qq'
            );
        }
    } else if (url.includes(URL_SCHEMES.tyf)) {
        // 体验服在QQ内无法打开
        alert("QQ内无法打开体验服的房间，如想打开请尝试在浏览器打开");
        return false;
    }

    window.location.href = url;

    if (typeof mdui !== 'undefined') {
        mdui.snackbar({ message: "启动成功，如没反应请检查是否安装相关应用或尝试在浏览器打开" });
    }

    return true;
}

// ============ 链接解析 ============

/**
 * 解析游戏链接中的房间数据
 */
export function parseGameLink(url) {
    try {
        const match = url.match(/SmobaLaunch_(.+)$/);
        if (!match) return null;

        const decoded = atob(match[1]);
        return JSON.parse(decoded);
    } catch (e) {
        console.error('解析链接失败:', e);
        return null;
    }
}

/**
 * 检测链接类型
 */
export function detectLinkType(url) {
    for (const [server, config] of Object.entries(GAME_SERVERS)) {
        if (url.includes(config.scheme)) {
            return server;
        }
    }
    return null;
}