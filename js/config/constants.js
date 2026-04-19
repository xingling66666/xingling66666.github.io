// constants.js - 常量定义

export const TIPS = {
    NO_CONFIG: "没有配置，请先点击管理配置新建配置",
    NO_CONFIG_SHORT: "没有配置，请先新建配置",
    IMPORT_SUCCESS: "导入成功",
    RENAME_PROMPT: "请输入想要修改的配置名",
    MUST_SELECT: "你必须要选择一个配置",
    FREE_TIP: "本网页完全免费且开源，如果你是购买得到的，你可能被骗了。本网页已停止维护，建议点击更多链接按钮浏览其他自定义网页或使用王者赛宝官方网页创建房间。",
    CREATE_TIP: "建议点击网页内「使用教程」按钮来查看文字教程\n💡 提示：长按「复制链接」按钮可设置复制规则"
};

export const MAP_TIPS = {
    NOT_OPEN: "当前地图模式暂时未开启，请重新选择",
    WEEKEND_ONLY: "当前地图模式只在星期五到星期天开放，请重新选择",
    ZSF_ONLY: "当前地图模式暂时只在正式服开启，请重新选择",
    TYF_ONLY: "当前地图模式暂时只在体验服开启，请重新选择"
};

export const GAME_SERVERS = {
    ZSF: 'zsf',
    TYF: 'tyf'
};

export const STORAGE_KEYS = {
    // 游戏基础设置
    GAME_SERVER: 'wzzdy_gameserver',      // 游戏服务器
    MAP_MODE: 'wzzdy_mapmode',        // 地图模式
    // 当前选中的配置
    CURRENT_BAN_CONFIG_NAME: 'wzzdy_current_ban_config_name',  // 当前选中的禁用英雄配置名称
    CURRENT_CUSTOM_CONFIG_NAME: 'wzzdy_current_custom_config_name', // 当前选中的自定义配置名称
    // 配置数据
    BAN_CONFIGS: 'wzzdy_ban_configs',     // 所有禁用英雄集合   
    CUSTOM_CONFIGS: 'wzzdy_custom_configs', // 自定义配置集合
    // UI/用户偏好
    THEME_COLOR: 'wzzdy_theme_color',
    COPY_RULE: 'wzzdy_copy_rule',
    FREE_TIP: 'wzzdy_free_tip',
    CREATE_TIP: 'wzzdy_create_tip',
    CUSTOM_SET_TIP: 'wzzdy_custom_set_tip',
    // 数据缓存
    ALL_HEROS: 'wzzdy_all_heros',
};

export const GAMEDATA_PREFIX = '?gamedata=SmobaLaunch_';
export const URL_SCHEMES = {
    [GAME_SERVERS.ZSF]: "tencentmsdk1104466820://",
    [GAME_SERVERS.TYF]: "tencentmsdk1104791911://"
};

// 英雄属性配置选项
export const HERO_LEVELS = ["1级", "4级", "5级", "8级", "10级", "12级", "15级"];
export const MAGIC_ATTACK_BONUS = ["无加成", "加10%", "加25%", "加50%", "加75%", "加100%"];
export const PHYSICAL_ATTACK_BONUS = ["无加成", "加10%", "加25%", "加50%", "加75%", "加100%"];
export const COOLDOWN_REDUCTION = ["无加成", "减25%", "减40%", "减80%", "减99%"];
export const INIT_GOLD = ["无加成", "1000", "2000", "5000", "12000"];
export const MOVE_SPEED = ["无加成", "加10%", "加20%", "加30%"];

export const lastCustomVersion = 1;
export const lastBanHerosVersion = 1;