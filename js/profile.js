'use strict';

/**************************************************
   初期化処理
**************************************************/
// 初期化処理
const initProcess = () => {
    initProcessTabs();      // プロセス項目の切り替え機能を有効化
};


// ページ読み込み完了時に実行
window.addEventListener('load', initProcess);



/**************************************************
   [機能] プロセス項目の切り替え
**************************************************/
const initProcessTabs = () => {
    // 各セクションを取得
    const sections = document.querySelectorAll('.js-section');

    sections.forEach(section => {
        // セクション内のアイテムだけを取得
        const Items = section.querySelectorAll('.js-process-item');

        Items.forEach(item => {
            item.addEventListener('click', () => {
                // すでにactiveのものをクリックしたときは何もしない
                if (item.classList.contains('active')) return;

                // このセッション内のアイテムだけからactiveを消す
                Items.forEach(el => el.classList.remove('active'));

                // クリックされたアイテムにactiveをつける
                item.classList.add('active');
            });
        });
    });
};
