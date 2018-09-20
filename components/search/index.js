
Component({
  properties: {
    height: {
      type: String,
      value: '120rpx'
    },
    placeholder: {
      type: String,
      value: '搜索关键字'
    },
    zIndex: {
      type: String,
      value: ''
    },
    hidden: {
      type: Boolean,
      value: false
    }
  },
  data: {
    query: '',    // 搜索的内容
  },
  created() {
  },
  methods: {
    // 监听input变化
    bindQuery(e) {
      // console.log(e)
      let value = e.detail.value
      this.setData({
        query: e.detail.value
      });
      this.triggerEvent('query', {
        value
      });
    },
    // 清空搜索内容
    bindClear() {
      this.setData({
        query: ''
      });
      this.triggerEvent('query', {
        value: ''
      });
    }
  },
});