// pages/detail/detail.js
Page({
    data: {
        topic: 0,
        imgArr: [],
        answerArr: ['', '', '', ''],
        answerIndex: 0, //默认点击下方的文字输入在第一个位置
        textIndexArry: [], //下方文字点击的数组
        clickTextCount: 0,
        winShow: false, //页面弹层默认不显示    
        errorCount: 1,
        successCount: 1
    },
    onLoad: function(options) {
        let that = this;
        let topic = wx.getStorageSync('topic') ? wx.getStorageSync('topic') : 0;
        let errorCount = wx.getStorageSync('errorCount') ? wx.getStorageSync('errorCount') : 1;
        let successCount = wx.getStorageSync('successCount') ? wx.getStorageSync('successCount') : 1;
        console.log(errorCount, successCount)
        that.setData({
            topic,
            successCount,
            errorCount
        })
        wx.request({
            url: 'https://qncdn.playonwechat.com/kantucaici/alldata1.json',
            method: 'GET',
            success(res) {
                console.log(res);
                let topicArr = res.data.data; //题目数组
                let topic = that.data.topic; //题目的index
                let text = res.data.text; //陪衬文字   
                let currentTopic = topicArr[topic]; //当前所在的成语  
                let answerArr = []; //答案所在位置数组

                let imgArr = that.getChengYuImg(topic); //图片数组
                console.log("imgArr", imgArr)
                //获取到文字数组
                let textArr = that.randomText(text, currentTopic.chengyu);
                console.log("textArr", textArr)
                let clonetextArr = textArr.concat();
                console.log("当前题目", currentTopic);
                console.log("当前题目配图数组", imgArr)
                console.log("随机文字", textArr)
                console.log("克隆的随机文字数组", clonetextArr)
                console.log("答案位置数组", answerArr)
                that.setData({
                    imgArr,
                    textArr,
                    clonetextArr,
                    currentTopic,
                    chengyu: currentTopic.chengyu,
                    topicArr,
                    text
                })
            }
        })
    },

    // 下一题
    nextTopic() {
        let that = this;
        let topic = that.data.topic;
        let topicArr = that.data.topicArr;
        topic++;
        let currentTopic = topicArr[topic]; //当前所在的成语
        var chkEmpty = function() {
            if (!currentTopic.chengyu) {
                topic++;
                currentTopic = topicArr[topic];
            }
            if (!currentTopic.chengyu) {
                chkEmpty();
            }
        };
        chkEmpty();
        console.log("topic", topic)
        console.log("下一题当前题目", currentTopic)
        let answerArr = ['', '', '', ''];
        let imgArr = that.getChengYuImg(topic); //获取到当前成语配图
        let textArr = that.randomText(that.data.text, currentTopic.chengyu);
        let clonetextArr = textArr.concat();
        let chengyu = currentTopic.chengyu;
        let successCount = that.successCount + 1;
        console.log(topic, imgArr)
        that.setData({
            topic,
            winShow: false,
            currentTopic,
            answerArr,
            imgArr,
            textArr,
            clonetextArr,
            chengyu,
            successCount
        })
        wx.setStorageSync('topic', topic);
        wx.setStorageSync('successCount', successCount);
    },

    // 生成随机文字
    randomText(text, chengyu) {
        let textIndex = 0;
        let textArr = [];
        for (let i = 0; i < 24; i++) {
            textIndex = Math.floor(Math.random() * 1400);
            textArr.push(text[textIndex])
        }
        textArr[0] = chengyu[0];
        textArr[1] = chengyu[1];
        textArr[2] = chengyu[2];
        textArr[3] = chengyu[3];
        textArr.sort(function() { return 0.5 - Math.random() })
        return textArr;
    },

    // 生成当前成语的图片
    getChengYuImg(topic) {
        let imgArr = [];
        for (let i = 0; i < 4; i++) {
            imgArr[i] = `https://hpchat.playonwechat.com/caiciyu/${topic}/${i}.jpg`
        }
        return imgArr;
    },

    // 预览图片
    prewImg(e) {
        wx.previewImage({
            src: e.currentTarget.dataset.src,
            urls: [e.currentTarget.dataset.src]
        })
    },

    // 点击答案框
    pushAnswer(e) {
        let that = this;
        let idx = e.currentTarget.dataset.idx;
        let answerArr = that.data.answerArr;
        let clickText = answerArr[idx];
        let textArr = that.data.textArr;
        textArr[clickText.idx] = clickText.text;
        answerArr[idx] = '';
        let clickTextCount = that.data.clickTextCount - 1;
        that.setData({
            answerArr,
            textArr,
            clickTextCount
        })
    },

    // 点击候选词
    slectText(e) {
        console.log(e)
        let that = this;
        let answerArr = that.data.answerArr;
        let clickTextCount = that.data.clickTextCount;
        let textArr = that.data.textArr;
        let clonetextArr = that.data.clonetextArr;
        let chengyu = that.data.chengyu;
        textArr[e.currentTarget.dataset.idx] = '';
        if (clickTextCount <= 3) {
            if (!answerArr[0]) {
                answerArr[0] = e.currentTarget.dataset;
            } else if (!answerArr[1]) {
                answerArr[1] = e.currentTarget.dataset;
            } else if (!answerArr[2]) {
                answerArr[2] = e.currentTarget.dataset;
            } else if (!answerArr[3]) {
                answerArr[3] = e.currentTarget.dataset;
            }
            clickTextCount++;
            if (answerArr[0].text === chengyu[0] && answerArr[1].text === chengyu[1] && answerArr[2].text === chengyu[2] && answerArr[3].text === chengyu[3]) {
                console.log("回答正确");
                that.setData({
                    winShow: true
                })
            } else {
                console.log("答案错误");
                console.log(answerArr);
                let errorCount = that.errorCount + 1;
                for (var i = 0; i < answerArr.length; i++) {
                    if (answerArr[0].text && answerArr[1].text && answerArr[2].text && answerArr[3].text) {
                        answerArr[i].tiperror = 'error'
                    }
                };
                that.setData({
                    answerArr,
                    errorCount
                })
                wx.setStorageSync('errorCount', errorCount)
                setTimeout(function() {
                    for (var i = 0; i < answerArr.length; i++) {
                        answerArr[i].tiperror = ''
                    };
                    that.setData({
                        answerArr
                    })
                }, 500)
            }
        } else {
            clickTextCount = 1;
            answerArr = ['', '', '', ''];
            answerArr[0] = e.currentTarget.dataset;
            textArr = clonetextArr.concat();
            textArr[e.currentTarget.dataset.idx] = '';
        }
        // console.log(clonetextArr,textArr)
        that.setData({
            answerArr,
            clickTextCount,
            textArr
        })
    },

    shareBtn() {
        let that = this;
        let errorCount = that.data.errorCount;
        let successCount = that.data.successCount;
        console.log(errorCount, successCount)
        let _succcess = parseInt(successCount / (errorCount + successCount));
        let avatarUrl = wx.getStorageSync('avatarUrl') ? wx.getStorageSync('avatarUrl') : "";
        wx.request({
            url: 'https://utest.playonwechat.com/chengyu/App/paint',
            data: {
                kid: wx.getStorageSync('kid'),
                avatarUrl: avatarUrl,
                rate: _succcess + '%'
            },
            success(res) {
                console.log(res);
                let src = res.data.data.src;
                wx.downloadFile({
                    url: src,
                    success(res) {
                        let _image = res.tempFilePath;
                        wx.saveImageToPhotosAlbum({
                            filePath: _image,
                            success(res) {
                                console.log(res)
                                wx.showToast({
                                    title: '海报下载成功，请去相册查看',
                                    icon: 'success',
                                    duration: 800
                                });
                                wx.previewImage({
                                    current: src,
                                    urls: [src]
                                })
                            },
                            fail() {
                                wx.showModal({
                                    title: '提示',
                                    content: '系统无法保存图片到您的相册，是否去开启权限',
                                    success: function(res) {
                                        if (res.confirm) {
                                            wx.openSetting({
                                                success: (res) => {
                                                    wx.getSetting({
                                                        success: (res) => {
                                                            if (res.authSetting['scope.writePhotosAlbum']) {
                                                                wx.saveImageToPhotosAlbum({
                                                                    filePath: _image,
                                                                    success(res) {
                                                                        console.log(res);
                                                                        wx.showToast({
                                                                            title: '海报下载成功，请去相册查看',
                                                                            icon: 'success',
                                                                            duration: 800
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        } else if (res.cancel) {
                                            console.log('用户点击取消')
                                        }
                                    }
                                })
                            }

                        })
                    }
                })
            }
        })
    },


    onReady: function() {

    },

    onShow: function() {

    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onPullDownRefresh: function() {

    },

    onReachBottom: function() {

    },

    onShareAppMessage: function() {

    }
})