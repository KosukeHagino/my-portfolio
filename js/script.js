'use strict';



/**************************************************
   変数・定数エリア
**************************************************/

/* タイマーを管理する変数 */
let autoScrollTimer; // 自動スライドの予約を覚えておくための変数



/**************************************************
   関数定義エリア
**************************************************/

/**
 * [ローディング] 数字を1〜100までカウントアップする
 * @param {HTMLElement} el - 数字を書き換える対象の要素
 * @param {number} current - 現在の数値
 */
const updateCount = (el, current) => {

    // 1〜5のランダムな数値を加算して「読み込み感」を演出
    let nextCount = current + (Math.floor(Math.random() * 5) + 1);

    if (nextCount >= 100) {
        nextCount = 100;
        el.textContent = nextCount;

        // 100%に達してから1秒の「余韻」を置いて終了処理へ
        setTimeout(endLoading, 1000);

    } else {
        el.textContent = nextCount;

        // 40ミリ秒ごとに再帰的に呼び出して滑らかに動かす
        setTimeout(() => updateCount(el, nextCount), 40);
    }
};



/**
 * [ローディング] 画面をフェードアウトさせて終了する
 */
const endLoading = () => {

    // 次回訪問時にスキップするためのフラグを保存
    sessionStorage.setItem('has-loaded', 'true');
    
    // htmlタグからクラスを削除。CSS側で0.8秒のフェードアウトが開始される
    document.documentElement.classList.remove('is-first-visit');

    // 画面が完全に消えるタイミング（0.8s + 余裕0.1s）で後続処理を実行
    setTimeout(() => {
        document.body.classList.add('content-ready');
        scrollToFirstWork();
    }, 900);
};



/**
 * [共通] 追尾カーソルの動きを制御する
 */
const initCustomCursor = () => {
    const cursor = document.querySelector('#cursor');
    if (!cursor) return;

    // マウス移動に追従
    document.addEventListener('mousemove', (e) => {
        cursor.style.setProperty('--x', `${e.clientX}px`);
        cursor.style.setProperty('--y', `${e.clientY}px`);
    });

    // 特定の要素に乗った時にカーソルを大きくする
    const hoverElements = document.querySelectorAll('a, #menu, .work-item');
    hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
    });
};



/**
 * [共通] ハンバーガーメニューの開閉を制御する
 */
const initHamburgerMenu = () => {
    const menuBtn = document.querySelector('#menu');
    const globalNav = document.querySelector('#global-nav');
    const mask = document.querySelector('#mask');

    if (!menuBtn || !globalNav || !mask) return;

    const triggers = document.querySelectorAll('#menu, .global-nav-item a, #mask');
    const toggleMenu = () => {
        menuBtn.classList.toggle('show');
        globalNav.classList.toggle('show');
        mask.classList.toggle('show');
    };

    triggers.forEach(trigger => trigger.addEventListener('click', toggleMenu));
};



/**
 * [トップページ] 最初の作品へ自動スクロールする
 */
const scrollToFirstWork = () => {
    const worksList = document.querySelector('.works-list');
    const firstWork = document.querySelector('.first-work');

    if (worksList && firstWork) {

        // works-listの左端からみた「最初の作品」の距離を取得
        const elementLeft = firstWork.offsetLeft;

        // 最初の作品自体の幅の半分
        const elementHalfWidth = firstWork.clientWidth / 2;

        // 表示領域（画面）の幅の半分
        const containerHalfWidth = worksList.clientWidth / 2;

        // 【中央に持ってくるための計算】
        // 作品の左端の位置に、作品の幅の半分を足して「作品の中心」を出し、
        // そこから画面の幅の半分を引くことで、画面の中央に作品の中心が重なる
        const offset = elementLeft + elementHalfWidth - containerHalfWidth;
        
        // タイマーを変数に格納し、手動操作を監視する ---
        autoScrollTimer = setTimeout(() => {
            worksList.scrollTo({
                left: offset,
                behavior: 'smooth'
            });
        }, 2000);       // 2秒後に実行

        // ユーザーが自らホイール操作をした瞬間、自動スライドを中止する
        const cancelAutoScroll = () => {
            clearTimeout(autoScrollTimer);

            // 一度キャンセルしたら監視も不要なので削除
            worksList.removeEventListener('wheel', cancelAutoScroll);
            worksList.removeEventListener('touchstart', cancelAutoScroll);
        };

        worksList.addEventListener('wheel', cancelAutoScroll);
        worksList.addEventListener('touchstart', cancelAutoScroll); // スマホ用
    }
};



/**
 * [トップページ] 制作物スライドのホイール変換とテキストリストの同期
 */
const initWorksScrollObserver = () => {
    const scrollList = document.querySelector('.works-list');
    const textList = document.querySelector('.work-text-list');
    const workItems = document.querySelectorAll('.work-item');
    const textItems = document.querySelectorAll('.work-text-item');

    if (!scrollList || !textList) return;

    const itemHeight = 40; // 1行の高さ

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 【変更】少しでも「判定エリア」に入ったら即座に実行
            if (entry.isIntersecting) {
                
                const index = Array.from(workItems).indexOf(entry.target);
                
                if (index !== -1) {
                    // 全体のクラスを一旦リセット（重複防止）
                    workItems.forEach(item => item.classList.remove('is-active'));
                    textItems.forEach(item => item.classList.remove('is-active'));

                    // 現在の要素をアクティブにする
                    entry.target.classList.add('is-active');

                    if (textItems[index]) {
                        // テキストをスライド
                        textList.style.transform = `translateY(-${index * itemHeight}px)`;
                        textItems[index].classList.add('is-active');
                    }
                }
            }
        });
    }, { 
        root: scrollList,
        // 【重要】0.1（10%）でも入れば検知。これで検知漏れを防ぎます
        threshold: 0.1,
        // 【重要】画面の左右45%を「無効」にし、中央の10%幅だけで判定する
        // これにより、中央を通る瞬間を確実に、かつ1つずつ捕まえます
        rootMargin: "0px -45% 0px -45%" 
    });

    workItems.forEach(item => observer.observe(item));

    // ホイール変換
    scrollList.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        if (e.deltaY !== 0) {
            e.preventDefault();
            scrollList.scrollBy({ left: e.deltaY * 2.5, behavior: 'auto' });
        }
    }, { passive: false });
};



/**************************************************
  実行エリア
**************************************************/

window.addEventListener('load', () => {
    // ページ読み込み完了時にスクロール位置を強制的に左端(0)に戻す
    const scrollList = document.querySelector('.works-list');
    if (scrollList) {
        scrollList.scrollLeft = 0;
    }

    // [共通] 追尾カーソルの有効化
    initCustomCursor();

    // [共通] ハンバーガーメニューの有効化
    initHamburgerMenu();

    // [トップページ] 制作物リストの演出を有効化
    initWorksScrollObserver();

    // [トップページ] ローディング画面の判定と実行
    const numEl = document.getElementById('loading-num');
    if (numEl) {
        if (document.documentElement.classList.contains('is-first-visit')) {
            
            // 初回訪問：1秒待ってカウントアップ開始
            setTimeout(() => updateCount(numEl, 0), 1000);

        } else {
            
            // 2回目以降：即座に表示して自動スライド
            document.body.classList.add('content-ready');
            scrollToFirstWork();
        }
    }
});
