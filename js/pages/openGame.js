// app/openGame.js - 打开游戏页面

import { URL_SCHEMES, GAMEDATA_PREFIX } from '../config/constants.js';
import { getMapNameById } from '../data/mapData.js';
import { initHeroData, getDetailedBanDescription } from '../data/heroData.js';
import { openGameLink } from '../core/linkBuilder.js';
import { parseGameDataToText, parseGameDataToConfig } from '../utils/config/index.js';
import { copyText } from '../services/clipboard.js';
import { registerSW } from '../services/sw-manager.js';

registerSW('./sw.js');

const state = {
    gameData: null,
    gameType: '正式服',
    gameUrl: '',
    gameBase64Data: ''
};

const elements = {
    roomInfo: document.getElementById('roomInfo'),
    hintMsg: document.getElementById('hintMsg'),
    detailPanel: document.getElementById('detailPanel'),
    detailTitle: document.getElementById('detailTitle'),
    detailContent: document.getElementById('detailContent'),
    btnClosePanel: document.getElementById('btnClosePanel'),
    btnCopyConfig: document.getElementById('btnCopyConfig'),
    btnBlue: document.getElementById('btnBlue'),
    btnRed: document.getElementById('btnRed'),
    btnExit: document.getElementById('btnExit'),
    btnViewCustom: document.getElementById('btnViewCustom'),
    btnHome: document.getElementById('btnHome'),
    toast: document.getElementById('toast')
};

// ============ 工具函数 ============

/**
 * 显示轻量提示
 */
