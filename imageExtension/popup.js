const ulContainer = document.getElementById('compareList');
const displayMSG = document.getElementById('display');

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function removeScrapedData(items, index) {
  let newListOfItems = [];
  ulContainer.innerHTML = "";
  for(let ti in items) {
    if(ti==index) {
      continue;
    }
    let liElement = document.createElement('li');
    liElement.innerHTML = `
      <b>${items[ti].title}</b> <span class="cls_btn">x<span>
    `;
    ulContainer.appendChild(liElement);
    newListOfItems.push(items[ti]);
  }
  const clsBtns = Array.from(document.getElementsByClassName('cls_btn'));
  clsBtns.forEach((clsBtn, index) => {
    clsBtn.addEventListener('click', () => {
      removeScrapedData(newListOfItems, index);
    })
  })
  chrome.storage.local.set({ listOfItems: newListOfItems });
  if(!newListOfItems.length) {
    displayMSG.innerText = "Please add something to compare";
    document.getElementById('openPage').style.display = "none";
  }
}

const openPageBtn = document.getElementById('openPage');
openPageBtn.addEventListener('click', () => {
  const tabProperties = {
    url: './comparePage.html'
  }
  chrome.tabs.create(tabProperties);
})

chrome.storage.local.get('listOfItems', function (object) {
  if(isEmpty(object) || !object.listOfItems.length) {
    displayMSG.innerText = "Please add something to compare";
    document.getElementById('openPage').style.display = "none";
  } else {
    let items = object.listOfItems;
    items.forEach(function (element) {
      let liElement = document.createElement('li');
      liElement.innerHTML = `
        <b>${element.title}</b> <span class="cls_btn">x<span>
      `;
      ulContainer.appendChild(liElement);
    })
    const clsBtns = Array.from(document.getElementsByClassName('cls_btn'));
    clsBtns.forEach((clsBtn, index) => {
      clsBtn.addEventListener('click', () => {
        removeScrapedData(items, index);
      })
    })
  }
})
