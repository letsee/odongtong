(function (){
  const types = [
    {name: 'normal', imagesNumber: 59, guideImgHeight: 1.207},
    {name: 'cup', imagesNumber: 59, guideImgHeight: 0.9551},
    {name: 'pack', imagesNumber: 9, guideImgHeight: 1.3032},
  ]
  const checkType = () => (
    types.find(element =>
      element.name === document.getElementsByTagName('html')[0].id
    )
  )
  const titleType = checkType()
  let animateCount = 0
  let animateSpeed = 5
  let isTookScreenshot = false
  const UA = window.navigator.userAgent;
  const isAndroid = UA.indexOf("Android") > 0;
  const isIOS = UA.indexOf("iPhone") > 0;

  letsee.ready(() => {
    letsee.start()
    let rendingCount = 0
    letsee.onTrackMove(() => {
      if(isTookScreenshot) {
        rendingCount = 0
        return
      } else {
        rendingCount += 1
        rendingCount = rendingAnimate(rendingCount)
      }
    });
  });
  letsee.init();
  letsee.onTrackStart(() => {
    document.getElementsByTagName('html')[0].classList.add('track-start')
  })
  letsee.onTrackEnd(() => {
    document.getElementsByTagName('html')[0].classList.remove('track-start')
  })

  const rendingAnimate = (rendingCount) => {
    if(rendingCount < animateSpeed) {
      return rendingCount
    } else {
      animateImg(titleType)
      return 0
    }
  }

  const stopRendingAnimate = (count) => {
    setImg(count)
  }

  const animateImg = (type) => {
    if(animateCount > type.imagesNumber) animateCount = 0
    setImg(animateCount)
    animateCount += 1
  };

  const setImg = (count) => {
    document.querySelector('.animate-image').setAttribute('class', `animate-image img-${count}`)
  }

  const checkScreenOrientation = () => {
    const orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
    if(orientation === 'landscape') {
      const layer = document.createElement('div')
      layer.innerHTML = '<p class="text">화면을 세로 방향으로<br />돌려주세요.</p>'
      layer.classList.add('notice-landscape')
      document.body.appendChild(layer)
    } else {
      const noticeNode = document.querySelector('.notice-landscape')
      noticeNode && noticeNode.parentNode.removeChild(noticeNode)
      window.scrollTo(0, 0)
    }
  }
  checkScreenOrientation()

  window.addEventListener('resize', () => {
    checkScreenOrientation()
  })

  const setGuideImgSizeToInt = () => {
    const guideImg = document.querySelector('.line')
    const guideImgStyle = getComputedStyle(guideImg)
    const heightRatio = titleType.guideImgHeight
    guideImg.setAttribute('style', `height: ${parseInt(Number((guideImgStyle.width).split('px')[0]) * heightRatio)}px`)
  }
  setGuideImgSizeToInt()

  const changeTheme = (event) => {
    const contents = document.querySelector('.theme-frame')
    contents.setAttribute('class', 'theme-frame')
    if(event.target.id === 'empty') return
    contents.classList.add(event.target.id)
  }
  const tabThemeRadio = () => {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    Array.prototype.forEach.call(themeRadios, (themeRadio) => {
      themeRadio.addEventListener('change', changeTheme)
    })
  }
  tabThemeRadio()

  const toggleSelectTheme = () => {
    const themeRadios = document.querySelectorAll('input[name="theme"]')
    Array.prototype.forEach.call(themeRadios, (themeRadio) => {
      if(themeRadio.disabled) {
        themeRadio.removeAttribute('disabled')
      } else {
        themeRadio.setAttribute('disabled', 'disabled')
      }
    })
  }
  const cameraAudio = new Audio('./assets/mp3/camera-sound.mp3')
  const takeScreenShot = () => {
    document.querySelector('.btn-take').addEventListener('click', (e) => {
      cameraAudio.play().then(() => {
        screenReadyForTake()
        allScreenshot()
      })
    });
  }
  takeScreenShot()

  const offScroll = (e) => {
    e.preventDefault()
  }

  const allScreenshot = () => {
    const startPosition = document.querySelector('.header').offsetHeight
    if (isAndroid) {
      const endPosition = document.querySelector('.controller').offsetHeight
      const svgHeight = window.innerHeight - startPosition - document.querySelector('.controller').offsetHeight
      const bodyNode = document.getElementsByTagName('body')[0]
      const svgSetString = `<svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}" height="${svgHeight}" viewBox="0 ${startPosition} ${window.innerWidth} ${svgHeight}"><foreignObject x="0" y="0" width="100%" height="${svgHeight + startPosition}px">`
      domtoimage.toSvg(bodyNode).then((dataUrl) => {
        afterScreenshotChangeClass()
        const screenshotDiv = document.createElement('div')
        screenshotDiv.classList.add('screenshot')
        let svg = dataUrl.split('charset=utf-8,')[1].split('<foreignObject x="0" y="0" width="100%" height="100%">')[1].replaceAll('%0A', '')
        svg = svgSetString + svg.replaceAll('name="theme"', '')
        screenshotDiv.innerHTML = svg
        screenshotDiv.style.width = `${window.innerWidth}px`
        screenshotDiv.style.height = `${svgHeight}px`
        const screenshotWrapDiv = document.createElement('div')
        screenshotWrapDiv.classList.add('screenshot-wrap')
        screenshotWrapDiv.style.top = `${startPosition}px`
        screenshotWrapDiv.style.bottom = `${endPosition}px`
        screenshotWrapDiv.appendChild(screenshotDiv)
        document.getElementsByClassName('wrap')[0].appendChild(screenshotWrapDiv)
        window.removeEventListener('scroll', offScroll)
        svgString2Image(svg, 466, 466, 'png', (pngData) => {
          saveFileToLocal(pngData)
        })
      })
    }
    
    if (isIOS) {
      html2canvas(document.body, {
        x: 0,
        y: startPosition,
        width: window.innerWidth,
        height: window.innerHeight - startPosition - document.querySelector('.controller').offsetHeight
      }).then(function(canvas){
        afterScreenshotChangeClass()
        canvas.classList.add('screenshot-wrap')
        canvas.style.position = 'fixed'
        canvas.style.left = '0'
        canvas.style.top = startPosition + 'px'
        canvas.style.zIndex = '150'
        document.body.appendChild(canvas)
        window.removeEventListener('scroll', offScroll)
        saveFileToLocal(canvas.toDataURL())
      })
    }
  }

  const screenReadyForTake = () => {
    window.addEventListener('scroll', offScroll)
    stopRendingAnimate(animateCount)
    isTookScreenshot = true
    document.getElementsByTagName('html')[0].classList.add('take-screenshot')
    toggleSelectTheme()
  }

  const saveFileToLocal = (dataUrl) => {
    const fileName = "INUS"+Date.now()
    localStorage.clear()
    localStorage.setItem(fileName, dataUrl);
  }

  const afterScreenshotChangeClass = () => {
    const htmlClassList = document.getElementsByTagName('html')[0].classList
    htmlClassList.remove('take-screenshot')
    htmlClassList.add('took-screenshot')
  }
  
  const svgString2Image = (svgString, width, height, format, callback) => {
    // set default for format parameter
    format = format ? format : 'png';
    // SVG data URL from SVG string
    var svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    // create canvas in memory(not in DOM)
    var canvas = document.createElement('canvas');
    // get canvas context for drawing on canvas
    var context = canvas.getContext('2d');
    // set canvas size
    canvas.width = width;
    canvas.height = height;
    // create image in memory(not in DOM)
    var image = new Image();
    // later when image loads run this
    image.onload = function () { // async (happens later)
      // clear canvas
      context.clearRect(0, 0, width, height);
      // draw image with SVG data to canvas
      context.drawImage(image, 0, 0, width, height);
      // snapshot canvas as png
      var pngData = canvas.toDataURL('image/' + format);
      // pass png data URL to callback
      callback(pngData);
    }; // end async
    // start loading SVG data into in memory image
    image.src = svgData;
  }

  const backToAr = () => {
    document.querySelector('.btn-retake').addEventListener('click', (e) => {
      const screenShot = document.querySelector('.screenshot-wrap')
      screenShot.parentNode.removeChild(screenShot)
      document.getElementsByTagName('html')[0].classList.remove('took-screenshot')
      toggleSelectTheme()
      isTookScreenshot = false
    })
  }
  backToAr()
})()
