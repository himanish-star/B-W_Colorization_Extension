function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function retrieveReviews(doc) {
  let reviewList = doc.getElementById('cm-cr-dp-review-list');
  let reviews = [];
  if(reviewList) {
    reviewList = reviewList.getElementsByClassName('review-data');
    for(review of reviewList) {
      reviews.push(review.innerText.trim());
    }
  }
  return reviews;
}

function retrieveImageURL(doc) {
  return (doc.getElementById("landingImage") || doc.getElementById("imgBlkFront")).getAttribute('src');
}

function retrieveTitle(doc) {
  return doc.getElementById("productTitle").innerText.trim();
}

function retrievePrice(doc) {
  return (doc.getElementById("priceblock_saleprice")
    || doc.getElementById("priceblock_ourprice")
    || doc.getElementById("priceblock_dealprice")
    || doc.getElementsByClassName("offer-price")[0])
    .innerText.trim();
}

function retrieveDetails(doc) {
  const featureBullets = doc.getElementById("feature-bullets");
  let morePoints = doc.getElementById('prodDetails');
  let morePoints1 = doc.getElementById('techSpecSoftlinesWrap');
  let morePoints2 = doc.getElementById('technicalSpecifications_feature_div');
  let featureDetails = [];
  if(featureBullets) {
    const points = featureBullets.getElementsByTagName('li');
    for(point of points) {
      featureDetails.push(point.innerText.trim());
    }
  }
  if(morePoints) {
    morePoints = morePoints.getElementsByTagName('table')[0]
    .getElementsByTagName('td');
    for(let i = 0; i < morePoints.length; i += 2) {
      let object = {};
      object[morePoints[i].innerText.trim()] = morePoints[i+1].innerText.trim();
      featureDetails.push(object);
    }
  }
  if(morePoints1) {
    morePoints1 = morePoints1.getElementsByTagName('table')[0]
      .getElementsByTagName('td');
    for(let i = 0; i < morePoints1.length; i += 2) {
      let object = {};
      object[morePoints1[i].innerText.trim()] = morePoints1[i+1].innerText.trim();
      featureDetails.push(object);
    }
  }
  if(morePoints2) {
    morePoints2 = morePoints2.getElementsByTagName('table')[0]
      .getElementsByTagName('tr');
    for(let i = 0; i < morePoints2.length; i ++) {
      let object = {};
      object[morePoints2[i].getElementsByTagName('th')[0].innerText.trim()] = morePoints2[i].getElementsByTagName('td')[0].innerText.trim();
      featureDetails.push(object);
    }
  }
  return {
    featureDetails: featureDetails,
  };
}

function extractWebPage(doc) {
  return new Promise((resolve, reject) => {
    resolve({
      provider: 'Amazon',
      imageUrl: retrieveImageURL(doc),
      title: retrieveTitle(doc),
      price: retrievePrice(doc),
      details: retrieveDetails(doc),
      reviews: retrieveReviews(doc)
    });
  })
}

chrome.storage.local.get('listOfItems', function (obj) {
  extractWebPage(document)
    .then((JSON_data) => {
      console.log(JSON_data);
      let itemsList = [];
      if(!isEmpty(obj)) {
        itemsList = obj.listOfItems;
      }
      console.log(itemsList.length)
      itemsList.push(JSON_data);
      chrome.storage.local.set({ 'listOfItems': itemsList}, () => {
        console.log('done', itemsList);
      });
    })
})
