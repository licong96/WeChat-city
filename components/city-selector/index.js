// import { GetAllCityList, GetCityByStr } from '../../api/GetCity';
import cityData from './cityData';
import utk from './utk';

/**
 * 这里可以调接口从后端获取城市数据，拿到之后缓存起来，
 * 下次进入先读取缓存，如果没有缓存再出获取城市数据
 * 我这里演示用的是本地的数据文件，和接口请求的数据是一个原理
 */

Component({
  properties: {
  },
  data: {
    userInfo: {
      city: '南昌'
    },
    map: [
      // 这是需要的数据结构，如果后端能直接返回这样的结果，那你真是幸福，否则就要自己处理
      // {
      //   title: 'A',
      //   items: [
      //     { name: '城市' }
      //   ]
      // }
    ],
    params: {}, // 筛选条件
    onceTime: null,
    scrollTitle: 'A',
    scrollNavShow: false,
    scrollNavTop: '', // 侧边导航距离顶部位置
    scrollAnim: true, // 滚动动画，触摸的时候可以加，滑动的时候要去掉，否则有bug
  },
  created() {
    this.getLocation();     // 获取地理位置
    this.getCityData();     // 看出是否有城市缓存，决定要不要重新获取
  },
  ready() {
    this.getScrollNavTop(); // 获取侧边导航距离顶部位置
  },
  methods: {
    // 看出是否有城市缓存，决定要不要重新获取
    getCityData() {
      wx.getStorage({
        key: 'cityData',
        success: function (res) {
          if (res.data.length) {
            this.setData({
              map: res.data
            });
          } else {
            // this.GetAllCityList();       // 获取所有城市数据接口，这里是用接口请求的城市数据
            this.GetAllCityListLocality();  // 获取本地的城市数据，这里没有接口
          }
        }.bind(this),
        fail: function () {
          // this.GetAllCityList();
          this.GetAllCityListLocality()
        }.bind(this)
      })
    },
    // 获取本地的城市数据
    GetAllCityListLocality() {
      let directly = [
        {
          PY: 'B',
          name: '北京市',
          code: '11'
        }, {
          PY: 'T',
          name: '天津市',
          code: '12'
        }, {
          PY: 'S',
          name: '上海市',
          code: '31'
        }, {
          PY: 'C',
          name: '重庆市',
          code: '50'
        }
      ];
      let data = [].concat(directly);

      cityData.forEach(item => {
        if (item.name.indexOf('市') === -1 && item.children.length) {
          item.children.forEach(list => {
            data.push({
              PY: utk.ConvertPinyin(list.name).slice(0, 1),
              name: list.name,
              code: list.code
            })
          })
        }
      });

      // 把数据处理成理想中的结果
      this.filterMap(data, function(map) {
        // 缓存城市数据
        wx.setStorage({
          key: 'cityData',
          data: map
        })
      });
    },
    // 获取地理位置
    getLocation() {
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          // console.log(res)
          // 拿到经纬度之后，导入腾讯或百度地图中，拿城市，这个不难的
        },
        fail(err) {
          console.log('err', err)
        }
      })
    },
    // 获取所有城市数据接口
    GetAllCityList() {
      GetAllCityList().then(res => {
        console.log('城市', res)
        if (res.data.result === 'success') {
          let city = res.data.datalist;
          let data = [];

          city.forEach(item => {
            if (item.Child.length) {
              item.Child.forEach(list => {
                data.push({
                  PY: list.PY.substring(0, 1).toLocaleUpperCase(),
                  name: list.CityName,
                  id: list.ID
                })
              })
            }
          });

          this.filterMap(data, function (map) {
            // 缓存城市数据
            wx.setStorage({
              key: 'cityData',
              data: map
            })
          });
        }
      })
    },
    // 选中当前定位的城市
    bindLocation() {
      let { userInfo } = this.data;
      if (!userInfo.CityID) {
        return
      };

      this.triggerEvent('select', {
        value: {
          CityName: userInfo.city,
          CityID: userInfo.CityID
        }
      });
    },
    // 选中列表城市
    bindClick(e) {
      // console.log(e.target)
      let { name, id } = e.target.dataset;

      this.triggerEvent('select', {
        value: {
          CityName: name,
          CityID: id
        }
      });
    },
    // 搜索返回值
    bindQuery(e) {
      let likestr = e.detail.value;
      this.data.params.likestr = likestr;

      this.data.onceTime && (clearTimeout(this.data.onceTime));
      this.data.onceTime = setTimeout(() => {
        if (likestr) {
          // this.GetCityByStr(likestr);
        } else {
          // this.getCityData();
        }
      }, 200)
    },
    // 模糊搜索城市
    GetCityByStr(likestr) {
      this.setData({
        map: []
      });
      GetCityByStr({
        likestr
      }).then(res => {
        if (res.data.result === 'success') {
          let city = res.data.temptable;
          let data = [];

          if (!city.length) {
            return
          };

          city.forEach(item => {
            data.push({
              PY: item.PY.substring(0, 1).toLocaleUpperCase(),
              name: item.CityName,
              id: item.ID
            })
          });
          this.filterMap(data);     // 处理数据
        }
      })
    },
    // 获取侧边导航距离顶部位置
    getScrollNavTop() {
      let query = wx.createSelectorQuery().in(this)
      query.select('#navSide').boundingClientRect(function (res) {
        this.data.scrollNavTop = res.top;
      }.bind(this)).exec()
    },
    // 侧边栏触摸
    catchNavStart(e) {
      let { title } = e.target.dataset;
      let currentNodes = this.data.currentNodes;
      let {
        scrollTitle,
        scrollNavShow,
        scrollAnim
      } = this.data;

      this.setData({
        scrollAnim: true,
        scrollNavShow: true,
        scrollTitle: title,
      });

      // 一段时间之后隐藏选中的提示
      this.data.onceTime && (clearTimeout(this.data.onceTime))
      this.data.onceTime = setTimeout(() => {
        scrollNavShow = false;
        this.setData({
          scrollNavShow
        })
      }, 1000);
    },
    // 侧边栏滑动
    catchNavMove(e) {
      let clientY = e.touches[0].clientY;
      let {
        scrollNavTop,
        scrollTitle,
        scrollNavShow,
        scrollAnim,
        map
      } = this.data;
      let index = Math.ceil((clientY - scrollNavTop) / 20) - 1; // 20 是每个字幕的高度

      if (index >= 0 && index < map.length) {
        this.setData({
          scrollAnim: false,
          scrollNavShow: true,
          scrollTitle: map[index].title,
        });

        // 一段时间之后隐藏选中的提示
        this.data.onceTime && (clearTimeout(this.data.onceTime))
        this.data.onceTime = setTimeout(() => {
          scrollNavShow = false;
          this.setData({
            scrollNavShow
          })
        }, 1000);
      }
    },
    // 处理数据
    filterMap(data, callback) {
      let map = [],
        obj = {},
        element = '',
        type = this.data.currentType,
        title = '';

      for (let i = 0, length = data.length; i < length; i++) {
        title = data[i].PY;
        data[i].name = data[i].name;
        data[i].id = data[i].code;

        if (!obj[title]) {
          obj[title] = {
            title: title,
            items: [
              data[i]
            ]
          }
        } else {
          obj[title].items.push(data[i])
        }
      };

      // 变成有序列表
      for (let key in obj) {
        map.push(obj[key])
      };

      // 排序
      map.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      });

      this.setData({
        map
      });

      typeof callback === 'function' && callback(map);

      this.getScrollNavTop();   // 重新获取nav位置
    },
  }
});