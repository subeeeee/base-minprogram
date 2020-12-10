Component({
    properties: {
        checkboxData: {
            type: Object,
            value: null,
            observer(newVal) {
                this.setData({
                    dataList: newVal.onlineCustomizeOptionList,
                    fieldName: newVal.fieldName,
                    fieldType: newVal.fieldType,
                    required: newVal.required,
                    sort: newVal.sort
                })
            }
        }
    },
    data: {
        dataList: [],
        newArr: [],
        name: '请选择',
        isQuantum: false
    },
    methods: {
        openSelect: function() {
            this.setData({
                isQuantum: true
            });
        },
        cancelQtu: function() {
            this.setData({
                isQuantum: false
            })
        },
        selectQtu: function(e) {
            var that = this,
                index = e.currentTarget.dataset.index,
                value = e.currentTarget.dataset.value,
                dataList = that.data.dataList,
                newArr = that.data.newArr,
                val = dataList[index].checked, //点击前的值
                limitNum = 100,
                curNum = 0; //已选择数量

            //选中累加
            for (var i in dataList) {
                if (dataList[i].checked) {
                    curNum += 1;
                }
            }

            if (!val) {
                if (curNum == limitNum) {
                    wx.showModal({
                        content: '选择数量不能超过' + limitNum + '个',
                        showCancel: false
                    })
                    return;
                }
                newArr.push(value);
            } else {
                for (var i in newArr) {
                    if (newArr[i] == value) {
                        newArr.splice(i, 1);
                    }
                }

            }
            dataList[index].checked = !val;

            that.setData({
                dataList: dataList,
                newArr: newArr,
                name: this.data.newArr.join() || "请选择"
            })
            this.triggerEvent('myevent', {
                fieldName: this.data.fieldName,
                fieldValue: this.data.newArr.join(),
                fieldType: this.data.fieldType,
                sort: this.data.sort
            })
        },
        saveQtu: function() {
            this.setData({
                isQuantum: false
            });
            // this.triggerEvent('myevent', {
            //     fieldName: this.data.fieldName,
            //     fieldValue: this.data.newArr.join(),
            //     fieldType: this.data.fieldType
            // })
        }
    }
})