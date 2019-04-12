const colorOverlay = (color_data) => {
  console.log(color_data);
  tagsFound = color_data.m;
  const bw = Array.from(document.getElementsByClassName('grayscale-detect'));
  bw.forEach(img => {
    const imgTag = 'bw-image-' + img.getAttribute('data-target-bw').split('-')[2] + '.png';
    if(tagsFound.includes(imgTag)) {
      const src = img.src;
      img.setAttribute("title","");
      img.classList.add("colored-up");
      img.addEventListener('mouseover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        img.src = 'http://localhost:5000/images_hosted/' + imgTag;
      });
      img.addEventListener('mouseout', (e) => {
        e.preventDefault();
        e.stopPropagation();
        img.src = src;
      });
    }
  })
  // window.alert(`Image has been colored`);
  document.getElementById('bw-complete-note').style.display = 'block';
  setTimeout(() => {
    document.getElementById('bw-complete-note').style.display = 'none';
  }, 2000);
};

const sendBWImagesToServer = (imageData) => {
  const url = 'http://localhost:5000/colorImages';

  fetch(url, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify({imageData: imageData}), // data can be `string` or {object}!
    headers:{
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
    .then(res => res.json())
    .then(response => console.log('Success:', colorOverlay(response)))
    .catch(error => console.error('Error:', error));
};

const processImageData = (src,width,height,domImg) => {
  return new Promise(async(res, rej) => {
    const image = document.createElement('img');
    image.setAttribute('width',width);
    image.setAttribute('height',height);
    image.setAttribute('crossOrigin','')

    const resp = await fetch(src);
    const blob = await resp.blob();
    const base64img = URL.createObjectURL(blob);

    image.setAttribute('src',base64img);

    image.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const dataURL = canvas.toDataURL();

      const imageNew = document.createElement('img');
      imageNew.setAttribute('src',dataURL);
      imageNew.setAttribute('width',width);
      imageNew.setAttribute('height',height);

      imageNew.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // invert colors
        var i;
        let justify = true;
        for (i = 0; i < imgData.data.length; i += 4) {
          const average = (imgData.data[i]+imgData.data[i+1]+imgData.data[i+2])/3;
          if( imgData.data[i]!==imgData.data[i+1] || imgData.data[i+1]!==imgData.data[i+2] || imgData.data[i]!==imgData.data[i+2]) {
            justify = false;
          }
          imgData.data[i] = average;
          imgData.data[i+1] = average;
          imgData.data[i+2] = average;
          imgData.data[i+3] = 255;
        }

        // console.log(imgData.data);
        ctx.putImageData(imgData, 0, 0);

        // document.body.appendChild(canvas)

        if(justify) {
          domImg.setAttribute("srcset","")
          console.log("gray hai",domImg);
          domImg.classList.add("grayscale-detect");
          domImg.setAttribute('title', 'This image is a grayscale image');

          if(domImg.parentNode.nodeName==='A') {
            $(`
              <button class="bw-button">
                🎨 Paint
              </button>`).insertAfter($(domImg.parentNode));
            res(domImg);
          } else {
            $(`
              <button class="bw-button">
                🎨 Paint
              </button>`).insertAfter($(domImg));
            res(domImg);
          }
        } else {
          res('reject');
        }
      }
    }
  });
}

const startFetching = async () => {
  const imagesInPage = Array.from(document.getElementsByTagName('img'));
  const fetcher = imagesInPage.map(img => {
    return new Promise((res,rej) => {
      const result = processImageData(img.src,img.width,img.height,img);
      res(result);
    })
  });
  const BWImagesList = await Promise.all(fetcher)
  const tempList = BWImagesList.filter(ele => ele!=='reject');
  // window.alert(`${tempList.length} Black and White images detected in this page`);
  const elemNotif = document.getElementById('bw-color-detect');
  elemNotif.style.display = 'block';
  elemNotif.querySelector('#bw-color-detect-number').innerText = tempList.length;
  setTimeout(() => {
    elemNotif.style.display = 'none';
  }, 2000);
  return BWImagesList;
};

window.onload = async () => {
  const requestNotification = $(`
    <div id="bw-color-note">
      started coloring!
    </div>`);
  const resultNotification = $(`
    <div id="bw-complete-note">
      coloring completed! Hover over the image to view colors :)
    </div>`);
  const detectNotification = $(`
    <div id="bw-color-detect">
      <span id="bw-color-detect-number"></span> Black and White images detected in this page!
    </div>`);
  document.body.appendChild(detectNotification[0]);
  document.body.appendChild(requestNotification[0]);
  document.body.appendChild(resultNotification[0]);
  const bwimages = await startFetching();
  bwimages
  .filter(bwimage => {
    return bwimage !== 'reject';
  })
  .forEach((bwimage,idx) => {
    bwimage.setAttribute("data-target-BW",`bw-d-${idx}`);
    $(bwimage).unbind("click");
    if(bwimage.parentNode.nodeName==='A') {
      $(bwimage).parent().next()[0].addEventListener('click', (e) => {
        console.log('type 1');
        e.stopPropagation();
        e.preventDefault();
        // window.alert(`Processing your request`);
        document.getElementById('bw-color-note').style.display = 'block';
        setTimeout(() => {
          document.getElementById('bw-color-note').style.display = 'none';
        }, 2000);
        sendBWImagesToServer([
          {
            url: bwimage.src,
            idx: idx
          }
        ]);
      });
    } else {
      $(bwimage).next()[0].addEventListener('click', (e) => {
        console.log('type 2');
        e.stopPropagation();
        e.preventDefault();
        // window.alert(`Processing your request`);
        document.getElementById('bw-color-note').style.display = 'block';
        setTimeout(() => {
          document.getElementById('bw-color-note').style.display = 'none';
        }, 2000);
        sendBWImagesToServer([
          {
            url: bwimage.src,
            idx: idx
          }
        ]);
      });
    }
  });
};
