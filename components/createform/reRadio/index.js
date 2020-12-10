import Api from "../../../utils/api.js";
Component({
    properties: {
        radioData: {
            type: Object,
            value: null,
            observer(newVal) {
                this.setData({
                    list: this.getOnlineCustomizeOptionList(newVal),
                    fieldName: newVal.fieldName,
                    fieldType: newVal.fieldType,
                    required: newVal.required,
                    sList: newVal.onlineCustomizeDtos,
                    sort: newVal.sort
                })
            }
        }
    },
    data: {
        selectName: '请选择',
        list: '',
        sList: ''
    },
    methods: {
        bindPickerProjectChange(e) {
            this.setData({
                selectName: this.data.list[e.detail.value].fieldName,
                correlationCustomizeId: this.data.list[e.detail.value].correlationCustomizeId,
                correlationCustomizeName: this.data.list[e.detail.value].correlationCustomizeName
            });
            this.triggerEvent('myevent', {
                fieldName: this.data.fieldName,
                fieldValue: this.data.list[e.detail.value].fieldName,
                fieldType: this.data.fieldType,
                sort: this.data.sort
            })
        },
        getOnlineCustomizeOptionList(newVal) {
            if (newVal.dataType == 0 && newVal.onlineCustomizeOptionList) {
                return newVal.onlineCustomizeOptionList;
            } else if (newVal.dataType == 1 && newVal.url) {
                this.getProjectData(newVal.fieldName, newVal.url, 1)
            };
        },
        getProjectData(correlationCustomizeName, url) {
            let that = this;
            Api.fetch({
                method: 'get',
                url: url
            }).then((res) => {
                if (res.code == 200) {
                    if (res.data.length > 0) {
                        that.setData({
                            list: res.data
                        })
                    }
                }
            });
        },
    }
})