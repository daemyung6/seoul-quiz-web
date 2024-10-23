window.addEventListener('DOMContentLoaded', () => {
    const rootDiv = document.querySelector('.root')

    function isMobileCheck() {
        if (
            (document.body.offsetHeight > document.body.offsetWidth)
        ) {
            document.body.classList.add('isMobile')
            return
        }

        document.body.classList.remove('isMobile')

    }
    window.addEventListener('resize', isMobileCheck)
    isMobileCheck()

    const config = {
        resultPageTimeNum: 1000 * 5,
        host: 'https://raw.githubusercontent.com/daemyung6/seoul-quiz-web/main',
        cacheQuery: '?ver=2',
        timerCountNum : 15,
    }


    const fileInfoList = []
    const files = {}
    window.f = files

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            fileInfoList.push({
                name: `${i + 1}-${j + 1}`,
                url: `${config.host}/imgs/${i + 1}-${j + 1}.jpg${config.cacheQuery}`,
                type: 'quiz-img'
            })
        }
    }

    fileInfoList.push({
        name: `correct`,
        url: `${config.host}/imgs/correct.jpg${config.cacheQuery}`,
        type: 'quiz-img'
    })
    fileInfoList.push({
        name: `gameover`,
        url: `${config.host}/imgs/gameover.jpg${config.cacheQuery}`,
        type: 'quiz-img'
    })
    fileInfoList.push({
        name: `start`,
        url: `${config.host}/imgs/start.jpg${config.cacheQuery}`,
        type: 'quiz-img'
    })

    fileInfoList.push({
        name: `clock`,
        url: `${config.host}/imgs/clock.png${config.cacheQuery}`,
        type: 'img'
    })


    fileInfoList.push({
        name: `click`,
        url: `${config.host}/sounds/click.wav${config.cacheQuery}`,
        type: 'sound'
    })
    fileInfoList.push({
        name: `correctSound`,
        url: `${config.host}/sounds/correct-answer.wav${config.cacheQuery}`,
        type: 'sound'
    })
    fileInfoList.push({
        name: `incorrectSound`,
        url: `${config.host}/sounds/incorrect.mp3${config.cacheQuery}`,
        type: 'sound'
    })
    fileInfoList.push({
        name: `success`,
        url: `${config.host}/sounds/success.wav${config.cacheQuery}`,
        type: 'sound'
    })

    // fileInfoList.push({
    //     name: `confetti.webm`,
    //     url: `${config.host}/videos/confetti.webm${config.cacheQuery}`,
    //     type: 'sound'
    // })
    console.log('fileNames', fileInfoList)

    const answerInfo = [
        2,
        4,
        1,
        3,
        3,
    ]




    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.add('active');
    const loadingStyle = document.createElement('style')
    const loadingStyleText = document.createTextNode('')
    loadingStyle.appendChild(loadingStyleText)
    function loadingStyleUpdate(per) {
        loadingStyleText.textContent = /*css*/`:root { --loadingPercent: ${per}%; }`;
    }
    loadingStyleUpdate(0)
    document.head.appendChild(loadingStyle)

    let nowLoading = 0
    let loadingNum = 0
    let loadedNum = 0
    const loadingMaxNum = 3
    function loadingFile() {
        if (loadingNum >= fileInfoList.length) {
            return
        }
        let obj
        if (fileInfoList[loadingNum].type === 'quiz-img') {
            obj = document.createElement('img')
            obj.classList.add('quiz-img')
        }
        if (fileInfoList[loadingNum].type === 'img') {
            obj = document.createElement('img')
        }
        if (fileInfoList[loadingNum].type === 'sound') {
            obj = document.createElement('video')
        }
        files[fileInfoList[loadingNum].name] = obj

        nowLoading++
        fetch(fileInfoList[loadingNum].url, {
            method: 'GET'
        })
            .then((res) => {

                if (String(res.status)[0] !== '2') {
                    console.log('not found file')
                    console.log(fileInfoList[loadingNum])

                    nowLoading--
                    loadedNum++
    
                    if (loadedNum >= fileInfoList.length) {
                        onAllFileloaded()
                        return
                    }
    
                    loadingStyleUpdate(loadingNum / fileInfoList.length * 100)
                    if (nowLoading < loadingMaxNum) {
                        loadingNum++
                        loadingFile()
                    }
                    return { then: () => {} }
                }
                return res.blob()
            })
            .then((data) => {
                nowLoading--
                const ObjURL = URL.createObjectURL(data)
                obj.src = ObjURL

                loadedNum++

                if (loadedNum >= fileInfoList.length) {
                    onAllFileloaded()
                    return
                }

                loadingStyleUpdate(loadingNum / fileInfoList.length * 100)
                if (nowLoading < loadingMaxNum) {
                    loadingNum++
                    loadingFile()
                }
            })
            .catch(e => { console.log(e) })

        if (nowLoading < 3) {
            loadingNum++
            loadingFile()
        }
    }
    loadingFile()



    function onAllFileloaded() {
        console.log('onload')
        console.log(files)

        loadingDiv.classList.remove('active')


        pageInit()
    }

    function pageInit() {
        const pages = {}
        window.pages = pages

        let lastPage;

        function open(name) {
            console.log('open', name)
            if(lastPage) {
                lastPage.close();
            }
            pages[name].open();
            lastPage = pages[name];
        }

        let nowPage = 0
        let correctCount = 0

        function nextPageSelect() {
            nowPage++;
            if(answerInfo.length <= nowPage) {
                if(correctCount >= 3) {
                    open('success');
                    return;
                }
                open('fail');
                return
            }
            open(`quiz-${nowPage + 1}`);
        }




        function QuizPage(i, correctNum) {
            const that = this;
            this.name = 'quiz-' + (i + 1);
            this.correctNum = correctNum;
    
            this.num = i;
    
            let div = document.createElement('div');
            div.classList.add('page');
            div.classList.add(this.name);
            this.element = div;
    
            console.log(files[`${i + 1}-1`])
            div.appendChild(files[`${i + 1}-1`]);
    
            let buttonList = [];
            this.buttonList = buttonList
    

            let isDelay = false
            for (let i = 0; i < 4; i++) {
                const id = i;
                let bt = document.createElement('button');
                bt.classList.add('quiz-bt');
                bt.classList.add('bt' + (1 + i));
                buttonList.push(bt);
                div.appendChild(bt);
                bt.onclick = function () {
                    clearTimeout(timerObj)
                    if(isDelay) { return }
                    isView = false;

                    buttonList[id].classList.add('active')

                    isDelay = true
                    setTimeout(() => {
                        setTimeout(() => {
                            isDelay = false
                        }, 1000)
                        if (id + 1 === that.correctNum) {
                            open(`${that.name}-1`);
                            correctCount++;
                            return;
                        }
                        open(`${that.name}-2`);
                    }, 1000)
                }

                if(i + 1 === correctNum) {
                    bt.classList.add('correct')
                }
                else {
                    bt.classList.add('incorrect')
                }
            }
    
            let timer = document.createElement('div');
            timer.classList.add('timer');
            div.appendChild(timer);
    
            let timerCount = 0;
            let isView = false;
            let timerObj
            function timerStart() {
                if (!isView) { return }
                if (timerCount <= -1) {
                    if (lastPage === pages.main) { return }

                    
                    for (let btNum = 0; btNum < buttonList.length; btNum++) {
                        buttonList[btNum].classList.add('active')
                    }

                    isDelay = true

                    setTimeout(() => {
                        setTimeout(() => {
                            isDelay = false
                        }, 1000)
                        open(`${that.name}-2`);
                    }, 1000)

                    return;
                }
                timerCount--;
                timer.innerText = timerCount + 1;
                timerObj = setTimeout(timerStart, 1000)
            }
    
            this.open = function () {
    
                that.element.classList.add('select-page');
                timerCount = Number(config.timerCountNum)
                isView = true;
                timerStart();



    
                console.log('correctNum', correctNum)
            }
            this.close = function () {
                that.element.classList.remove('select-page');

                for (let btNum = 0; btNum < buttonList.length; btNum++) {
                    buttonList[btNum].classList.remove('active')
                }
            }
        }
    
        const correctSound = files.correctSound
        const incorrectSound = files.incorrectSound
        
        window.addEventListener('click', () => {
            files.click.currentTime = 0
            files.click.play()
        })

    
        function QuizResultPage(i, num) {
            const that = this;
            this.name = 'quiz-' + (i + 1) + '-' + num;
    
            this.num = i;
    
            let div = document.createElement('div');
            div.classList.add('page');
            div.classList.add(this.name);
            div.classList.add('QuizResultPage');
            this.element = div;
    
            let progressBar = document.createElement('div');
            progressBar.classList.add('progressBar');
    
            let inner = document.createElement('div');
            inner.classList.add('inner');
            progressBar.appendChild(inner);
    
            div.appendChild(progressBar);
    
            div.appendChild(files[`${i + 1}-${num + 1}`]);
    
            let startTime = 0;
            function timerStart() {
                if (!that.isView) { return }
                if (config.resultPageTimeNum < (new Date()).getTime() - startTime) {
                    inner.style.width = '0%';
                    next();
                    return;
                }
    
                inner.style.width = `${((new Date()).getTime() - startTime) / config.resultPageTimeNum * 100}%`;
    
                setTimeout(timerStart, 1000 / 60)
            }
            function next() {
                that.isView = false;
                if (lastPage === pages.main) { return }
                nextPageSelect();
            }
            div.onclick = next;
    
            this.isView = false;
    
            this.open = function () {
                that.element.classList.add('select-page');
                inner.style.width = '0%';
                that.isView = true;
                startTime = (new Date()).getTime();
                timerStart();
    
                if (num === 1) {
                    correctSound.currentTime = 0;
                    correctSound.play();
                    return
                }
                incorrectSound.currentTime = 0;
                incorrectSound.play();
            }
            this.close = function () {
                that.element.classList.remove('select-page');
            }
        }
    
        for (let i = 0; i < answerInfo.length; i++) {
            const q = new QuizPage(i, answerInfo[i]);
            rootDiv.appendChild(q.element);
            pages[q.name] = q;
    
            const q_correct = new QuizResultPage(i, 1);
            rootDiv.appendChild(q_correct.element);
            pages[q_correct.name] = q_correct;
    
            const q_incorrect = new QuizResultPage(i, 2);
            rootDiv.appendChild(q_incorrect.element);
            pages[q_incorrect.name] = q_incorrect;
        }

        function StartPage() {
            const that = this;

            this.name = 'start'

            let div = document.createElement('div');
            div.classList.add('page');
            div.classList.add('start');
            this.element = div;
    
            div.appendChild(files.start)

            let bt = document.createElement('div')
            bt.classList.add('start-bt')
            this.element.appendChild(bt)
            bt.onclick = function() {
                nowPage = 0
                correctCount = 0
                open('quiz-1')
            }

    
            this.open = function () {
                that.element.classList.add('select-page');

            }
            this.close = function () {
                that.element.classList.remove('select-page');
            }

            const ratioStyle = document.createElement('style')
            const ratioStyleText = document.createTextNode('')
            ratioStyle.appendChild(ratioStyleText)
            function ratioStyleUpdate() {
                let per = div.offsetWidth / 1280
                ratioStyleText.textContent = /*css*/`:root { --ratio: ${per}; }`;
            }
            document.head.appendChild(ratioStyle)
            window.addEventListener('resize', ratioStyleUpdate)
            this.ratioStyleUpdate = ratioStyleUpdate
        }

        const startPage = new StartPage()
        rootDiv.appendChild(startPage.element);
        pages[startPage.name] = startPage;
        startPage.ratioStyleUpdate()

        open('start')

        function SuccessPage() {
            const that = this;

            this.name = 'success'

            const main = document.createElement('div')
            main.classList.add(this.name);
            main.classList.add('page');

            this.element = main


            main.appendChild(files.correct)
            
            // main.appendChild(files['confetti.webm'])
        
            
            main.onclick = function() {
                // open('start');
            }

            let sound = files.success
            
            this.open = function() {
                // files['confetti.webm'].currentTime = 0;
                // files['confetti.webm'].play();
            
                sound.currentTime = 0;
                sound.play();
                
                main.classList.add('select-page');
            }
            this.close = function() {
                main.classList.remove('select-page');
            }
        }

        const successPage = new SuccessPage()
        rootDiv.appendChild(successPage.element);
        pages[successPage.name] = successPage;



        function FailPage() {
            const that = this;

            this.name = 'fail'

            const main = document.createElement('div');
            main.classList.add(this.name);
            main.classList.add('page');
            this.element = main
            
    
            main.appendChild(files.gameover)
            
            this.open = function() {
                main.onclick = function() {
                    // open('start');
                }
                main.classList.add('select-page');
            }
            this.close = function() {
                main.classList.remove('select-page');
            }
        }

        const failPage = new FailPage()
        rootDiv.appendChild(failPage.element);
        pages[failPage.name] = failPage;


        console.log('pages', pages)
    }

})
