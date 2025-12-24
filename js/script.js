'use strict';

/**************************************************
共通　ハンバーガーメニュー
**************************************************/

// クラスをトグルするターゲット要素を取得
const menuBtn = document.querySelector('#menu');
const globalNav = document.querySelector('#global-nav');
const mask = document.querySelector('#mask');

// クリックのトリガーとなる全ての要素を取得
const triggers = document.querySelectorAll('#menu, #global-nav-item a, #mask');

// 共通の処理を関数として定義
const toggleMenu = () => {

    // 3つのターゲット要素のクラスを同時にトグル
    menuBtn.classList.toggle('show');
    globalNav.classList.toggle('show');
    mask.classList.toggle('show');  
}

// 全てのトリガー要素をループ処理
triggers.forEach(trigger => {
    trigger.addEventListener('click', toggleMenu)
})



/**************************************************
トップページ　制作物の画像を横スクロール
**************************************************/

const scrollList = document.querySelector('.works-list');

if (scrollList) {
    scrollList.addEventListener('wheel', (e) => {
        // Ctrlキー（拡大縮小）のときは何もしない
        if (e.ctrlKey) return;

        // 縦の回転（deltaY）がある場合
        if (e.deltaY !== 0) {
            e.preventDefault();
            
            // scrollLeftを直接書き換えるのではなく、scrollBy を使う
            // behaviorを'smooth'にすると、CSSのsnapと喧嘩せずに「スライド」します
            scrollList.scrollBy({
                left: e.deltaY * 2, // 動きが遅ければ数字を大きくしてください
                behavior: 'auto'
            });
        }
    }, { passive: false });
}



/**************************************************
トップページ　スクロールで表示された制作物の画像に合わせてテキスト変更
**************************************************/

// 書き換えたいターゲット要素を取得
const typeLabel = document.querySelector('.work-type-label');
const workTitle = document.querySelector('.work-title');
const workDesc = document.querySelector('.work-description');

// リスト内のすべてのリンクを取得
const workLinks = document.querySelectorAll('.work-item a');

// 各リンクに「マウスが乗ったとき」の処理を設定
workLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        // aタグに書いた data- 属性の中身を取得
        const newType = link.getAttribute('data-type');
        const newTitle = link.getAttribute('data-title');
        const newDesc = link.getAttribute('data-desc');

        // 上のエリアのテキストを書き換える
        typeLabel.textContent = newType;
        workTitle.textContent = newTitle;
        workDesc.textContent = newDesc;
    });
});
