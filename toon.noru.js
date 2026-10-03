// ==UserScript==
// @name         toon
// @namespace    noru
// @version      1.4
// @match        https://spotv148.com*
// @description  toon광고삭제, 링크누락 해결
// @run-at       document-end
// @grant        none
// @updateURL	 https://raw.githubusercontent.com/norule3872-arch/script/refs/heads/main/litomead.noru.js
// ==/UserScript==


(function() {
    'use strict';
    
    // ==========================================
    // [추가 기능] 기존 애드가드 사용자 규칙 통합 관리 칸
    // ==========================================
    
    // ----------------------------------------
    // 2. 동적으로 추가될 수 있는 광고
    // ----------------------------------------
    function hideListAds() {
        let count = 0;

        // [핵심 조준] 장르 리스트(#free-genre-list) 하위의 모든 li 태그를 다 가져옵니다.
        const allGenreItems = document.querySelectorAll('#free-genre-list > li');

        allGenreItems.forEach(function (li) {
            // 차단 조건 A: 만약 li 태그에 data-id 속성이 없다면? (광고일 확률 99%)
            // 차단 조건 B: 혹시 몰라 한 번 더 검사! 내부 링크(a)가 외부 사이트(http) 주소라면?
            
            const hasDataId = li.hasAttribute('data-id');
            const link = li.querySelector('a');
            const href = link ? link.getAttribute('href') : '';
            const isExternalLink = href.startsWith('http://') || href.startsWith('https://');

            // 고유 ID가 없고, 외부 링크를 품고 있는 '진짜 광고 li 상자'만 선별합니다.
            if (!hasDataId && isExternalLink) {
                
                // 광고가 숨겨진 자리에 빈 칸이 생기지 않도록 li 상자 전체를 통째로 숨깁니다.
                li.style.setProperty('display', 'none', 'important');
                
                // (선택 사항) 만약 구조 자체를 완전히 파괴해서 없애고 싶다면 아래 remove 주석을 푸세요.
                // li.remove();
                
                count++;
            }
        });

        if (count > 0) {
            console.log('[SPOTV SCRIPT] 장르 리스트 내부 외부 광고 완벽 박멸:', count);
        }
    }

    const dynamicSelectors = [
        'div.viewer-list.scroll-control.idle',
        '#adssmall3',
        'div.ad400_100'
    ];

    function hideDynamicAds() {
        hideListAds();
        let count = 0;

        dynamicSelectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (element) {
                element.style.setProperty('display', 'none', 'important');
                count++;
            });
        });

        if (count > 0) {
            console.log('[SPOTV SCRIPT] 동적 광고:', count);
        }
    }

    // ----------------------------------------
    // 최초 실행
    // ----------------------------------------

    hideDynamicAds();


    // ----------------------------------------
    // 동적 광고만 감시
    // ----------------------------------------

    const observer = new MutationObserver(function () {
        hideDynamicAds();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    // ==========================================

    // 여기에 우리가 원하는 마법(기능)을 적습니다!
    //console.log("애드가드 스크립트 실행됨!");
    
    // [2단계 핵심] 잠겨있는 다음화 버튼을 찾아서 'nextBtn'이라는 임시 이름표를 붙여줍니다.
    const nextBtn = document.querySelector('button.right-episode.next[disabled]');

    // [3단계 핵심] 컴퓨터가 버튼을 찾았을 때만 안쪽 코드를 실행하라는 안전장치입니다.
    if (nextBtn) {
        
        // (기존 코드) 버튼 기본 세팅
        nextBtn.removeAttribute('disabled');
        nextBtn.style.setProperty('background-color', '#2196F3', 'important'); // 진행 중 표시 (하늘색)
        nextBtn.style.setProperty('color', '#ffffff', 'important');
        nextBtn.innerText = "다음화 주소 찾는 중...";

        // [4단계 핵심 1] 현재 주소창에서 정보 추출 (예: bo_table=toons, wr_id=1822762)
        const urlParams = new URLSearchParams(window.location.search);
        const boTable = urlParams.get('bo_table');
        const isVal = urlParams.get('is');
        const currentId = parseInt(urlParams.get('wr_id'), 10); // 숫자로 변환

        
        //console.log("boTable : ",boTable);
        //console.log("currentId : ",currentId);
        //console.log("is : ",isVal);
        
        // [4단계 핵심 2] 해당 웹툰의 목록 페이지 주소 만들기
        const listUrl = `${window.location.origin}${window.location.pathname}?bo_table=${boTable}&is=${isVal}`;
		//console.log("listURL : ",listUrl);
        
        
        
        // [4단계 핵심 3] 백그라운드에서 목록 페이지 몰래 읽어오기
        fetch(listUrl)
            .then(response => response.text()) // 가져온 페이지를 텍스트(HTML)로 변환
            .then(htmlText => {
                // 컴퓨터가 HTML 글자들을 분석할 수 있도록 가상 문서로 파싱
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                
                // 목록 화면에 있는 모든 글 링크(href)에서 wr_id 번호들만 싹 수집하기
                const episodeButtons = Array.from(doc.querySelectorAll('#comic-episode-list li button.episode'));
            	//console.log("링크0번 : ",episodeButtons[0]);
            
            	
                let wrIds = [];
                
                episodeButtons.forEach(btn => {
                    // [수정 2] href 대신 onclick 속성의 텍스트 글자들을 가져옵니다.
                    // 예: "location.href='./board.php?bo_table=toons&wr_id=1829919...'"
                    const onClickText = btn.getAttribute('onclick');
                    //console.log(onClickText);
                    if (onClickText) {
                        // [수정 3] 정규표현식으로 onclick 글자 중 'wr_id=숫자' 부분만 매칭하여 추출합니다.
                        const match = onClickText.match(/wr_id=(\d+)/);
                        //console.log(match);
                        if (match) {
                            wrIds.push(parseInt(match[1], 10)); // 뽑아낸 숫자를 배열에 저장
                        }
                    }
                });

                // for(let i=0;i<wrIds.length;i++){
                //     console.log(wrIds[i]);
                // }
				
                // 중복 번호 제거 및 작은 숫자부터 오름차순 정렬 (1화 -> 2화 -> 3화...)
                wrIds = [...new Set(wrIds)].sort((a, b) => a - b);

                // 현재 내가 보고 있는 번호(currentId)보다 바로 다음 순서의 큰 번호 찾기
                const nextId = wrIds.find(id => id > currentId);

                if (nextId) {
                    // 진짜 다음화 번호를 찾았다면 버튼 활성화 및 진짜 링크 주입!
                    nextBtn.style.setProperty('background-color', '#007bff', 'important');
                    nextBtn.innerText = "다음화 (자동 복구됨)";
                    
                    nextBtn.onclick = function() {
                        urlParams.set('wr_id', nextId);
                        window.location.search = urlParams.toString();
                    };
                    //console.log("다음화 찾기 성공! ID:", nextId);
                } else {
                    nextBtn.style.setProperty('background-color', '#6c757d', 'important');
                    nextBtn.innerText = "다음화 없음 (최신화)";
                }
            })
            .catch(err => {
                //console.error("목록을 불러오는 중 에러 발생:", err);
                nextBtn.innerText = "다음화 (주소 불러오기 실패)";
            });
    }
    
})();
