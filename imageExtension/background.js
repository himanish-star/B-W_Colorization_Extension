chrome.tabs.onUpdated.addListener(() => {
  console.log('tab updated, and fire event to empty the contents of the folder');
  const url = "http://localhost:5000/emptyFolder";
  fetch(url, {
    method: 'GET'
  })
    .then(res => console.log("Success", res))
    .catch(error => console.error('Error:', error));
});
