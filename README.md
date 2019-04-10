# Black and White Colorization Extension

### Introduction

Bored while going through **black and white** images in a **Wikipedia** page or some other web page consisting of 
black and white images? Hope you had them colored? ..... ..... ..... Bingo! Well now you can, using this extension 
and its accompanying localhost server. Read the instructions below to get started ASAP :)

### Instructions to get started

- clone this repo using
```
git clone https://github.com/himanish-star/B-W_Colorization_Extension.git
```
- unzip `caffe.tar.gz` and place it in the path `/home/<user_name>/`. Finally your path to caffe would look something like this
`/home/<user_name>/caffe`
- add caffe to your python path
```
export PYTHONPATH=/home/<user_name>/caffe/python:$PYTHONPATH
```
- start the nodejs server 
```
cd B-W_Colorization_Extension/server
npm install
npm start
```
- Enter the `developer mode` in chrome extensions and click on `load unpacked` and select `folder: imageExtension`
- Navigate to any desired Wikipedia webpage and get ready for a new experience

### Demo Video

please look at this short video to see how the extension works https://youtu.be/dmrRAaevCEA 