function showToast(msg, duration = 2000) {
    const { toast } = elements;
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ============ URL 解析 ============

/**
 * 解析 URL 中的游戏数据
 */
function parseUrlData() {
    const url = window.location.href;
    const dataMatch = url.split(/\?data=(.+)/)[1];

    const redirectToHome = () => {
        window.location.replace(window.location.origin + '/');
        return false;
    };

    if (!dataMatch) {
        return redirectToHome();
    }

    let scheme;
    try {
        scheme = atob(dataMatch);
    } catch (e) {
        console.error('Base64 解码失败:', e);
        return redirectToHome();
    }

    // 获取正式服和体验服的 scheme
    const zsfScheme = URL_SCHEMES.zsf;
    const tyfScheme = URL_SCHEMES.tyf;
    const zsfPrefix = zsfScheme + GAMEDATA_PREFIX;
    const tyfPrefix = tyfScheme + GAMEDATA_PREFIX;

    let gameBase64Data;

    if (scheme.includes(zsfPrefix)) {
        state.gameType = '正式服';
        state.gameUrl = zsfScheme;
        gameBase64Data = scheme.split(zsfPrefix)[1];
    } else if (scheme.includes(tyfPrefix)) {
        state.gameType = '体验服';
        state.gameUrl = tyfScheme;
        gameBase64Data = scheme.split(tyfPrefix)[1];
    } else {
        return redirectToHome();
    }

    try {
        const jsonStr = atob(gameBase64Data);
        state.gameData = JSON.parse(jsonStr);
        state.gameBase64Data = gameBase64Data;
        return true;
    } catch (e) {
        console.error('解析游戏数据失败:', e);
        return false;
    }
}

// ============ 数据处理 ============

/**
 * 获取地图名称
 */
function getMapName(mapId) {
    const mapName = getMapNameById(parseInt(mapId));
    return mapName || `地图${mapId}`;
}

/**
 * 获取禁用英雄描述
 */
function getBanHeroDescription() {
    const { gameData } = state;

    if (!gameData?.banHerosCamp1 || gameData.banHerosCamp1.length === 0) {
        return '无禁用英雄';
    }

    const banIds = gameData.banHerosCamp1;
    return getDetailedBanDescription(banIds);
}

/**
 * 生成完整配置文本
 */
function generateFullConfig() {
    const { gameData, gameType } = state;

    if (!gameData) {
        return '无配置数据';
    }

    const mapId = gameData.mapID || '未知';
    const mapName = getMapName(mapId);
    const customConfigText = parseGameDataToText(gameData);
    const banText = getBanHeroDescription();

    return [
        '【房间信息】',
        `${gameType} · ${mapName}`,
        `玩家数量：${gameData.teamerNum || 10}人`,
        '',
        '【自定义配置】',
        customConfigText,
        '',
        '【禁用英雄】',
        banText
    ].join('\n');
}

/**
 * 设置阵营 URL
 */
function setCampUrl(campId) {
    const { gameData, gameUrl } = state;

    if (!gameData) return '';

    const roomData = { ...gameData };
    delete roomData.AddPos;
    roomData.AddType = '0';
    roomData.campid = String(campId);

    const gamedata = JSON.stringify(roomData);
    return gameUrl + GAMEDATA_PREFIX + btoa(gamedata);
}

// ============ UI 操作 ============

/**
 * 显示详情面板
 */
function showDetailPanel(title, content) {
    const { detailTitle, detailContent, detailPanel } = elements;

    if (!detailTitle || !detailContent || !detailPanel) return;

    detailTitle.innerText = title;
    detailContent.innerText = content;
    detailPanel.classList.add('show');
    detailContent.scrollTop = 0;
}

/**
 * 隐藏详情面板
 */
function hideDetailPanel() {
    elements.detailPanel?.classList.remove('show');
}

/**
 * 更新页面信息
 */
function updatePageInfo() {
    const { gameData, gameType } = state;
    const { roomInfo, hintMsg } = elements;

    if (!gameData) return;

    const mapId = gameData.mapID || '未知';
    const mapName = getMapName(mapId);

    if (roomInfo) {
        roomInfo.innerText = `${gameType} · ${mapName}`;
    }
    if (hintMsg) {
        hintMsg.innerText = '点击上方按钮选择阵营加入';
    }
}

// ============ 事件处理 ============

/**
 * 处理蓝方阵营点击
 */
function handleBlueClick() {
    const url = setCampUrl(1);
    if (url) openGameLink(url);
}

/**
 * 处理红方阵营点击
 */
function handleRedClick() {
    const url = setCampUrl(2);
    if (url) openGameLink(url);
}
/**
 * 处理退出房间点击
 */
function handleExitClick() {
    const { gameUrl } = state;
    const url = gameUrl + GAMEDATA_PREFIX + 'AAAA';
    openGameLink(url);
}

/**
 * 处理查看自定义配置
 */
function handleViewCustom() {
    const { detailPanel } = elements;

    // 检查面板是否已打开且是同一个面板
    const isOpen = detailPanel?.classList.contains('show');

    // 如果已打开则关闭
    if (isOpen) {
        hideDetailPanel();
        return;
    }

    // 否则打开面板
    try {
        const configText = generateFullConfig();
        showDetailPanel('自定义配置', configText);
    } catch (e) {
        console.error('解析配置失败:', e);
        showDetailPanel('自定义配置', '解析配置失败: ' + e.message);
    }
}

/**
 * 处理返回首页
 */
function handleHome() {
    window.top.location = window.location.origin + '/';
}

/**
 * 处理复制配置
 */
function handleCopyConfig() {
    const { gameData } = state;

    if (!gameData) {
        showToast('无配置数据');
        return;
    }

    try {
        const convertConfig = parseGameDataToConfig(gameData);
        if (convertConfig) {
            copyText(JSON.stringify(convertConfig));
            setTimeout(() => {
                alert('转换成功！请粘贴到网页自定义配置。该配置包含高级设置（指定地图/禁用英雄），可在「自定义配置」编辑框中点击「高级设置」调整。');
            }, 100);
        }
    } catch (e) {
        console.error('转换配置失败:', e);
        showToast('转换配置失败');
    }
}

// ============ 事件绑定 ============

function bindEvents() {
    const {
        btnBlue, btnRed, btnExit, btnViewCustom, btnHome,
        btnClosePanel, btnCopyConfig
    } = elements;

    if (btnBlue) btnBlue.addEventListener('click', handleBlueClick);
    if (btnRed) btnRed.addEventListener('click', handleRedClick);
    if (btnExit) btnExit.addEventListener('click', handleExitClick);
    if (btnViewCustom) btnViewCustom.addEventListener('click', handleViewCustom);
    if (btnHome) btnHome.addEventListener('click', handleHome);
    if (btnClosePanel) btnClosePanel.addEventListener('click', hideDetailPanel);
    if (btnCopyConfig) btnCopyConfig.addEventListener('click', handleCopyConfig);
}


async function initPage() {
    console.log('打开游戏页面初始化...');

    try {
        // 1. 初始化英雄数据
        await initHeroData();

        // 2. 解析 URL 数据
        if (!parseUrlData()) {
            handleHome();
            console.warn('无效的链接，重定向到首页');
            return;
        }

        // 3. 更新页面信息
        updatePageInfo();

        // 4. 绑定事件
        bindEvents();

        console.log('✓ 页面初始化完成');
    } catch (error) {
        console.error('✗ 初始化失败:', error);
        showToast('初始化失败，请刷新重试');
    }
}

initPage();