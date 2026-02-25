'use strict';

/**************************************************
   [機能] 各セクションのタブ切り替え
**************************************************/
// 各セクション（DESIGN, CODING, ENVIRONMENT）を取得
const sections = document.querySelectorAll('.js-section');

sections.forEach(section => {
    // セクション内の「ボタン」と「詳細コンテンツ」を取得
    const tabBtns = section.querySelectorAll('.js-skill-tab-item');
    const contents = section.querySelectorAll('.js-skill-detail-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // すでに active の場合は何もしない
            if (btn.classList.contains('active')) return;

            // 同じグループ内のボタンから active を外して、クリックしたものに付ける
            tabBtns.forEach(el => el.classList.remove('active'));
            btn.classList.add('active');

            // 一旦すべての詳細コンテンツを非表示にする
            contents.forEach(content => content.classList.remove('active'));

            // ボタンの data-skill と同じ ID を持つ詳細コンテンツを表示する
            const targetId = btn.getAttribute('data-skill');
            const targetContent = section.querySelector(`#${targetId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});



/**************************************************
   [機能] スキルレベル(★)の自動生成
**************************************************/
const renderStars = () => {
    const skillTitles = document.querySelectorAll('.js-skill-detail-title');

    skillTitles.forEach(title => {
        // data-starの値を取得（数値に変換）
        const starCount = parseInt(title.getAttribute('data-star'), 10);
        const maxStars = 5; // 最大星数
        
        // 星を入れるためのコンテナを作成
        const starWrapper = document.createElement('span');
        starWrapper.classList.add('star-container');

        // 星マークを生成して流し込む
        for (let i = 1; i <= maxStars; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            star.textContent = '★'; // 星マーク
            
            // 現在のループ回数が starCount 以下なら「塗りつぶし」クラスをつける
            if (i <= starCount) {
                star.classList.add('filled');
            }
            starWrapper.appendChild(star);
        }

        // タイトルの後ろに追加
        title.appendChild(starWrapper);
    });
};

// 実行
renderStars();
