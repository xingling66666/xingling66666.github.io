// utils/random.js

/**
 * Fisher-Yates 洗牌算法
 */
export function shuffleArray(array) {
    const arr = [...array];
    
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr;
}

/**
 * 从数组中随机获取指定数量元素
 */
export function getRandomElements(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
}

/**
 * 从数组中随机获取一个元素
 */
export function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

/**
 * 生成随机ID
 */
export function generateRandomId() {
    return Math.round(Math.random() * 1000000000000000000);
}

/**
 * 生成随机配置名
 */
export function generateConfigName() {
    return "未命名" + Math.round(Math.random() * 100000000);
}
/**
 * 打乱指定位置的元素
 * @param {Array} values - 值数组
 * @param {Array<number>} positions - 位置索引数组（默认为 0-based）
 * @returns {Array} 打乱后的值数组
 */
export function shufflePositions(values, positions) {
    const arr = [...values];
    const len = positions.length;
    
    for (let i = 0; i < len; i++) {
        const currentIdx = positions[i];
        
        // 在 positions 数组中随机选一个位置
        const randomPos = Math.floor(Math.random() * len);
        const randomIdx = positions[randomPos];
        
        // 交换元素
        [arr[currentIdx], arr[randomIdx]] = [arr[randomIdx], arr[currentIdx]];
    }
    
    return arr;
}

/**
 * 生成指定范围内的随机整数
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成随机布尔值
 */
export function getRandomBoolean() {
    return Math.random() < 0.5;
}

/**
 * 从数组中随机选择多个索引
 */
export function getRandomIndexes(array, count) {
    const indexes = Array.from({ length: array.length }, (_, i) => i);
    return getRandomElements(indexes, count);
}