// mapData.js - 地图数据管理

// 地图数据格式: [地图ID, 模式类型, 队伍人数]

// ========== 全部地图数据（仅展示） ==========
const allMapData = {
    // 训练营
    "多人训练营": [20047, 1, 4],
    
    // 5v5 模式
    "5v5": [20011, 1, 10],
    "5v5征召0ban位": [20910, 1, 10],
    "5v5征召1ban位": [20911, 1, 10],
    "5v5征召2ban位": [20912, 1, 10],
    "5v5征召3ban位": [20913, 1, 10],
    "5v5征召4ban位": [20111, 1, 10],
    "5v5随机征召": [20414, 1, 10],
    "快速赛": [1010, 1, 10],
    
    // 3v3 模式
    "3v3": [20002, 1, 6],
    
    // 2v2 模式
    "2v2": [20014, 1, 4],
    
    // 1v1 模式
    "1v1": [20011, 1, 2],
    "1v1对抗路": [25001, 1, 2],
    "1v1中路": [25002, 1, 2],
    "1v1发育路": [25003, 1, 2],
    
    // 10v10
    "10v10": [99988, 1, 20],
    
    // 娱乐模式
    "无限乱斗": [20017, 4, 10],
    "契约之战": [20019, 4, 10],
    "变身大作战": [4010, 4, 10],
    "梦境大乱斗": [90001, 4, 10],
    "克隆大作战": [20012, 4, 10],
    "火焰山": [20009, 4, 10],
    
    // 特殊模式
    "觉醒之战": [5121, 4, 10],
    "多重施法": [5153, 4, 10],
    "双人同舞": [5155, 4, 10],
};

// ========== 网站允许开房的地图数据 ==========
// 格式: [地图ID, 模式类型, 队伍人数, 是否仅开房(不可自定义配置和禁用英雄)]
const webCreateableMapData = {
    // 训练营（仅开房，不可自定义配置和禁用英雄）
    "多人训练营": [20047, 1, 4, true],
    
    // 5v5 模式（可自定义配置）
    "5v5": [20011, 1, 10, false],
    "5v5征召0ban位": [20910, 1, 10, false],
    "5v5征召1ban位": [20911, 1, 10, false],
    "5v5征召2ban位": [20912, 1, 10, false],
    "5v5征召3ban位": [20913, 1, 10, false],
    "5v5征召4ban位": [20111, 1, 10, false],
    "5v5随机征召": [20414, 1, 10, false],
    
    // 3v3 模式（可自定义配置）
    "3v3": [20002, 1, 6, false],
    
    // 2v2 模式（可自定义配置）
    "2v2": [20014, 1, 4, false],
    
    // 1v1 模式（可自定义配置）
    "1v1": [20011, 1, 2, false],
};

/**
 * 获取所有地图数据（仅展示）
 */
export function getAllMapData() {
    return allMapData;
}

/**
 * 获取所有地图名称
 */
export function getAllMapNames() {
    return Object.keys(allMapData);
}

/**
 * 获取网站允许开房的地图数据
 */
export function getWebCreateableMapData() {
    return webCreateableMapData;
}

/**
 * 获取网站允许开房的地图名称列表
 */
export function getWebCreateableMapNames() {
    return Object.keys(webCreateableMapData);
}

/**
 * 获取网站可自定义配置的地图数据（排除仅开房）
 */
export function getWebConfigurableMapData() {
    const configurableData = {};
    
    for (const [name, info] of Object.entries(webCreateableMapData)) {
        if (!info[3]) {
            configurableData[name] = [info[0], info[1], info[2]];
        }
    }
    
    return configurableData;
}

/**
 * 获取网站可自定义配置的地图名称列表（排除仅开房）
 */
export function getWebConfigurableMapNames() {
    return Object.keys(getWebConfigurableMapData());
}

/**
 * 获取地图信息（从全部数据中查找）
 */
export function getMapInfo(mapName) {
    const info = allMapData[mapName];
    return info ? { id: info[0], type: info[1], teamerNum: info[2] } : null;
}

/**
 * 获取可开房地图信息
 */
export function getWebCreateableMapInfo(mapName) {
    const info = webCreateableMapData[mapName];
    return info ? { 
        id: info[0], 
        type: info[1], 
        teamerNum: info[2], 
        isRoomOnly: info[3]  // 是否仅开房（不可自定义配置和禁用英雄）
    } : null;
}

/**
 * 根据ID获取地图名称（从全部数据中查找）
 */
export function getMapNameById(mapId) {
    for (const [name, info] of Object.entries(allMapData)) {
        if (info[0] === mapId) return name;
    }
    return null;
}

/**
 * 判断当前模式是否可在网站开房
 */
export function isWebCreateableMode(mapName) {
    return mapName in webCreateableMapData;
}

// ========== 索引映射（用于快速查找） ==========
const webCreateableMapIdMap = Object.entries(webCreateableMapData).reduce((map, [name, info]) => {
    map[info[0]] = { name, info };
    return map;
}, {});

/**
 * 根据地图ID判断是否可在网站开房
 */
export function isWebCreateableMapById(mapId) {
    return mapId in webCreateableMapIdMap;
}

/**
 * 根据地图ID获取可开房地图完整信息
 */
export function getWebCreateableMapInfoById(mapId) {
    const item = webCreateableMapIdMap[mapId];
    if (!item) return null;
    
    const info = item.info;
    return {
        name: item.name,
        id: info[0],
        type: info[1],
        teamerNum: info[2],
        isRoomOnly: info[3] || false,
        isConfigurable: !info[3]
    };
}

/**
 * 根据地图ID判断是否可自定义配置（非仅开房模式）
 */
export function isConfigurableMapById(mapId) {
    const item = webCreateableMapIdMap[mapId];
    return item ? !item.info[3] : false;
}

/**
 * 根据地图ID判断是否为仅开房模式（不可自定义配置和禁用英雄）
 */
export function isRoomOnlyMapById(mapId) {
    const item = webCreateableMapIdMap[mapId];
    return item ? item.info[3] === true : false;
}

/**
 * 判断当前模式是否可自定义配置（非仅开房模式）
 */
export function isConfigurableMode(mapName) {
    const info = webCreateableMapData[mapName];
    return info ? !info[3] : false;
}

/**
 * 判断当前模式是否为仅开房模式（不可自定义配置和禁用英雄）
 */
export function isRoomOnlyMode(mapName) {
    const info = webCreateableMapData[mapName];
    return info ? info[3] === true : false;
}

/**
 * 检查是否为征召模式
 */
export function isZhengzhaoMode(mapName) {
    return mapName.includes('征召');
}

/**
 * 获取地图提示
 */
export function getMapTip(mapName) {
    if (isRoomOnlyMode(mapName)) {
        return '该模式仅支持开房，不可自定义配置和禁用英雄';
    }
    if (isZhengzhaoMode(mapName)) {
        return '征召模式不可以添加人机哦';
    }
    return null;
}