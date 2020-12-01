import {HOUSE_SORT} from '../../../config/index'
import Api from "../../../utils/api";
Component({
    properties: {
        codeC: {
            type: String,
            observer(codeC) {
                if (!codeC || codeC == -1) {
                    this.setDataFun([])
                } else {
                    Api.getAreaList({codeC: codeC})
                        .then(({
                                   code,
                                   data
                               }) => {
                            if (code == 200) {
                                data.map(i => {
                                    i.val = i.codeA;
                                    i.qiuhao = 'areaCode'
                                    return i
                                });
                                this.setDataFun(data)
                            }
                        })
                }
            }
        }
    },
    lifetimes: {
        attached: function() {
            // 在组件实例进入页面节点树时执行
            let filterCriteria = wx.getStorageSync('filterCriteria')
            let filterCriteriaName = wx.getStorageSync('filterCriteriaName')
            if (filterCriteria) {
                let obj = {}
                let obj2 = {}
                for(let key in filterCriteria){
                    obj[key] = filterCriteria[key]
                    obj2[key] = filterCriteriaName[key]
                }
                this.setData({
                    params: Object.assign(this.data.params, obj),
                    paramsName: Object.assign(this.data.paramsName, obj2),
                })
                wx.setStorageSync('filterCriteria', '')
                wx.setStorageSync('filterCriteriaName', '')
                this.submitHandleFun();
            }
        },
        detached: function() {
            // 在组件实例被从页面节点树移除时执行
        },
    },
    data: {
        showCity: false,
        tabs: ['区域', '均价', '户型', '筛选', '排序'],
        showFilter: false,
        filterOne: 0,
        filterTwo: 0,
        params: {
            maxAveragePrice: '',
            areaCode: '',
            minAveragePrice: '',
            projectTypes: [],
            totalPrice: [],
            statusList: [],
            areas: [],
            decorateTypes: [],
            roomCount: [],
        },
        paramsName: {
            projectTypes: [],
            totalPrice: [],
            statusList: [],
            areas: [],
            decorateTypes: [],
            roomCount: [],
        },
        HOUSE_SORT,
        selectSort: 0,
        returnData: []
    },
    methods: {
        setDataFun(data) {
            this.setData({
                returnData: [
                    [{
                        name: '区域',
                        type: 'areaCode',
                        data: [{
                            qiuhao: 'areaCode',
                            regionid: '',
                            val: '',
                            regionname: '不限',
                            name: '不限'
                        }, ...data]
                    }],
                    [{
                        name: '均价',
                        type: 'price',
                        data: [
                            {
                                qiuhao: 'price',
                                title: '不限',
                                name: '不限',
                                maxAveragePrice: '',
                                minAveragePrice: ''
                            },
                            {
                                qiuhao: 'price',
                                title: '6000以下',
                                name: '6000以下',
                                maxAveragePrice: '6000',
                                minAveragePrice: ''
                            },
                            {
                                qiuhao: 'price',
                                title: '6000-7500',
                                name: '6000-7500',
                                maxAveragePrice: '7500',
                                minAveragePrice: '6000'
                            },
                            {
                                qiuhao: 'price',
                                title: '7500-9000',
                                name: '7500-9000',
                                maxAveragePrice: '9000',
                                minAveragePrice: '7500'
                            },
                            {
                                qiuhao: 'price',
                                title: '9000-10000',
                                name: '9000-10000',
                                maxAveragePrice: '10000',
                                minAveragePrice: '9000'
                            },
                            {
                                qiuhao: 'price',
                                title: '10000-12000',
                                name: '10000-12000',
                                maxAveragePrice: '12000',
                                minAveragePrice: '10000'
                            },
                            {
                                qiuhao: 'price',
                                title: '12000以上',
                                name: '12000以上',
                                maxAveragePrice: '',
                                minAveragePrice: '12000'
                            },
                        ]
                    }],
                    [
                        {
                            name: '户型',
                            type: 'roomCount',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'roomCount',
                                    title: '不限',
                                    name: '不限',
                                    type: 1,
                                    value: '',
                                    val: ''
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '一居',
                                    name: '一居',
                                    type: 1,
                                    value: '1',
                                    val: '1'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '二居',
                                    name: '二居',
                                    type: 1,
                                    value: '2',
                                    val: '2'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '三居',
                                    name: '三居',
                                    type: 1,
                                    value: '3',
                                    val: '3'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '四居',
                                    name: '四居',
                                    type: 1,
                                    value: '4',
                                    val: '4'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '五居',
                                    name: '五居',
                                    type: 1,
                                    value: '5',
                                    val: '5'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '五居以上',
                                    name: '五居以上',
                                    type: 1,
                                    value: '6',
                                    val: '6'
                                }
                            ]
                        }
                    ],
                    [
                        {
                            name: '面积',
                            type: 'areas',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'areas',
                                    name: '50㎡以下',
                                    val: '0-50'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '50-70㎡',
                                    val: '50-70'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '70-90㎡',
                                    val: '70-90'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '90-110㎡',
                                    val: '90-110'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '110-130㎡',
                                    val: '110-130'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '130-150㎡',
                                    val: '130-150'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '150-180㎡',
                                    val: '150-180'

                                },
                                {
                                    qiuhao: 'areas',
                                    name: '200㎡以上',
                                    val: '200-0'
                                }
                            ]
                        },
                        {
                            name: '总预算',
                            type: 'totalPrice',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'totalPrice',
                                    name: '50万以下',
                                    val: '0-50'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '50-80万',
                                    val: '50-80'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '80-100万',
                                    val: '80-100'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '100-120万',
                                    val: '100-120'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '120-150万',
                                    val: '120-150'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '150-200万',
                                    val: '150-200'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '200-300万',
                                    val: '200-300'

                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '300万以上',
                                    val: '300-0'
                                }
                            ]
                        },
                        {
                            name: '类型',
                            type: 'projectTypes',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'projectTypes',
                                    name: '住宅',
                                    val: 1
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '别墅',
                                    val: 2
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '商铺',
                                    val: 3
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '商住',
                                    val: 4
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '写字楼',
                                    val: 5
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '地下室',
                                    val: 6
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '市政工程',
                                    val: 7
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '车位',
                                    val: 8
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '其他',
                                    val: 9
                                }
                            ]
                        },
                        {
                            name: '销售状态',
                            type: 'statusList',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'statusList',
                                    name: '待售',
                                    val: 1
                                },
                                {
                                    qiuhao: 'statusList',
                                    name: '在售',
                                    val: 2
                                },
                                {
                                    qiuhao: 'statusList',
                                    name: '售罄',
                                    val: 3
                                }
                            ]
                        },
                        {
                            name: '装修',
                            type: 'decorateTypes',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '毛坯',
                                    val: 1
                                },
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '精装',
                                    val: 2
                                },
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '简装',
                                    val: 3
                                },
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '其他',
                                    val: 4
                                }
                            ]
                        }
                    ],
                    [{
                        name: '均价',
                        type: 'price',
                        data: [
                            {
                                qiuhao: 'price',
                                title: '不限',
                                name: '不限',
                                maxAveragePrice: '',
                                minAveragePrice: ''
                            },
                            {
                                qiuhao: 'price',
                                title: '6000以下',
                                name: '6000以下',
                                maxAveragePrice: '6000',
                                minAveragePrice: ''
                            },
                            {
                                qiuhao: 'price',
                                title: '6000-7500',
                                name: '6000-7500',
                                maxAveragePrice: '7500',
                                minAveragePrice: '6000'
                            },
                            {
                                qiuhao: 'price',
                                title: '7500-9000',
                                name: '7500-9000',
                                maxAveragePrice: '9000',
                                minAveragePrice: '7500'
                            },
                            {
                                qiuhao: 'price',
                                title: '9000-10000',
                                name: '9000-10000',
                                maxAveragePrice: '10000',
                                minAveragePrice: '9000'
                            },
                            {
                                qiuhao: 'price',
                                title: '10000-12000',
                                name: '10000-12000',
                                maxAveragePrice: '12000',
                                minAveragePrice: '10000'
                            },
                            {
                                qiuhao: 'price',
                                title: '12000以上',
                                name: '12000以上',
                                maxAveragePrice: '',
                                minAveragePrice: '12000'
                            },
                        ]
                    }],
                    [
                        {
                            name: '户型',
                            type: 'roomCount',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'roomCount',
                                    title: '不限',
                                    name: '不限',
                                    type: 1,
                                    value: '',
                                    val: ''
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '一居',
                                    name: '一居',
                                    type: 1,
                                    value: '1',
                                    val: '1'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '二居',
                                    name: '二居',
                                    type: 1,
                                    value: '2',
                                    val: '2'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '三居',
                                    name: '三居',
                                    type: 1,
                                    value: '3',
                                    val: '3'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '四居',
                                    name: '四居',
                                    type: 1,
                                    value: '4',
                                    val: '4'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '五居',
                                    name: '五居',
                                    type: 1,
                                    value: '5',
                                    val: '5'
                                },
                                {
                                    qiuhao: 'roomCount',
                                    title: '五居以上',
                                    name: '五居以上',
                                    type: 1,
                                    value: '6',
                                    val: '6'
                                }
                            ]
                        }
                    ],
                    [
                        {
                            name: '面积',
                            type: 'areas',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'areas',
                                    name: '50㎡以下',
                                    val: '0-50'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '50-70㎡',
                                    val: '50-70'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '70-90㎡',
                                    val: '70-90'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '90-120㎡',
                                    val: '90-120'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '110-130㎡',
                                    val: '110-130'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '130-150㎡',
                                    val: '130-150'
                                },
                                {
                                    qiuhao: 'areas',
                                    name: '150-180㎡',
                                    val: '150-180'

                                },
                                {
                                    qiuhao: 'areas',
                                    name: '200㎡以上',
                                    val: '200-0'
                                }
                            ]
                        },
                        {
                            name: '总预算',
                            type: 'totalPrice',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'totalPrice',
                                    name: '50万以下',
                                    val: '0-50'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '50-80万',
                                    val: '50-80'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '80-100万',
                                    val: '80-100'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '100-120万',
                                    val: '100-120'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '120-150万',
                                    val: '120-150'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '150-200万',
                                    val: '150-200'
                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '200-300万',
                                    val: '200-300'

                                },
                                {
                                    qiuhao: 'totalPrice',
                                    name: '300万以上',
                                    val: '300-0'
                                }
                            ]
                        },
                        {
                            name: '类型',
                            type: 'projectTypes',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'projectTypes',
                                    name: '住宅',
                                    val: 1
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '别墅',
                                    val: 2
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '商铺',
                                    val: 3
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '商住',
                                    val: 4
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '写字楼',
                                    val: 5
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '地下室',
                                    val: 6
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '市政工程',
                                    val: 7
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '车位',
                                    val: 8
                                },
                                {
                                    qiuhao: 'projectTypes',
                                    name: '其他',
                                    val: 9
                                }
                            ]
                        },
                        {
                            name: '销售状态',
                            type: 'statusList',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'statusList',
                                    name: '待售',
                                    val: 1
                                },
                                {
                                    qiuhao: 'statusList',
                                    name: '在售',
                                    val: 2
                                },
                                {
                                    qiuhao: 'statusList',
                                    name: '售罄',
                                    val: 3
                                }
                            ]
                        },
                        {
                            name: '装修',
                            type: 'decorateTypes',
                            multi: true,
                            data: [
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '毛坯',
                                    val: 1
                                },
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '精装',
                                    val: 2
                                },
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '简装',
                                    val: 3
                                },
                                {
                                    qiuhao: 'decorateTypes',
                                    name: '其他',
                                    val: 4
                                }
                            ]
                        }
                    ]


                ]
            })
        },
        // 筛选项
        setLevelHandleClickFun(e) {
            const {type, index} = e.currentTarget.dataset;
            switch (type) {
                case 'setOne':
                    this.setData({
                        filterOne: index,
                        filterTwo: 0,
                    });
                    this.openFilterFun();
                    break;
                case 'setTwo':
                    this.setData({
                        filterTwo: index
                    });
                    break;
            }
        },
        //  点击事件
        itemHandleClickFun(e) {
            const {item, multi, run} = e.currentTarget.dataset;
            if (multi) {
                let arr = this.data.params[item.qiuhao] || []
                let arr2 = this.data.paramsName[item.qiuhao] || []
                const idx = arr.indexOf(item.val);
                if (item.val) {
                    if (idx < 0) {
                        arr.push(item.val)
                        arr2.push(item.name)
                    } else {
                        arr.splice(idx, 1)
                        arr2.splice(idx, 1)
                    }
                } else {
                    arr = [];
                    arr2 = [];
                }
                this.setData({
                    [`params.${item.qiuhao}`]: arr,
                    [`paramsName.${item.qiuhao}`]: arr2,
                });
            } else {
                this.setData({
                    [`params.${item.qiuhao}`]: item.val,
                });
            }
        },
        // 排序
        sortHandleClickFun(e) {
            const {item, index} = e.currentTarget.dataset;
            this.setData({
                selectSort: index
            });
            // this.submitHandleFun();
        },
        // 价格
        priceHandleClickFun(e) {
            const {item} = e.currentTarget.dataset;
            this.setData({
                priceName: item.name,
                'params.minAveragePrice': item.minAveragePrice,
                'params.maxAveragePrice': item.maxAveragePrice,
            })
            // this.submitHandleFun();
        },
        // 删除选项
        close(e) {
            const { type, key, index } = e.currentTarget.dataset;
            if (type) {
                let params = this.data.params
                params.maxAveragePrice = ''
                params.minAveragePrice = ''
                this.setData({
                    params: params,
                    priceName: ''
                })
            } else {
                let data = this.data.params[key]
                let data2 = this.data.paramsName[key]
                data.splice(index, 1)
                data2.splice(index, 1)
                this.setData({
                    [`params.${key}`]: data,
                    [`paramsName.${key}`]: data2,
                })
            }
            this.submitHandleFun()
        },
        // 重置表单
        resetHandleFun() {
            this.setData({
                params: {
                    maxAveragePrice: this.data.params.maxAveragePrice,
                    minAveragePrice: this.data.params.minAveragePrice,
                    projectTypes: [],
                    statusList: [],
                    areas: [],
                    areaCode: '',
                    decorateTypes: [],
                    roomCount: this.data.params.roomCount,
                    totalPrice: [],
                },
                paramsName: {
                    projectTypes: [],
                    totalPrice: [],
                    statusList: [],
                    areas: [],
                    decorateTypes: [],
                    roomCount: this.data.paramsName.roomCount,
                },
                selectSort: this.data.selectSort,
                priceName: this.data.priceName,
            });
            this.submitHandleFun()
        },
        // 确定搜索
        submitHandleFun() {
            this.closeFilterFun();
            this.triggerEvent("change", {params: {...this.data.params}, sort: HOUSE_SORT[this.data.selectSort]});
        },
        // 打开筛选弹窗
        openFilterFun() {
            this.setData({
                showFilter: true
            });
        },
        // 关闭筛选弹窗
        closeFilterFun() {
            this.setData({
                showFilter: false
            });
        }
    }
});
