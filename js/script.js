'use strict';

/**************************************************
関数定義
**************************************************/

// ローディング画面　タイプライター風アニメーション
// $spanList - <span>要素のjQueryリスト
// text - アニメーションさせる元のテキスト
function typeWriter($spanList, text) {
    $('#loading-text').addClass('show-text');
    const textLength = text.length;
    for(let i = 0; i < textLength; i++){
        setTimeout(() => {
            $spanList.eq(i).addClass('animate-text');
        }, 100 * i);
    }
}



/**************************************************
ローディング画面（タイプライター風）
**************************************************/

if (sessionStorage.getItem('has-loaded') !== 'true') {
    
    // --- 初回ロード時のアニメーション実行 ---

    // 変数の定義とDOMの準備
    const $loadingEl = $('#loading-text');
    const textToAnimate = $loadingEl.text().trim();

    $loadingEl.empty();

    let spansHtml = '';
    for (let i = 0; i < textToAnimate.length; i++){
        let char = textToAnimate.substring(i, i + 1);
        if (char === ' '){
            char = '&nbsp;';
        }
        spansHtml += `<span>${char}</span>`; 
    }

    $loadingEl.append(spansHtml);
    const $spanEls = $loadingEl.find('span'); 

    // アニメーションの実行
    typeWriter($spanEls, textToAnimate);

    const totalDuration = textToAnimate.length * 100 + 1000;

    setTimeout(() => {
        sessionStorage.setItem('has-loaded', 'true');
      
        $('#loading').addClass('loading-hidden');
        
        // CSSのtransition時間(0.5s)+アルファの待ち時間(0.01s)
        setTimeout(() => {
            $('#loading').addClass('loading-complete');

            // ローディングアニメーション完了後にトップページのcssアニメを開始させるためのトリガー
            $('body').addClass('content-ready');

            // トップページのスライドアニメーションを開始
            initializeSlider();
        }, 510);

    }, totalDuration);
    
} else {
    // --- 2回目以降のスキップ時処理 ---

    // スキップ時は「即座に非表示にするCSSクラス」を適用
    $('#loading').addClass('loading-hidden loading-complete');

    // スキップ時にもトップページのcssアニメを開始させるためのトリガー
    $('body').addClass('content-ready');
}



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
