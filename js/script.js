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



// 
function scrollToFirstWork() {
    const worksList = document.querySelector('.works-list');
    const firstWork = document.querySelector('.first-work'); // HTMLでクラスをつけておいてください

    if (worksList && firstWork) {
        // centerにスナップさせるための計算
        const offset = firstWork.offsetLeft - (worksList.clientWidth / 2) + (firstWork.clientWidth / 2);
        worksList.scrollLeft = offset;
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
共通　追尾カーソル
**************************************************/

const cursor = document.querySelector('#cursor');

// マウス座標をCSS変数 (--x, --y) に更新し続けるだけ
document.addEventListener('mousemove', (e) => {
    cursor.style.setProperty('--x', `${e.clientX}px`);
    cursor.style.setProperty('--y', `${e.clientY}px`);
});

// クラスの付け外しだけ（見た目の指定は一切なし）
const hoverElements = document.querySelectorAll('a, .menu, .work-item');
hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
});



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
                left: e.deltaY * 3, // 動きが遅ければ数字を大きくしてください
                behavior: 'auto'
            });
        }
    }, { passive: false });
}



/**************************************************
トップページ　スクロールに合わせてテキストを切り替える
**************************************************/

const scrollText = document.querySelector('.works-list');
const typeLabel = document.querySelector('.work-type-label');
const workTitle = document.querySelector('.work-title');
const workDesc = document.querySelector('.work-description');
const workTitleArea = document.querySelector('.work-title-area');

if (scrollText && workTitleArea) {
    const observerOptions = {
        root: scrollList,
        rootMargin: '0px',
        threshold: 0.6 // 60%以上表示されたら切り替え
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // --- 中央に来た時の処理 ---
                entry.target.classList.add('is-active'); // クラス付与（拡大）

                const link = entry.target.querySelector('a');
                workTitleArea.classList.remove('is-change');
                void workTitleArea.offsetWidth; 
                workTitleArea.classList.add('is-change');

                setTimeout(() => {
                    $('#loading').addClass('loading-complete');
                    $('body').addClass('content-ready');
                    scrollToFirstWork(); 
                    typeLabel.textContent = link.getAttribute('data-type');
                    workTitle.textContent = link.getAttribute('data-title');
                    workDesc.textContent = link.getAttribute('data-desc');
                }, 300); 
            } else {
                // --- 中央から外れた時の処理 ---
                entry.target.classList.remove('is-active'); // クラス除去（縮小）
            }
        });
    }, observerOptions);

    

    // 全ての作品アイテムを監視対象にする
    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => {
        observer.observe(item);
    });
}
