'use strict';



/**************************************************
   [機能] 制作物スライドの監視と連動
**************************************************/
// 各セクションを取得
const sections = document.querySelectorAll('.process-section, .achievement-section');

sections.forEach(section => {
    // セクション内のアイテムだけを取得
    const Items = section.querySelectorAll('.process-item');

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
