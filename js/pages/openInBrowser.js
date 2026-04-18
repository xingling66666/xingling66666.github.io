// app/openInBrowser.js - 引导在浏览器中打开页面
import { copyText } from '../services/clipboard.js';
import { registerSW } from '../services/sw-manager.js';

registerSW('./sw.js');

document.getElementById('copyBtn').addEventListener('click', async function () {
    const url = window.top.location.href;
    copyText(url)
});