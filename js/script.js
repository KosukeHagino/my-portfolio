'use strict';



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
 * [トップページ] 最初の作品へ自動スクロールする
 */
const scrollToFirstWork = () => {
    const worksList = document.querySelector('.works-list');
    const firstWork = document.querySelector('.first-work');

    if (worksList && firstWork) {

        // 作品が画面中央に来るための位置を計算
        const offset = firstWork.offsetLeft - (worksList.clientWidth / 2) + (firstWork.clientWidth / 2);
        
        // 2秒後に実行（ページ読み込み後の落ち着きを待つ）
        setTimeout(() => {
            worksList.scrollLeft = offset;
        }, 2000);
    }
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
 * [トップページ] 制作物スライドのホイール変換と情報更新
 */
const initWorksScrollObserver = () => {
    const scrollList = document.querySelector('.works-list');
    const workTitleArea = document.querySelector('.work-title-area');
    if (!scrollList || !workTitleArea) return;

    // 1. マウスホイールを横スクロールに変換
    scrollList.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        if (e.deltaY !== 0) {
            e.preventDefault();
            scrollList.scrollBy({ left: e.deltaY * 2.5, behavior: 'auto' });
        }
    }, { passive: false });

    // 2. IntersectionObserverで中央にある作品を検知
    const typeLabel = document.querySelector('.work-type-label');
    const workTitle = document.querySelector('.work-title');
    const workDesc = document.querySelector('.work-description');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
                const link = entry.target.querySelector('a');
                if (link) {
                    workTitleArea.style.opacity = "1";

                    // アニメーションのリセットと再実行
                    workTitleArea.classList.remove('is-change');
                    void workTitleArea.offsetWidth;
                    workTitleArea.classList.add('is-change');

                    // 300ms後（フェードの途中）にテキスト書き換え
                    setTimeout(() => {
                        typeLabel.textContent = link.getAttribute('data-type');
                        workTitle.textContent = link.getAttribute('data-title');
                        workDesc.textContent = link.getAttribute('data-desc');
                    }, 300);
                } else {
                    workTitleArea.style.opacity = "0"; // リンク無し要素の場合は非表示
                }
            } else {
                entry.target.classList.remove('is-active');
            }
        });
    }, { root: scrollList, threshold: 0.6 });

    document.querySelectorAll('.work-item').forEach(item => observer.observe(item));
};



/**************************************************
  実行エリア
**************************************************/

// [共通] 追尾カーソルとハンバーガーメニューの有効化
initCustomCursor();
initHamburgerMenu();



// [トップページ] ローディング画面の判定と実行
const numEl = document.getElementById('loading-num');
if (numEl) {
    if (document.documentElement.classList.contains('is-first-visit')) {

        // 初回訪問：1秒待ってからカウントアップ開始
        setTimeout(() => updateCount(numEl, 0), 1000);

    } else {

        // 2回目以降：即座にメイン表示準備
        document.body.classList.add('content-ready');
        window.addEventListener('load', scrollToFirstWork);
    }
}



// [トップページ] 制作物リストの演出を有効化
initWorksScrollObserver();
